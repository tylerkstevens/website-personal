/**
 * Download content-card thumbnails into public/content-thumbs and write
 * src/data/content-thumbs.json.
 *
 * YouTube → maxresdefault, then hqdefault.
 * X posts → video preview (or photo) from the public syndication payload.
 * Other podcasts/articles → the page og:image / twitter:image.
 *
 * Posts that already have a non-logo image in the repo are left alone.
 * Posts with no image get a generated card record in src/data/content-cards.json:
 * audio posts store locally saved speaker avatars; text posts store the
 * author's own X text when the markdown body has no sentence to quote.
 * Run: node scripts/fetch-content-thumbs.mjs
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const OUT_DIR = path.join(ROOT, 'public/content-thumbs');
const AVATAR_DIR = path.join(OUT_DIR, 'avatars');
const MANIFEST_PATH = path.join(ROOT, 'src/data/content-thumbs.json');
const CARDS_PATH = path.join(ROOT, 'src/data/content-cards.json');
const MIN_WIDTH = 400;
const UA = 'Mozilla/5.0 (compatible; tylerstevens-thumbnails/1.0; +https://tylerstevens.me)';

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return {};
  const fm = text.split('---', 2)[1] ?? '';
  const data = {};
  for (const line of fm.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    data[key] = value;
  }
  return data;
}

function isUsableLocal(src) {
  return Boolean(src && src.trim() && !src.startsWith('/logos/'));
}

function youtubeId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || null;
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (u.pathname.startsWith('/watch')) return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'live' || parts[0] === 'embed' || parts[0] === 'shorts') return parts[1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function xStatusId(url) {
  const match = url.match(/(?:x\.com|twitter\.com)\/[^/?#]+\/status\/(\d+)/);
  return match?.[1] ?? null;
}

function syndicationToken(id) {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

async function fetchBuffer(url, extraHeaders = {}) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': UA, accept: 'image/*,*/*', ...extraHeaders },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) throw new Error(`tiny response (${buf.length}b) for ${url}`);
  return buf;
}

async function saveWebp(buf, id) {
  const image = sharp(buf, { animated: false }).rotate();
  const meta = await image.metadata();
  if (!meta.width || meta.width < MIN_WIDTH) {
    throw new Error(`image too small (${meta.width || 0}px)`);
  }
  const out = await image
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const saved = await sharp(out).metadata();
  const file = `${id}.webp`;
  await writeFile(path.join(OUT_DIR, file), out);
  return { file, width: saved.width || meta.width, height: saved.height || meta.height };
}

