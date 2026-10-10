---
title: 'SLAP - In-Feed Social Context Workspace'
description: An in-feed context workspace and SvelteKit edge app designed to solve the daily reply grind on social feeds.
publishDate: 'Oct 08 2026'
isFeatured: false
seo:
  image:
    src: '/media/projects/slap.png'
    alt: SLAP in-feed context workspace preview
---

![Project preview](/media/projects/slap.png)

<a href="https://slap-web.awaisalwaisy.workers.dev" target="_blank">Visit SLAP</a> • <a href="/blog/why-i-paused-my-ai-commenting-tool">Read Full Retrospective</a>

> Engaging on social feeds is the fastest way to grow, but writing 30 thoughtful replies every single day turns your head into mush.

Everyone repeats the same growth advice: leave 30 thoughtful comments every morning under big accounts, borrow their audience, and build credibility.

In practice, writing thirty genuine replies daily causes extreme mental fatigue by comment twelve. Most automated tools make the problem worse by spraying robotic enthusiasm and summaries across threads.

I built **SLAP** to test whether an intelligent in-feed workflow could fix that. Instead of generic praise, it inspects active threads, reads existing replies to avoid echoing others, gathers author context via web search, and produces three distinct strategic perspectives with one human comment each. You could also record an audio voice note to lock in your genuine stance before any text gets phrased.

> For the detailed 45-hour engineering breakdown on microVMs, Nebius throughput, and why the project was paused, read the [full retrospective blog post](/blog/why-i-paused-my-ai-commenting-tool).

## What Was Built vs. What Remained Planned

I spent 45.64 hours across 59 coding sessions building SLAP as a Turborepo monorepo:

### What Shipped to Production

1. **The Edge Context Pipeline (`@slap/engine`):** A backend pipeline that retrieves posts and comment trees via Treg (TikHub API), extracts company history with Tavily web search, reads image charts with Gemini Flash Vision, and generates responses using Kimi k2.6 and GLM models.
2. **The Mechanical Quality Pass:** An automated gate that trims long outputs (over 160 characters), removes awkward openers, and keeps replies concise.
3. **The SvelteKit 5 Edge Web App (`apps/web`):** Deployed to Cloudflare Workers with Better Auth (email OTP and GitHub OAuth), Cloudflare D1 (SQLite) with Drizzle ORM, and Cloudflare R2 durable execution logging.
4. **The Creator Deck (`/deck`):** A dashboard tracking daily quotas, streak goals, session telemetry, and user voice rules.
5. **The Active Runner (`/app`):** An interface to paste any thread link with an optional viewpoint and watch live telemetry across every phase of generation.

### What Remained Planned

1. **The Chrome Extension (`apps/extension`):** The Manifest V3 DOM injection script remained an intentional stub while proving out the web application and edge API first.
2. **Official Platform OAuth:** The MVP deliberately avoided heavy official developer pricing tiers, pulling public profiles and bios directly.

## Technical Architecture

- **Framework & Runtime:** SvelteKit 5 on Cloudflare Workers edge runtime
- **Monorepo:** Turborepo with Bun workspaces (`apps/*`, `packages/*`)
- **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
- **Workspace Storage:** Cloudflare R2 object storage treated as a virtual disk for session files
- **Pipeline:** `@slap/engine` coordinating Treg, Tavily search, Gemini Flash Vision, and Nebius high-speed inference
- **Styling:** Tailwind CSS v4, shadcn-svelte primitives, and HugeIcons
- **Authentication:** Better Auth with email OTP and GitHub login

## Status: Development Paused

While the technical pipeline worked reliably, using it on live discussions exposed a fundamental truth: **replies without lived experience always read like synthetic advice**. 

Without a dedicated system continuously capturing a creator's personal thoughts and real-world struggles, a commenting tool defaults to polished consulting tips. Rather than releasing a tool I would not use daily, I placed an explicit pause banner on the site.

Read the [complete essay and technical breakdown](/blog/why-i-paused-my-ai-commenting-tool) on the lessons learned from this build.
