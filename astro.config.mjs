import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tylerstevens.me',
  // Astro 7 defaults compressHTML to 'jsx', which drops spaces between inline elements.
  // Keep the previous HTML whitespace behavior.
  compressHTML: true,
  integrations: [mdx(), sitemap()]
});
