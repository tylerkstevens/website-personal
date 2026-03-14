# Tyler Stevens Personal Website — Overhaul Spec

## Overview

A major overhaul of tylerstevens.me with three goals:
1. Clearly communicate who Tyler is to a Bitcoin/tech-savvy audience
2. Modernize the visual design to a clean, editorial aesthetic
3. Update content structure to reflect current work and remove outdated sections

---

## Tech Stack

### Upgrades
- **Astro 4.0.2 → Astro 5** (latest stable)
  - Use Astro 5's Content Layer API for content collections
  - Update all deprecated Astro 4 APIs accordingly
- Keep **TailwindCSS 3.x** (or latest compatible with Astro 5)
- Keep **DaisyUI** (update to latest compatible version)
- Keep **TypeScript**, **Sharp**, **@astrojs/mdx**, **@astrojs/rss**, **@astrojs/sitemap**

### Hosting & Deployment
- **GitHub Pages** with custom domain `tylerstevens.me`
- **GitHub Actions CI/CD**: Add `.github/workflows/deploy.yml` that:
  - Triggers on push to `main`
  - Installs deps with pnpm
  - Runs `pnpm build`
  - Deploys `dist/` to GitHub Pages
- Add `CNAME` file to `public/` containing `tylerstevens.me`
- Update `astro.config.mjs` site URL to `https://tylerstevens.me`

---

## Visual Design

### Direction
Clean, modern, editorial. Confident but not flashy. Let content breathe.

### Color System
- **Neutral palette** — no strong brand colors
- Light mode: off-white/paper background, near-black text
- Dark mode: near-black background, off-white text
- Single subtle accent color (cool gray or slate) for links, borders, hover states
- **Default to system preference** (prefers-color-scheme), with manual override toggle
- Keep the existing ThemeToggle component logic (system/light/dark), just restyle it
- Replace DaisyUI themes: use `light` (or a minimal custom theme) for light mode, `dark` for dark mode — or define custom DaisyUI themes in `tailwind.config.cjs`

