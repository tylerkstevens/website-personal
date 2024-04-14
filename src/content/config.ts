import { z, defineCollection } from "astro:content";
const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
    tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
        message: 'tags must be unique',
    }).optional(),
});

const portfolioSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
    tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
        message: 'tags must be unique',
    }).optional(),
});


export type BlogSchema = z.infer<typeof blogSchema>;
export type PortfolioSchema = z.infer<typeof portfolioSchema>;

const blogCollection = defineCollection({ schema: blogSchema });
const portfolioCollection = defineCollection({ schema: portfolioSchema });

export const collections = {
    'blog': blogCollection,
    'portfolio': portfolioCollection
}