import { getCollection } from 'astro:content';
import createSlug from './createSlug';
import { pickQuote } from './pickQuote';
import thumbManifest from '../data/content-thumbs.json';
import cardManifest from '../data/content-cards.json';

export interface SpeakerAvatar {
  name: string;
  src: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'post' | 'talk' | 'podcast';
  url: string;
  thumbnail?: string;
  thumbnailFit: 'cover' | 'contain';
  badge?: string;
  videoUrl?: string;
  fallback?: 'quote' | 'audio';
  quote?: string;
  avatars?: SpeakerAvatar[];
}

type ThumbRecord = {
  file: string;
  width: number;
  height: number;
  source: string;
  isVideo: boolean;
};

type CardRecord = {
  kind?: 'audio' | 'quote';
  sourceText?: string;
  avatars?: SpeakerAvatar[];
};

const thumbs = thumbManifest as Record<string, ThumbRecord>;
const cards = cardManifest as Record<string, CardRecord>;

function isAudioPost(badge: string | undefined, title: string, manifestKind?: string) {
  if (manifestKind === 'audio') return true;
  const label = (badge || '').toUpperCase();
  if (label === 'AUDIO' || label === 'AMA') return true;
  return /\bAMA\b/i.test(title);
}

function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] || null;
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/watch')) return parsed.searchParams.get('v');
      const [kind, id] = parsed.pathname.split('/').filter(Boolean);
      if (kind === 'live' || kind === 'embed' || kind === 'shorts') return id || null;
    }
  } catch {
    return null;
  }
  return null;
}

function usableLocal(src?: string) {
  return Boolean(src && src.trim() && !src.startsWith('/logos/'));
}

export function resolveMedia(input: {
  id: string;
  image?: string;
  badge?: string;
  externalUrl?: string;
  title: string;
  body?: string;
  cardQuote?: string;
}) {
  const { id, image, badge, externalUrl, title, body, cardQuote } = input;
  const fetched = thumbs[id];
  const card = cards[id];
  let thumbnail: string | undefined;
  let thumbnailFit: 'cover' | 'contain' = 'cover';

  if (usableLocal(image)) {
    thumbnail = image;
  } else if (fetched?.file) {
    thumbnail = `/content-thumbs/${fetched.file}`;
    if (fetched.width > 0 && fetched.height > 0 && fetched.width / fetched.height < 1.25) {
      thumbnailFit = 'contain';
    }
  }

  const isVideo = Boolean(
    fetched?.isVideo ||
      badge?.toUpperCase() === 'VIDEO' ||
      (externalUrl ? youtubeId(externalUrl) : null),
  );

  let fallback: 'quote' | 'audio' | undefined;
  let quote: string | undefined;
  let avatars: SpeakerAvatar[] | undefined;
  if (!thumbnail) {
    if (isAudioPost(badge, title, card?.kind)) {
      fallback = 'audio';
      avatars = card?.avatars?.filter((avatar) => avatar.src && !avatar.src.startsWith('http'));
    } else {
      quote = pickQuote({ cardQuote, body, sourceText: card?.sourceText, title });
      if (quote) fallback = 'quote';
    }
  }

  return {
    thumbnail,
    thumbnailFit,
    videoUrl: isVideo && externalUrl ? externalUrl : undefined,
    fallback,
    quote,
    avatars,
  };
}

export async function getAllContent(): Promise<ContentItem[]> {
  const [posts, appearances] = await Promise.all([
    getCollection('posts'),
    getCollection('appearances'),
  ]);

  const items: ContentItem[] = [
    ...posts.map((post) => {
      const media = resolveMedia({
        id: post.id,
        image: post.data.heroImage,
        badge: post.data.badge,
        externalUrl: post.data.externalUrl,
        title: post.data.title,
        body: post.body,
        cardQuote: post.data.cardQuote,
      });
      return {
        id: post.id,
        title: post.data.title,
        description: post.data.description,
        date: post.data.pubDate,
        type: 'post' as const,
        url: post.data.externalUrl ?? `/content/${createSlug(post.data.title, post.id)}`,
        thumbnail: media.thumbnail,
        thumbnailFit: media.thumbnailFit,
        badge: post.data.badge,
        videoUrl: media.videoUrl,
        fallback: media.fallback,
        quote: media.quote,
        avatars: media.avatars,
      };
    }),
    ...appearances.map((appearance) => {
      const badge = appearance.data.type === 'podcast' ? 'PODCAST' : 'TALK';
      const media = resolveMedia({
        id: appearance.id,
        image: appearance.data.thumbnail,
        badge,
        externalUrl: appearance.data.url,
        title: appearance.data.title,
        body: appearance.body,
      });
      return {
        id: appearance.id,
        title: appearance.data.title,
        description: appearance.data.description,
        date: appearance.data.date,
        type: appearance.data.type,
        url: appearance.data.url,
        thumbnail: media.thumbnail,
        thumbnailFit: media.thumbnailFit,
        badge,
        videoUrl: media.videoUrl,
        fallback: media.fallback,
        quote: media.quote,
        avatars: media.avatars,
      };
    }),
  ];

  items.sort((a, b) => b.date.valueOf() - a.date.valueOf());
  return items;
}
