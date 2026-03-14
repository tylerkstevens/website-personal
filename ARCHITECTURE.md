# Architecture: tylerstevens.me Overhaul

> **Source of truth**: See [SPEC.md](SPEC.md) for full requirements.
> **Goal**: Rebuild the personal site with a clean editorial design, Astro 5, GitHub Pages hosting, and a unified content system covering posts, talks, and podcasts.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
│                         (main branch)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ push to main
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                          │
│              .github/workflows/deploy.yml                        │
│   pnpm install → pnpm build → deploy dist/ to gh-pages          │
└────────────────────────────┬────────────────────────────────────┘
                             │ deploys static files
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Pages                                  │
│              Custom domain: tylerstevens.me                      │
│              CNAME: public/CNAME → tylerstevens.me              │
└─────────────────────────────────────────────────────────────────┘

                    ┌── Astro 5 Build ──────────────────────────┐
                    │                                             │
   src/content/     │   Content Layer API                         │
   ├── posts/       │   getCollection('posts')    ──►  /content   │
   │   └── *.md     │   getCollection('appearances') ─► /content  │
   └── appearances/ │                                             │
       └── *.md     │   Static Site Generation (SSG)             │
                    │   Output: dist/ (pure HTML/CSS/JS)          │
                    └─────────────────────────────────────────────┘

   Page Routes:
   /                 ← index.astro  (Hero + Project Cards + Recent Content)
   /about            ← about.astro  (Bio + Roles + Timeline)
   /content          ← content/[...page].astro  (Unified feed, client-side filter)
   /content/[slug]   ← content/[slug].astro  (Full post pages only)
   /contact          ← contact.astro
   /404              ← 404.astro
   /rss.xml          ← rss.xml.js
   /blog             ← blog/index.astro  (redirect → /content)
   /blog/[slug]      ← blog/[slug].astro (redirect → /content/[slug])
   /resume           ← resume.astro      (redirect → /about)
   /llms.txt         ← public/llms.txt
```

---

## Component Hierarchy

```
BaseLayout.astro
├── BaseHead.astro          (meta, OG, JSON-LD, font imports)
├── Header.astro            (mobile hamburger trigger only)
├── SideBar.astro
│   ├── SideBarMenu.astro   (4-item nav: Home/About/Content/Contact)
│   ├── SideBarFooter.astro
│   └── ThemeToggle.astro   (system/light/dark — keep logic, restyle)
├── <slot />                (page content injected here)
└── Footer.astro

Page-specific components:
├── ProjectCard.astro       (NEW — logo + role + name + desc + link)
├── ContentCard.astro       (NEW — unified card for post/talk/podcast)
├── ContentFilter.astro     (NEW — All/Posts/Talks/Podcasts tab bar)
├── HorizontalCard.astro    (UPDATE — restyle, remove tag_url logic)
├── TimeLine.astro          (MOVE — from resume/ subdir to components/)
└── ContentLayout.astro     (RENAME from PostLayout — full post pages)
```

**Delete:**
- `src/components/Card.astro` — portfolio only
- `src/layouts/PortfolioLayout.astro` — portfolio only

---

## Content Collection Design

### ADR: Two Collections vs. One Unified Collection

**Option A — Single `content` collection with `type` discriminator**
- Pros: Single `getCollection` call, simple merge
- Cons: `url` required for talks/podcasts but optional for posts — Zod discriminated union gets messy; `body` is meaningless for appearances

**Option B — Two separate collections: `posts` + `appearances`** ✅ Recommended
- Pros: Clean schemas, enforced required fields, clear separation of concerns
- Cons: Must merge + sort at query time (trivial — one `sort` call)

The schemas are semantically different: posts have full Markdown body content; appearances are pure metadata with an external URL. Two collections is the correct model.

---

### Schema Definitions (`src/content/config.ts`)

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Written blog posts — full Markdown content, internal detail page
const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Talks and podcast appearances — metadata + external URL, no internal page
const appearancesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/appearances' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['talk', 'podcast']),
    description: z.string(),
    date: z.coerce.date(),
    url: z.string().url(),                 // required — links to YouTube, podcast, etc.
    thumbnail: z.string().optional(),      // path relative to public/, e.g. /blogimages/...
    event: z.string().optional(),          // e.g. "Bitcoin 2024 Conference"
  }),
});

export const collections = {
  posts: postsCollection,
  appearances: appearancesCollection,
};
```

**Migration note**: rename `src/content/blog/` → `src/content/posts/`. All 32 existing posts keep their files and frontmatter, just move directory.