### Typography
- **Body text**: Clean sans-serif — use [Inter](https://fonts.google.com/specimen/Inter) or system-ui stack
- **Code/technical details**: Monospace — use system monospace stack (`ui-monospace, SFMono-Regular, Menlo, monospace`)
- **Headings**: Same sans-serif as body, heavier weight, tighter tracking
- Load Inter via `<link>` in BaseHead if using Google Fonts, or use `@fontsource/inter` package

### Layout
- **Keep the left sidebar navigation** on desktop
- Sidebar should feel editorial: clean lines, subtle dividers, good whitespace
- Mobile: keep the existing drawer/hamburger pattern, restyled
- Max content width: ~720px for reading content, wider for homepage grid layouts
- Generous padding and whitespace throughout

---

## Site Structure

### Navigation (Sidebar)
Four items only:
1. **Home** → `/`
2. **About** → `/about`
3. **Content** → `/content`
4. **Contact** → `/contact`

Remove from nav: Resume, Portfolio, Support My Work

### Pages

#### 1. Home (`/`)

**Section 1 — Hero**
- Tyler's name (large, prominent)
- Profile photo (Tyler will provide updated `.webp`)
- Short personal bio paragraph — use this as the base, make it sound personal/first-person-casual:
  > "Tyler is a multifaceted builder in the bitcoin and energy sectors. As Founder & CEO of Exergy, he commercializes 'hashrate heating,' transforming Bitcoin miners into intelligent heating solutions for homes and businesses. He authored the book 'Bitcoin Mining Heat Reuse' & spearheads the Hashrate Heatpunks community movement, advocating for this synergistic industry. Committed to open-source principles, Tyler serves as a Board Member of the 256 Foundation, a non-profit challenging proprietary mining control. He is also a Co-Founder of The Space, Denver's Bitcoin citadel."
  *(Rewrite this in first-person, casual tone, ~3-4 sentences)*

**Section 2 — Project Cards**
Five cards in a grid (2-col on desktop, 1-col on mobile). Each card contains:
- Logo (image)
- Role/title (e.g., "Founder & CEO")
- Project name
- 2-3 sentence description
- External link (opens in new tab)

| Card | Role | Link | Notes |
|------|------|------|-------|
| Exergy | Founder & CEO | https://exergy.energy | Primary focus |
| 256 Foundation | Board Member | https://256foundation.org | Open-source mining non-profit |
| Hashrate Heatpunks | Founder & Organizer | https://heatpunks.org | Community under 256 Foundation umbrella |
| The Space | Co-Founder | https://denver.space | Denver Bitcoin citadel |
| Book: Bitcoin Mining Heat Reuse | Author | https://braiins.com/books/bitcoin-mining-heat-reuse | Free PDF available; showcase thought leadership |

Logos: Tyler will provide all 5 as files. Store in `public/logos/`. Existing Exergy and The Space logos are already there.

**Section 3 — Recent Content**
- Heading: "Recent Content" or similar
- Show the 3 most recent items from the unified content collection (any type)
- Each item shown as a horizontal card: thumbnail/type-icon + title + type badge + date + short description
- "View all content →" link to `/content`

---

#### 2. About (`/about`)

Replaces the old Resume page. URL changes from `/resume` to `/about`. The old `/about` page is replaced entirely.

Three sections:

**Section 1 — Bio/Narrative**
Personal written narrative. ~3-4 paragraphs. Covers:
- Who Tyler is and what drives him
- How he got into Bitcoin and hashrate heating
- What he's building and why it matters
- His community and open-source values

Draft this based on the conference bio provided, written in first-person casual voice.

**Section 2 — Current Roles & Focus**
Same 5 project cards as homepage (or a simplified list version). Show: role, organization name, one-line description, link.

**Section 3 — Career Timeline**
Full career timeline from early career to present. Use the existing `TimeLine.astro` component or restyle it. Populate with key milestones. Pull from existing `resume.astro` content and update for current roles.

Timeline entries should include at minimum:
- All roles from existing resume (update as needed)
- Founding of Exergy
- 256 Foundation board membership
- Hashrate Heatpunks founding + move under 256 Foundation
- The Space co-founding
- Book publication

---

#### 3. Content (`/content`)

Replaces the old Blog (`/blog`). Unified feed of written posts, conference talks, and podcast appearances.

**URL**: `/content` (old `/blog` routes should redirect to `/content` for SEO)

**Filter tabs at the top**: `All` | `Posts` | `Talks` | `Podcasts`
- Tabs filter the content grid without full page reload (client-side filtering via JS, or use query params for static SSG)
- Active tab is visually indicated

**Content Cards (all types)**:
Each card shows:
- Thumbnail image (for posts, use existing heroImage; for talks/podcasts, use a thumbnail or default type icon)
- Type badge (`Post`, `Talk`, `Podcast`)
- Title
- Date
- Short description (1-2 sentences)
- External link badge if applicable

**Content Detail Pages (written posts only)**:
- Full internal page at `/content/[slug]`
- Keep existing blog post content and styling (updated to new design)
- Migrate all 32 existing blog posts — **keep all of them**

**Talks and Podcasts**:
- No internal detail page — card links directly to external URL (YouTube, podcast platform, etc.)
- Stored as Markdown in `src/content/appearances/` with frontmatter:
  ```
  ---
  title: string
  date: date
  type: "talk" | "podcast"
  description: string
  url: string (required - external link)
  thumbnail: string (optional - path to image in public/)
  ---
  ```

**Content Collection Schema Update**:
Extend existing blog collection schema OR rename to `content` with an added `type` field (`"post" | "talk" | "podcast"`). Posts that are `talk` or `podcast` type show a card with external link only; `post` type generates a full detail page.

**Pagination**: Keep pagination for the full archive. Default page size: 10 items.

---

#### 4. Contact (`/contact`)

Updated contact links. Remove LinkedIn. Add Signal.

| Platform | Display | Link/Handle |
|----------|---------|-------------|
| X (Twitter) | @tylerkstevens | existing link |
| Nostr | existing handle | existing link |
| Telegram | existing handle | existing link |
| Email | existing | existing link |
| Cal.com | Book a call | existing link |
| GitHub | tylerkstevens | existing link |
| Signal | tylerkstevens.97 | https://signal.me/#eu/YPOJyKELz3ZGfCkAs_kgkmlE3fPDtdCvf3vwZdY2lZExfKEYNotL_4TuXdYd7Z5x |

**Remove**: LinkedIn
**Remove entire page**: Support My Work (`/support-my-work`) — delete this page and remove from nav

---

### Removed Pages / Sections
- `/resume` → redirect to `/about`
- `/support-my-work` → delete entirely
- `/portfolio` and all sub-routes → delete entirely
- Portfolio content collection → delete `src/content/portfolio/`
- All portfolio-related pages in `src/pages/portfolio/`

---

## Performance & Technical Optimizations

### AI Agent Parsing
- Add `public/llms.txt` — a plain-text file at the site root describing the site, its author, and key links, following the [llms.txt standard](https://llmstxt.org)
- Ensure structured data (JSON-LD) is added to key pages for person/author schema

### SEO
- Keep existing sitemap generation (`@astrojs/sitemap`)
- Keep existing RSS feed — update to point to `/content` instead of `/blog`
- Ensure all pages have proper `<title>` and `<meta description>` tags
- Add Open Graph image support (can use a default OG image for now)

### Performance
- Keep Sharp for image optimization
- Ensure all images use Astro's `<Image>` component for automatic optimization
- Keep static site generation (no SSR)
- Profile image: updated `.webp` provided by Tyler, store as `public/profile.webp`

### Security Headers
- Add a `public/_headers` file (GitHub Pages supports this via a `_headers` file in the repo root or `public/`) with:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

## Content Decisions

### Bio Copy (for Hero and About page)
Rewrite the following conference bio into first-person casual voice for use on the homepage hero. Keep it honest and grounded, not marketing-speak:

> "Tyler is a multifaceted builder in the bitcoin and energy sectors. As Founder & CEO of Exergy, he commercializes 'hashrate heating,' transforming Bitcoin miners into intelligent heating solutions for homes and businesses. He authored the book 'Bitcoin Mining Heat Reuse' & spearheads the Hashrate Heatpunks community movement, advocating for this synergistic industry. Committed to open-source principles, Tyler serves as a Board Member of the 256 Foundation, a non-profit challenging proprietary mining control. He is also a Co-Founder of The Space, Denver's Bitcoin citadel."

### Book Card Description (suggested)
> "The definitive guide to hashrate heating — free to read, published by Braiins. I wrote this to map the emerging industry of using Bitcoin miners as intelligent heat sources."

---

## Migration Notes

### URL Changes
| Old URL | New URL | Action |
|---------|---------|--------|
| `/blog` | `/content` | Redirect + rename |
| `/blog/[slug]` | `/content/[slug]` | Redirect + rename |
| `/resume` | `/about` | Redirect to new about |
| `/portfolio` | — | Remove |
| `/support-my-work` | — | Remove |

### Assets to Update
- `public/profile.webp` → Tyler will replace with updated photo
- `public/logos/` → Tyler will provide logos for all 5 cards (Exergy, 256 Foundation, Heatpunks, The Space, book cover)

---

## Out of Scope
- X/Twitter API integration (requires paid API)
- Newsletter or email list integration
- Any server-side rendering or dynamic backend
- Google Analytics or paid analytics
- Comments system on blog posts
- Search functionality

---

## Implementation Order (Suggested)

1. **Setup**: Upgrade to Astro 5, configure GitHub Actions deploy workflow, add CNAME
2. **Design system**: Update Tailwind/DaisyUI config, fonts, color tokens, light/dark themes
3. **Layout & Nav**: Restyle BaseLayout, sidebar, header — update nav to 4 items
4. **Remove**: Delete portfolio pages/collection, support page, old resume page
5. **Content collection**: Migrate/rename blog → content, add type field, add appearances collection
6. **Homepage**: Hero + project cards + recent content section
7. **About page**: Bio + current roles + career timeline
8. **Content page**: Unified feed with filter tabs + pagination
9. **Contact page**: Update links (add Signal, remove LinkedIn)
10. **Optimizations**: llms.txt, JSON-LD, OG meta, security headers, RSS update
11. **Content population**: Tyler provides updated photos, logos, talk/podcast entries

---

## Open Items (Tyler to Provide)
- [ ] Updated profile photo
- [ ] All 5 project card logos (Exergy, 256 Foundation, Heatpunks, The Space, book cover)
- [ ] List of past speaking engagements and podcast appearances to add to content feed
- [ ] Any updates needed to career timeline data on the About page