async function youtubeThumb(url) {
  const id = youtubeId(url);
  if (!id) return null;
  const names = ['maxresdefault', 'hqdefault'];
  let lastError;
  for (const name of names) {
    const imgUrl = `https://i.ytimg.com/vi/${id}/${name}.jpg`;
    try {
      const buf = await fetchBuffer(imgUrl);
      const meta = await sharp(buf).metadata();
      if (!meta.width || meta.width < MIN_WIDTH) {
        lastError = new Error(`${name} is ${meta.width || 0}px`);
        continue;
      }
      return { buf, source: 'youtube', isVideo: true, from: name };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('no youtube thumbnail');
}

function largestMedia(details) {
  const usable = (details || []).filter((m) => m?.media_url_https && (m.type === 'video' || m.type === 'photo'));
  usable.sort((a, b) => (b.original_info?.width || 0) - (a.original_info?.width || 0));
  return usable[0] || null;
}

function cardImage(card) {
  const values = card?.binding_values;
  if (!values) return null;
  let best = null;
  for (const value of Object.values(values)) {
    const image = value?.image_value;
    if (!image?.url) continue;
    const width = image.width || 0;
    if (!best || width > best.width) best = { url: image.url, width };
  }
  if (!best || best.width < MIN_WIDTH) return null;
  return best.url;
}

async function xThumb(url) {
  const id = xStatusId(url);
  if (!id) return null;
  const endpoint = `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${syndicationToken(id)}`;
  const res = await fetch(endpoint, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': UA, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`syndication HTTP ${res.status}`);
  const tweet = await res.json();
  const media = largestMedia(tweet.mediaDetails) || largestMedia(tweet.quoted_tweet?.mediaDetails);
  if (media) {
    const buf = await fetchBuffer(media.media_url_https);
    return {
      buf,
      source: media.type === 'video' ? 'x-video' : 'x-photo',
      isVideo: media.type === 'video',
    };
  }
  const fromCard = cardImage(tweet.card);
  if (fromCard) {
    const buf = await fetchBuffer(fromCard);
    return { buf, source: 'x-card', isVideo: false };
  }
  // Replies sometimes only link out to a YouTube video or an X broadcast.
  for (const expandedUrl of tweet.entities?.urls?.map((u) => u.expanded_url).filter(Boolean) ?? []) {
    if (youtubeId(expandedUrl)) return youtubeThumb(expandedUrl);
    if (/\/i\/broadcasts\//.test(expandedUrl)) {
      const og = await ogThumb(expandedUrl);
      if (og) return { ...og, source: 'x-video', isVideo: true };
    }
  }
  return null;
}

function metaContent(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function ogThumb(pageUrl) {
  const res = await fetch(pageUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
    headers: {
      'user-agent': UA,
      accept: 'text/html',
    },
  });
  if (!res.ok) throw new Error(`page HTTP ${res.status}`);
  const html = await res.text();
  const raw = metaContent(html, 'og:image') || metaContent(html, 'twitter:image');
  if (!raw) return null;
  const imgUrl = new URL(raw.replace(/&amp;/g, '&'), res.url).href;
  const buf = await fetchBuffer(imgUrl);
  return { buf, source: 'og', isVideo: false };
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

const files = (await readdir(POSTS_DIR)).filter((name) => name.endsWith('.md'));
const posts = [];
for (const file of files) {
  const id = file.replace(/\.md$/, '');
  const text = await readFile(path.join(POSTS_DIR, file), 'utf8');
  const data = parseFrontmatter(text);
  const body = text.split(/\n---\n/)[1] || '';
  posts.push({
    id,
    title: data.title || '',
    heroImage: data.heroImage || '',
    externalUrl: data.externalUrl || '',
    badge: data.badge || '',
    body,
  });
}

await mkdir(OUT_DIR, { recursive: true });
await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
const manifest = {};
const skipped = [];
const failed = [];

await mapPool(posts, 5, async (post) => {
  if (isUsableLocal(post.heroImage)) {
    skipped.push(`${post.id} local ${post.heroImage}`);
    return;
  }
  if (!post.externalUrl) {
    skipped.push(`${post.id} no image (fallback)`);
    return;
  }
  try {
    let found = null;
    if (youtubeId(post.externalUrl)) found = await youtubeThumb(post.externalUrl);
    else if (xStatusId(post.externalUrl)) found = await xThumb(post.externalUrl);
    else found = await ogThumb(post.externalUrl);

    if (!found) {
      skipped.push(`${post.id} no remote image`);
      return;
    }
    const saved = await saveWebp(found.buf, post.id);
    manifest[post.id] = {
      file: saved.file,
      width: saved.width,
      height: saved.height,
      source: found.source,
      isVideo: Boolean(found.isVideo || post.badge === 'VIDEO'),
    };
    console.log(`ok ${post.id} ${found.source}${found.from ? ':' + found.from : ''} ${saved.width}x${saved.height}`);
  } catch (error) {
    failed.push(`${post.id} ${error.message}`);
    console.error(`fail ${post.id}: ${error.message}`);
  }
});

async function fetchTweet(url) {
  const id = xStatusId(url);
  if (!id) return null;
  const endpoint = `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${syndicationToken(id)}`;
  const res = await fetch(endpoint, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': UA, accept: 'application/json' },
  });
  if (!res.ok) return null;
  return res.json();
}

function hiResAvatar(url) {
  return url.replace(/_(?:normal|bigger|mini)(\.\w+)$/, '_400x400$1');
}

const savedAvatars = new Map();

async function writeAvatar(buf, handle, name) {
  const key = handle.toLowerCase();
  const file = `${key}.webp`;
  await sharp(buf).resize(160, 160, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toFile(path.join(AVATAR_DIR, file));
  const record = { name: name || (key === 'tylerkstevens' ? 'Tyler Stevens' : handle), src: `/content-thumbs/avatars/${file}` };
  savedAvatars.set(key, record);
  return record;
}

async function avatarFromUrl(imageUrl, handle, name) {
  const key = handle.toLowerCase();
  if (savedAvatars.has(key)) {
    const existing = savedAvatars.get(key);
    if (name && existing.name === handle) existing.name = name;
    return existing;
  }
  try {
    const buf = await fetchBuffer(hiResAvatar(imageUrl));
    return writeAvatar(buf, handle, name);
  } catch {
    try {
      const buf = await fetchBuffer(imageUrl);
      return writeAvatar(buf, handle, name);
    } catch {
      return null;
    }
  }
}

async function avatarFromHandle(handle) {
  const key = handle.toLowerCase();
  if (savedAvatars.has(key)) return savedAvatars.get(key);
  try {
    const res = await fetch(`https://unavatar.io/x/${handle}?fallback=false`, {
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(15000),
    });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 400) return null;
    return writeAvatar(buf, handle);
  } catch {
    return null;
  }
}

function wantsAudio(post, tweet) {
  const badge = post.badge.toUpperCase();
  if (badge === 'AUDIO' || badge === 'AMA') return true;
  if (/\bAMA\b/i.test(post.title)) return true;
  return Boolean(tweet?.card?.name?.includes('audiospace'));
}

await mkdir(AVATAR_DIR, { recursive: true });
const cardRecords = {};
for (const post of posts) {
  if (isUsableLocal(post.heroImage) || manifest[post.id]?.file) continue;
  const tweet = xStatusId(post.externalUrl) ? await fetchTweet(post.externalUrl) : null;
  if (!wantsAudio(post, tweet)) {
    const sourceText = tweet?.note_tweet?.text || tweet?.text;
    if (sourceText && !/^https?:\/\//.test(sourceText.trim())) {
      cardRecords[post.id] = { sourceText };
      console.log(`quote-source ${post.id}`);
    }
    continue;
  }
  const avatars = [];
  const seen = new Set();
  const add = (record) => {
    if (!record?.src || seen.has(record.src)) return;
    seen.add(record.src);
    avatars.push({ name: record.name, src: record.src });
  };
  if (tweet?.user?.profile_image_url_https) {
    add(await avatarFromUrl(tweet.user.profile_image_url_https, tweet.user.screen_name, tweet.user.name));
  }
  add(await avatarFromHandle('tylerkstevens'));
  const mentions = [...(tweet?.text || '').matchAll(/@([A-Za-z0-9_]{1,15})/g)].map((match) => match[1]);
  for (const handle of mentions) {
    if (avatars.length >= 6) break;
    if (handle.toLowerCase() === 'bitblockboom') continue;
    add(await avatarFromHandle(handle));
  }
  if (!avatars.some((avatar) => avatar.src.endsWith('/tylerkstevens.webp'))) {
    const tyler = await avatarFromHandle('tylerkstevens');
    if (tyler) avatars.unshift({ name: tyler.name, src: tyler.src });
  }
  cardRecords[post.id] = { kind: 'audio', avatars: avatars.slice(0, 6) };
  console.log(`audio ${post.id} avatars ${avatars.map((avatar) => avatar.name).join(', ') || 'none'}`);
}

const orderedCards = Object.fromEntries(Object.entries(cardRecords).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })));
await writeFile(CARDS_PATH, JSON.stringify(orderedCards, null, 2) + '\n');

const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })));
await writeFile(MANIFEST_PATH, JSON.stringify(ordered, null, 2) + '\n');
console.log(`\nsaved ${Object.keys(ordered).length} thumbnails`);
console.log(`skipped ${skipped.length}`);
for (const line of skipped) console.log('  skip ' + line);
if (failed.length) {
  console.log('failed:');
  for (const line of failed) console.log('  ' + line);
}
