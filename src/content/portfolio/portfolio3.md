---
title: "Website Coding Project - The Space"
description: "I coded the website for our upcoming bitcoin citadel, The Space. Here's what I learned."
pubDate: "June 21 2024"
heroImage: "/portfolioimages/portfolio3/TheSpaceWebsite.png"
tags: ["HTML","Astro"]
---

## Background

Since the end of last year, I've been working with a group of bitcoiners on a special project. **The Space** is an upcoming community hub for bitcoiners across the Rocky Mountain front range. There have been several other bitcoin citadels popping up around the globe. Austin has Bitcoin Commons. Nashville has Bitcoin Park. NYC has Pubkey. Tampa has Bitcoin Bay. We want to put Denver on the map!

Our largest challenge faced was coming up with the capital to execute. How do you start a comminity based organization from scratch? How could we possible afford a building? How do we attract members? Our solution was somewhwat unique and worth sharing.

We decided on a member-run organization with open source documentation that outlines how we did it! I won't get into much further detail on this blog post. If you want to learn more, I reccomend checking out our [website](https://denver.space/).

## Website

An awesome website is necessary for any startup organization. I serves as a one-stop-shop for everything you need to know about our community hub. What it is, how we were founded, open soure documation, and a place to apply for membership.

Of the eleven or so bitcoiners helping to build The Space, somehow I ended up working on the website. I find this ironic given we have experienced developers and software engineers on the team. I'm just some chump who like thermodynamics. Regardless, here's how I managed to make it work and what I learned along the way.

### Astro

The languaged used for coding the website is HTML. HTML is a standard markup language used to create and structure content on the web. It defines the structure and layout of a webpage by using elements and tags. It provides the basic building blocks for websites.

Astro is the framework I used throughout the development of the website. A framework in this context refers to a set of tools, libraries, conventions, and best practices that provide a structured way to build and organize applications. They're designed to simplify the development process by providing pre-written code and templates, allowing developers to focus more on the unique aspects of their applications rather than reinventing common functionalities. Astro is a modern framework that allows for fast deployment of optimized static web pages.

### Template

I didn't start from scratch. The Space's website is built off of an Astro framework template that we found on the web. One of the main benefits of doing this is starting with an exisiting project structure. A structure typically includes a variety of files and folders that organize your code and assets in a way that makes development more manageable and intuitive. Here’s a breakdown of the common components you’ll find in an Astro project:


```my-astro-project/
├── public/
│   ├── favicon.ico
│   └── images/
│       └── logo.png
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── MainLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   └── contact.astro
│   ├── styles/
│   │   └── global.css
│   └── assets/
│       └── logo.svg
├── astro.config.mjs
├── package.json
└── node_modules/
```

**src Folder:**
- Contains the main source code for the website.
- pages: This folder includes all the pages of the website.
- components: Contains reusable components used throughout the site, such as headers, footers, and other UI elements.
- layouts: Includes layout components that define the overall structure of pages, such as a main layout used across multiple pages.
- styles: Holds global CSS or SCSS files that define the styling for the site.

**public Folder:**
- Contains static files that are served directly without processing. Files in this folder are accessible via the root URL of the website.
- assets: This folder is for static assets like images, fonts, and other media files.

**astro.config.mjs:**
- The configuration file for the Astro project. This file allows you to set up various project settings, such as build options, integrations, and more.

**package.json:**
- Manages project dependencies and scripts. This file is essential for defining the packages required for your project and can include scripts for building, serving, and deploying the site.

**node_modules Folder:**
- Contains all the dependencies installed via npm. This folder is automatically generated when you run npm install.

**tsconfig.json**
- Configuration file for TypeScript, defining compiler options and settings.

## ChatGPT

After finding a template we liked, my next step was essentially to just figure it out as I went. For this, I relied completely on ChatGPT - Specifically the 4o update that came out in Q2 of 2024.

This large lanugage model is excellent at reading code, interpreting requests and making desired modifications to the files. It made what would have otherwise been an impossible task for me, a fun and valuable learning experience. While sometimes tedious and furstrating, with many instances of arguing with the LLM and waiting for responses, the overal process was extremely rewarding.

## Conclusion

During this journey, I gained insights into HTML, frameworks, website project structures, the differences between static and server-side sites, and much more. I now feel confident in my understanding of website development. For anyone wondering if it’s worth the effort to code a website project, I highly recommend it. With tools like ChatGPT and other large language models, you can deploy a website nearly as quickly as using platforms like Squarespace or others.