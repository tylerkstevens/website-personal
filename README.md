# Tyler Stevens Personal Portfolio Website

Welcome to my personal website, built using the Astrofy template with Astro and TailwindCSS. This site serves as a central hub for my projects, content, and professional experience, with a particular focus on Bitcoin, hashrate heating, and engineering.

## Features

- **Blog & Media:** Explore my articles, podcasts, presentations, and interviews covering topics like Bitcoin mining, thermodynamics, and the heatpunk movement.
- **Portfolio:** Discover detailed documentation of my engineering projects and website development work.
- **Resume:** A comprehensive timeline of my work experience, education, and technical skills.
- **About:** Learn more about my background and interests.
- **Contact:** Find various ways to connect with me, including social media, email, and scheduling a call.
- **Support My Work:** Information on how to support my ongoing work and content creation.

## Installation

To get started with this project locally, follow these steps:

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm run dev
   ```
   This will start a local development server, and you can view the website in your browser.

3. **Build for production:**
   ```bash
   pnpm run build
   ```
   This command compiles the project into a `dist` folder, ready for deployment.

## Tech Stack

- [Astro](https://astro.build) - The web framework for building fast, content-focused websites.
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- [DaisyUI](https://daisyui.com/) - A Tailwind CSS component library for beautiful UI elements.

## Project Structure

```
├── src/
│   ├── components/         # Reusable Astro components (e.g., Header, Footer, Cards)
│   │   ├── resume/         # Components specific to the resume page
│   ├── content/            # Markdown/MDX content for blog posts and portfolio items
│   │   ├── blog/
│   │   ├── portfolio/
│   ├── layouts/            # Base layouts for different page types (e.g., BaseLayout, PostLayout)
│   ├── pages/              # Website pages (e.g., index.astro, blog/[...page].astro, contact.astro)
│   │   ├── blog/
│   │   ├── portfolio/
│   ├── styles/             # Global CSS styles
│   └── config.ts           # Global site configuration (title, description, etc.)
├── public/                 # Static assets (images, favicon, downloads)
├── astro.config.mjs        # Astro configuration file
├── tailwind.config.cjs     # Tailwind CSS configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Customization and Content

- **Global Site Configuration:** Modify `src/config.ts` to change the site title, description, and other global settings.
- **Theming:** The site uses DaisyUI themes. You can change the active theme by modifying the `data-theme` attribute in `src/layouts/BaseLayout.astro`.
- **Content Collections:** Blog posts and portfolio items are managed as Markdown (`.md`) files within `src/content/blog/` and `src/content/portfolio/` respectively. Each content file includes frontmatter for metadata like title, description, and publication date.
- **Components:** Custom components are located in `src/components/`. You can create new `.astro` files here for reusable UI elements.

## Sitemap

A sitemap is automatically generated when you build the website. Ensure your `public/robots.txt` file is updated with your site's URL for proper indexing.

## Deploy

This Astro project can be deployed to various static hosting services like Vercel, Netlify, or GitHub Pages. Refer to the [official Astro deployment documentation](https://docs.astro.build/en/guides/deploy/) for platform-specific instructions.

> **⚠️ CAUTION** </br>
> The Blog pagination of this template is implemented using dynamic route parameters in its filename and for now this format is incompatible with SSR deploy configs, so please use the default static deploy options for your deployments.

## Contributing

Suggestions and pull requests are welcomed! Feel free to open a discussion or an issue for a new feature request or bug.

## License

This project is licensed under the MIT license.