---

### Astro 5 Content Layer API Changes

Astro 5 introduces a new Content Layer API. Key differences from Astro 4:

| Astro 4 | Astro 5 |
|---------|---------|
| `defineCollection({ schema })` | `defineCollection({ loader: glob(...), schema })` |
| `post.slug` | `post.id` (filename-derived) |
| `entry.render()` method on entry | `import { render } from 'astro:content'` then `render(entry)` |
| `export async function get()` in rss.xml | `export async function GET()` (uppercase) |
| `getStaticPaths` unchanged | unchanged |
| `getCollection('blog')` | `getCollection('posts')` (renamed) |

**Slug handling**: In Astro 5, `entry.id` is the filename without extension (e.g., `post1`). For URLs, use `entry.id` directly or generate from title via the existing `createSlug.ts` utility.

---

## Data Flow

### Homepage — Recent Content Section
```
getCollection('posts')     ──┐
                              ├── merge → sort by date desc → slice(0, 3)
getCollection('appearances')─┘                                     │
                                                                    ▼
                                                         3x ContentCard.astro
```

### Content Page (`/content/[...page].astro`)
```
getCollection('posts')     ──┐
                              ├── merge → sort by date desc → paginate(10)
getCollection('appearances')─┘         │
                                        ▼
                           ContentFilter.astro (client-side JS)
                           renders all cards with data-type attribute
                           filter tabs hide/show via CSS class toggle
```

### Client-Side Filtering
Since the site is static (no SSR), filtering is done in the browser:
- All content cards rendered in HTML with `data-type="post|talk|podcast"` attribute
- Filter tabs call a small inline `<script>` that toggles `hidden` class on cards
- No full page reload needed
- Degrades gracefully if JS is disabled (shows all content)

```
┌──────────────────────────────────────────────────┐
│  [All] [Posts] [Talks] [Podcasts]                │
│  (active tab highlighted)                        │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Post     │ │ Podcast  │ │ Talk     │  ...     │
│  │ card     │ │ card     │ │ card     │          │
│  └──────────┘ └──────────┘ └──────────┘         │
└──────────────────────────────────────────────────┘
```

### RSS Feed
```
getCollection('posts') → filter type:post → map to RSS items
→ links updated to /content/[id]/
→ rss.xml exported at /rss.xml
```

---

## Routing Map

### Active Routes (new)
| File | URL | Notes |
|------|-----|-------|
| `src/pages/index.astro` | `/` | Rebuilt homepage |
| `src/pages/about.astro` | `/about` | Story page (replaces resume) |
| `src/pages/content/[...page].astro` | `/content`, `/content/2`, etc. | Paginated feed |
| `src/pages/content/[slug].astro` | `/content/post1`, etc. | Posts only |
| `src/pages/contact.astro` | `/contact` | Updated links |
| `src/pages/404.astro` | `/404` | Keep as-is |
| `src/pages/rss.xml.js` | `/rss.xml` | Updated collection ref |

### Redirect Routes (SEO preservation)
| File | Old URL | Redirects To |
|------|---------|--------------|
| `src/pages/blog/index.astro` | `/blog` | `/content` |
| `src/pages/blog/[slug].astro` | `/blog/[slug]` | `/content/[slug]` |
| `src/pages/resume.astro` | `/resume` | `/about` |

**Redirect implementation** (GitHub Pages has no server redirect support):
```astro
---
// e.g. src/pages/blog/index.astro
const redirectTo = "/content";
---
<meta http-equiv="refresh" content={`0; url=${redirectTo}`} />
<script>window.location.replace("{redirectTo}")</script>
<p>Redirecting to <a href={redirectTo}>{redirectTo}</a>...</p>
```

For `/blog/[slug]` → `/content/[slug]`, use `getStaticPaths` to generate a redirect page per post ID.

### Deleted Routes
- `src/pages/portfolio/` (all files)
- `src/pages/support-my-work.astro`
- `src/content/portfolio/` (all 4 files)

---

## Visual Design System

### DaisyUI Theme Configuration (`tailwind.config.cjs`)
Replace current `lofi`/`black` themes with custom editorial themes:

