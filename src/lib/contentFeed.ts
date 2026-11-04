import { getCollection } from 'astro:content';
import createSlug from './createSlug';
import thumbManifest from '../data/content-thumbs.json';

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
}

type ThumbRecord = {
  file: string;
  width: number;
  height: number;
  source: string;
  isVideo: boolean;
};

const thumbs = thumbManifest as Record<string, ThumbRecord>;

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

export function resolveMedia(
  id: string,
  image: string | undefined,
  badge: string | undefined,
  externalUrl: string | undefined,
) {
  const fetched = thumbs[id];
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

  return {
    thumbnail,
    thumbnailFit,
    videoUrl: isVideo && externalUrl ? externalUrl : undefined,
  };
}

export async function getAllContent(): Promise<ContentItem[]> {
  const [posts, appearances] = await Promise.all([
    getCollection('posts'),
    getCollection('appearances'),
  ]);

  const items: ContentItem[] = [
    ...posts.map((post) => {
      const media = resolveMedia(post.id, post.data.heroImage, post.data.badge, post.data.externalUrl);
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
      };
    }),
    ...appearances.map((appearance) => {
      const badge = appearance.data.type === 'podcast' ? 'PODCAST' : 'TALK';
      const media = resolveMedia(appearance.id, appearance.data.thumbnail, badge, appearance.data.url);
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
      };
    }),
  ];

  items.sort((a, b) => b.date.valueOf() - a.date.valueOf());
  return items;
}
