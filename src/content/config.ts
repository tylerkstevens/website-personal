import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Written blog posts — full Markdown content, rendered as internal pages at /content/[slug]
const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    externalUrl: z.string().url().optional(),
    badge: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Conference talks and podcast appearances — card + external link only, no internal page
const appearancesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/appearances' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['talk', 'podcast']),
    description: z.string(),
    date: z.coerce.date(),
    url: z.string().url(),
    thumbnail: z.string().optional(),
    event: z.string().optional(),
  }),
});

export type PostSchema = z.infer<typeof postsCollection.schema>;
export type AppearanceSchema = z.infer<typeof appearancesCollection.schema>;

export const collections = {
  posts: postsCollection,
  appearances: appearancesCollection,
};