```js
daisyui: {
  themes: [
    {
      editorial_light: {
        "base-100": "#FAFAF8",   // off-white paper
        "base-200": "#F0EFEC",
        "base-300": "#E5E3DE",
        "base-content": "#1A1A18",  // near-black text
        "neutral": "#6B6A66",
        "primary": "#1A1A18",
        "secondary": "#6B6A66",
        "accent": "#6B6A66",
      },
      editorial_dark: {
        "base-100": "#131312",   // near-black
        "base-200": "#1C1C1A",
        "base-300": "#252523",
        "base-content": "#F0EFEC",  // off-white text
        "neutral": "#9A9994",
        "primary": "#F0EFEC",
        "secondary": "#9A9994",
        "accent": "#9A9994",
      },
    }
  ],
}
```

Update theme map in `BaseLayout.astro`:
```js
const themeMap = {
  'light': 'editorial_light',
  'dark': 'editorial_dark',
  'system': getSystemTheme() === 'dark' ? 'editorial_dark' : 'editorial_light'
};
```

### Font Loading (`BaseHead.astro`)
Use `@fontsource/inter` package (no external request, works on GitHub Pages):
```
pnpm add @fontsource/inter
```
Import in `src/styles/global.css`:
```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/700.css';

body { font-family: 'Inter', system-ui, sans-serif; }
code, pre, .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
```

---

## GitHub Actions CI/CD

### `.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### `public/CNAME`
```
tylerstevens.me
```

### `astro.config.mjs` updates
```js
export default defineConfig({
  site: 'https://tylerstevens.me',
  // ...
});
```

---

## New Components Specification

### `ProjectCard.astro`
**Props**: `logo: string`, `role: string`, `name: string`, `description: string`, `url: string`

```
┌──────────────────────────────────────────┐
│  [LOGO]   Name                           │
│           Role (muted text)              │
│           Description text here.        │
│           ↗ Visit (external link)        │
└──────────────────────────────────────────┘
```
- Logo: `<Image>` component, fixed size (e.g., 48x48)
- Role label: small, muted typography
- Links open in `target="_blank"` with `rel="noopener noreferrer"`

### `ContentCard.astro`
**Props**: `title: string`, `description: string`, `date: Date`, `type: 'post' | 'talk' | 'podcast'`, `url: string`, `slug?: string`, `thumbnail?: string`

- If `type === 'post'`: link goes to `/content/[slug]`
- If `type === 'talk' | 'podcast'`: link goes to external `url`, opens in new tab
- Shows type badge: `Post` / `Talk` / `Podcast`
- `data-type` attribute on root element for client-side filtering

```
┌──────────────────────────────────────────────┐
│  [thumbnail]  [POST badge]  Title            │
│               Date · description text...     │
└──────────────────────────────────────────────┘
```

### `ContentFilter.astro`
**Props**: none (self-contained with inline script)

Renders tab bar, manages active state, filters `.content-card` elements by `data-type`:
```html
<div id="content-filters">
  <button data-filter="all" class="active">All</button>
  <button data-filter="post">Posts</button>
  <button data-filter="talk">Talks</button>
  <button data-filter="podcast">Podcasts</button>
</div>
<script>
  // client-side filtering logic
</script>
```

---

## SEO & Technical Optimizations

### JSON-LD (in `BaseHead.astro`)
Add `<script type="application/ld+json">` for Person schema on all pages:
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Tyler Stevens",
  "url": "https://tylerstevens.me",
  "sameAs": [
    "https://twitter.com/tylerkstevens",
    "https://github.com/tylerkstevens",
    "https://exergy.energy"
  ],
  "jobTitle": "Founder & CEO",
  "worksFor": { "@type": "Organization", "name": "Exergy" }
}
```

### `public/llms.txt`
Plain-text file at site root for AI agent discovery:
```
# Tyler Stevens — tylerstevens.me

Tyler Stevens is a builder in the Bitcoin and energy sectors.
Founder & CEO of Exergy (https://exergy.energy) — hashrate heating.
Board Member of 256 Foundation (https://256foundation.org).
Founder of Hashrate Heatpunks (https://heatpunks.org).
Co-Founder of The Space (https://denver.space).
Author of "Bitcoin Mining Heat Reuse" (https://braiins.com/books/bitcoin-mining-heat-reuse).

## Pages
- Home: https://tylerstevens.me
- About: https://tylerstevens.me/about
- Content: https://tylerstevens.me/content
- Contact: https://tylerstevens.me/contact
- RSS: https://tylerstevens.me/rss.xml
```

### `public/_headers` (Security Headers)
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Note**: GitHub Pages respects a `_headers` file for Netlify-style headers. However, GitHub Pages does NOT natively support `_headers` — this works on Netlify/Cloudflare Pages. For GitHub Pages, these headers cannot be set at the CDN level from the repo. Document this limitation; the headers file can be kept for future migration to Netlify/Cloudflare.

---

## File Structure After Overhaul

```
website-personal/
├── .github/
│   └── workflows/
│       └── deploy.yml                  NEW
├── public/
│   ├── CNAME                           NEW — tylerstevens.me
│   ├── _headers                        NEW — security headers
│   ├── llms.txt                        NEW — AI agent parsing
│   ├── profile.webp                    UPDATE — Tyler provides new photo
│   ├── favicon/
│   ├── blogimages/                     KEEP
│   └── logos/
│       ├── exergy.svg (or .webp)       UPDATE — Tyler provides
│       ├── 256-foundation.svg          NEW — Tyler provides
│       ├── heatpunks.svg               NEW — Tyler provides
│       ├── the-space.svg               UPDATE — Tyler provides
│       └── book-cover.webp             NEW — Tyler provides
├── src/
│   ├── components/
│   │   ├── BaseHead.astro              UPDATE — JSON-LD, Inter font
│   │   ├── Header.astro                UPDATE — restyle
│   │   ├── Footer.astro                UPDATE — restyle
│   │   ├── SideBar.astro               UPDATE — restyle
│   │   ├── SideBarMenu.astro           UPDATE — 4 items only
│   │   ├── SideBarFooter.astro         UPDATE — restyle
│   │   ├── ThemeToggle.astro           UPDATE — restyle, same logic
│   │   ├── HorizontalCard.astro        UPDATE — restyle, remove tag_url
│   │   ├── TimeLine.astro              MOVE from resume/ subdir
│   │   ├── ProjectCard.astro           NEW
│   │   ├── ContentCard.astro           NEW
│   │   └── ContentFilter.astro         NEW
│   ├── content/
│   │   ├── config.ts                   REWRITE — Astro 5 schema
│   │   ├── posts/                      RENAME from blog/
│   │   │   ├── post1.md … post33.md    KEEP ALL (32 posts)
│   │   └── appearances/                NEW directory
│   │       └── (empty, Tyler populates)
│   ├── layouts/
│   │   ├── BaseLayout.astro            UPDATE — new themes, fonts
│   │   └── ContentLayout.astro         RENAME from PostLayout.astro
│   ├── lib/
│   │   └── createSlug.ts               KEEP
│   ├── pages/
│   │   ├── index.astro                 REWRITE
│   │   ├── about.astro                 REWRITE (was resume.astro)
│   │   ├── contact.astro               UPDATE — Signal, no LinkedIn
│   │   ├── 404.astro                   UPDATE — restyle
│   │   ├── rss.xml.js                  UPDATE — new collection name + GET
│   │   ├── content/
│   │   │   ├── [...page].astro         NEW — unified paginated feed
│   │   │   └── [slug].astro            NEW — post detail pages
│   │   ├── blog/
│   │   │   ├── index.astro             NEW — redirect to /content
│   │   │   └── [slug].astro            NEW — redirect to /content/[slug]
│   │   └── resume.astro                UPDATE — redirect to /about
│   ├── styles/
│   │   └── global.css                  UPDATE — Inter import, base styles
│   ├── config.ts                       UPDATE — title, desc, new constants
│   └── env.d.ts                        KEEP
├── astro.config.mjs                    UPDATE — site URL, Astro 5 config
├── tailwind.config.cjs                 UPDATE — custom DaisyUI themes
├── package.json                        UPDATE — Astro 5, new deps
├── SPEC.md                             (reference)
└── ARCHITECTURE.md                     (this file)

DELETE:
├── src/pages/portfolio/                (all files)
├── src/pages/support-my-work.astro
├── src/content/portfolio/              (all files)
├── src/layouts/PortfolioLayout.astro
└── src/components/Card.astro
```

---

## Implementation Phases

### Phase 1 — Foundation (Astro 5 + Deploy Pipeline)
1. Upgrade `package.json`: `astro@^5`, `@astrojs/tailwind`, `daisyui`, `@fontsource/inter`
2. Run `pnpm install`, resolve any peer dep conflicts
3. Update `src/content/config.ts` — Astro 5 Content Layer API, rename `blog` → `posts`
4. Rename `src/content/blog/` → `src/content/posts/`
5. Create `src/content/appearances/` directory with a `.gitkeep`
6. Fix any breaking Astro 5 API changes (`entry.slug` → `entry.id`, `render()` import, `GET` in rss.xml)
7. Add `.github/workflows/deploy.yml`
8. Add `public/CNAME`
9. Update `astro.config.mjs` site URL
10. Verify `pnpm build` succeeds

### Phase 2 — Delete & Redirect
1. Delete `src/pages/portfolio/`, `src/pages/support-my-work.astro`
2. Delete `src/content/portfolio/`, `src/layouts/PortfolioLayout.astro`, `src/components/Card.astro`
3. Add redirect pages: `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, update `src/pages/resume.astro`
4. Verify build succeeds with no broken imports

### Phase 3 — Design System
1. Update `tailwind.config.cjs` — custom editorial DaisyUI themes
2. Update `src/styles/global.css` — Inter font import, base typography
3. Update `BaseLayout.astro` — new theme names in theme map
4. Restyle `SideBar.astro`, `SideBarMenu.astro`, `SideBarFooter.astro`, `Header.astro`, `Footer.astro`
5. Update nav to 4 items: Home, About, Content, Contact
6. Restyle `ThemeToggle.astro`
7. Update `BaseHead.astro` — Inter font preload, JSON-LD schema

### Phase 4 — New Components
1. Build `ProjectCard.astro`
2. Build `ContentCard.astro`
3. Build `ContentFilter.astro` with client-side filtering script
4. Update `HorizontalCard.astro` (restyle, remove tag_url)
5. Move `TimeLine.astro` from `resume/` to `components/`
6. Rename `PostLayout.astro` → `ContentLayout.astro`, update URL references

### Phase 5 — Pages
1. Rewrite `src/pages/index.astro` — hero + project cards + recent content
2. Rewrite `src/pages/about.astro` — bio + current roles + career timeline
3. Create `src/pages/content/[...page].astro` — unified paginated feed with filter
4. Create `src/pages/content/[slug].astro` — full post detail page
5. Update `src/pages/contact.astro` — add Signal, remove LinkedIn
6. Update `src/pages/rss.xml.js` — new collection + `GET` export

### Phase 6 — Content & Optimization
1. Draft bio copy (first-person from conference bio)
2. Write About page narrative (3-4 paragraphs)
3. Populate career timeline from existing `resume.astro` data
4. Add `public/llms.txt`
5. Add `public/_headers`
6. Update `src/config.ts` — new site title/description
7. Verify sitemap includes new routes, excludes deleted routes
8. Update `src/pages/404.astro` styling

### Phase 7 — Assets (Tyler provides)
1. Replace `public/profile.webp` with updated photo
2. Add all 5 logos to `public/logos/`
3. Add appearance entries to `src/content/appearances/` as Tyler provides them

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Two content collections vs. one | Two (`posts` + `appearances`) | Schemas are semantically different; enforces required `url` for appearances |
| Content filtering | Client-side JS | SSG constraint — no server to handle query params |
| Blog → Content URL migration | Meta-refresh redirect pages | GitHub Pages has no server-side redirects |
| Font loading | `@fontsource/inter` package | No external DNS lookup; works on GitHub Pages; respects user privacy |
| DaisyUI themes | Custom `editorial_light` + `editorial_dark` | Neutral palette control; avoid DaisyUI preset opinionation |
| Astro output mode | Static (SSG) | GitHub Pages requires static output; no SSR needed |
| Slug strategy | `entry.id` (Astro 5 filename-based) | Preserves existing post URLs; no slug migration needed |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Astro 5 breaking changes in existing components | Phase 1 focuses solely on getting the build green before any redesign work |
| Old `/blog/[slug]` URLs broken for existing links/shares | Redirect pages generated via `getStaticPaths` for all 32 post IDs |
| GitHub Pages `_headers` not supported | Document limitation; headers file kept for future CDN migration |
| Logos not yet available | Placeholder `[PROJECT NAME]` text fallback in `ProjectCard.astro` until assets arrive |
| Content filter with no JS | All cards visible when JS disabled — acceptable degraded experience |
| Namecheap DNS → GitHub Pages setup | Add `A` records pointing to GitHub Pages IPs + `CNAME` record; this is a manual DNS step outside the codebase |

---

## References
- [SPEC.md](SPEC.md) — Full product requirements
- [Astro 5 Migration Guide](https://docs.astro.build/en/guides/upgrade-to/v5/)
- [Astro 5 Content Layer API](https://docs.astro.build/en/guides/content-collections/)
- [GitHub Pages + Astro Deployment](https://docs.astro.build/en/guides/deploy/github/)
- [DaisyUI Custom Themes](https://daisyui.com/docs/themes/)
