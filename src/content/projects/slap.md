---
title: 'SLAP - In-Feed Context Engine and Lessons on Genuine AI Voice'
description: An in-feed Chrome Extension and SvelteKit edge app that tested whether an AI context engine could solve the daily commenting grind on X.
publishDate: 'Oct 2026'
isFeatured: false
seo:
  image:
    src: '/media/projects/slap.png'
    alt: SLAP in-feed context engine preview
---

![Project preview](/media/projects/slap.png)

<a href="https://slap-web.awaisalwaisy.workers.dev" target="_blank">Visit SLAP</a>

> Engaging on X is the fastest way to grow, but writing 30 comments every day turns your brain into mush.

Now, if you spend any time building in public on X, you know the playbook. Everyone tells you the same thing: write 30 thoughtful comments a day under big accounts, borrow their attention, and drive profile visits.

It sounds simple enough on paper. But when you actually sit down to do it, by comment #12 your energy is completely drained. You stare at a thread with 40 replies, you draft a quick response, you delete it, you second-guess yourself, and eventually you give up or post something lazy like "Great post! 🔥" or "Totally agree."

Generic AI comment tools make it worse. They spray robotic flattery, emojis, and ungrounded summaries across the timeline. People spot them instantly, and the algorithm buries them.

So I wanted to build SLAP. The core idea was an in-feed context engine inside a Chrome extension on `x.com`. It would inspect the post, check attached images, read the top 20 to 30 existing comments so you never echo what others already said, and give you 3 sharp strategic angles with 1 human comment each. You could also double-click to record a quick audio voice note, giving your real stance top priority while the model handles the phrasing.

All right, so that was the dream. What actually happened over 45 hours of engineering was a brutal lesson in latency, agent token burn, and what makes comments sound human.

## What Was Built vs. What Was Planned

I want to be completely honest about where the software actually landed before I paused it:

### What Got Fully Built & Deployed

1. **The Core Edge Intelligence Pipeline (`@slap/engine`):** A production pipeline that fetches X posts and comment trees via Treg (TikHub API), pulls company backstories with Tavily web search, reads image charts with Gemini Flash Vision, applies anti-slop rules, and runs synthesis using GLM-5.3-Flash and Kimi k2.6.
2. **The Mechanical Repair Pass:** An automated quality gate. If any generated reply exceeds 160 characters, starts with "The/A/An", or leaks colons, a second-pass editor prompt immediately trims it to under 145 characters.
3. **The SvelteKit 5 Edge Web App (`apps/web`):** Deployed to Cloudflare Workers with Better Auth (email OTP and GitHub OAuth), Cloudflare D1 (SQLite) with Drizzle ORM, and Cloudflare R2 durable execution logging.
4. **The Creator Deck (`/deck`):** A dashboard tracking daily 30-comment quotas, goal streaks, past session telemetry, and the Fine-Tune studio managing the 4 user fuel pillars (thoughts, voice, instructions, and X data).
5. **The Active Comment Runner (`/app` and `/app/[id]`):** An interface to paste any X post URL with an optional stance and watch real-time generation telemetry across each stage.

### What Remained Planned / Scaffolded

1. **The Chrome Extension (`apps/extension`):** The Manifest V3 in-feed DOM observer stayed as an intentional stub (`apps/extension/README.md`). The plan was to finish the web app and edge API first, and then wire the extension to consume the `/api/slap` endpoint. The in-feed DOM injection was never fully wired up.
2. **Official X OAuth Connection:** I avoided expensive official X developer API tiers during MVP. The onboarding flow accepts a user's public `@username` directly to pull bio and writing samples, rather than using heavy OAuth tokens.

## First Time Monorepo Structure

This project was my first time organizing a full product as a Turborepo monorepo powered by Bun workspaces.

The project layout lives under `applications/`:

- `apps/web`: The SvelteKit 5 web application running on Cloudflare Workers edge runtime.
- `apps/extension`: The planned Manifest V3 Chrome extension for in-feed DOM injection.
- `packages/engine`: The isolated intelligence engine (`@slap/engine`) handling data fetching, enrichments, and LLM synthesis.
- `packages/contracts`: Shared Zod validation schemas, API contracts, and feature flags.
- `packages/logger`: Structured isomorphic logging for request lifecycles.

Separating the engine from the web app turned out to be one of the best technical decisions I made. It meant I could run standalone CLI benchmark tests against the engine (`bun run test-run.ts`) without booting up Vite or dealing with SvelteKit server routes.

## The 30-Comment Gate and Less Is More

From day one, I set a hard rule: if a post has fewer than 30 comments, SLAP stays hidden. No button in the DOM, no API calls, zero clutter. Joining dead threads gives you near-zero distribution return, and without existing comments there is no room temperature for the model to read.

When I first discussed the generation format, the AI initially proposed spitting out 3 variations for every angle, which would mean 9 comments.

I killed that immediately. Giving someone 9 comments is garbage. More options just create decision fatigue, and you end up spending more time reading AI variations than actually engaging. The codebase enforces a strict rule: exactly 1 comment per angle across 3 distinct angles. That is 3 comments total, period. You pick the perspective you want (data proof, contrarian caveat, or a pragmatic alternative), copy it, and move on.

## The MicroVM Dead End and R2 as Disk

When I started prototyping the backend, I tried using isolated Linux KVM microVMs to run headless browser workers and shell scripts.

It was a total dead end. Spinning up microVMs for a fast in-feed tool was way too slow and expensive per machine-second. More importantly, <mark>Cloudflare</mark> Workers run on V8 isolates. They cannot spawn child processes or run bash commands.

So I took a different route: treating <mark>Cloudflare</mark> R2 object storage directly as the agent's virtual hard drive.

Using lightweight primitive tools (`read_file`, `write_file`, `list_dir`, `http_call`), each generation session created a clean folder tree under `sessions/{userId}/{sessionId}/`. It held the target post, author profile, top 30 thread replies, user voice rules, and final outputs in plain TOML and Markdown. It gave me zero container boot latency, instant debugging from R2 session dumps, and prevented multi-kilobyte tweet payloads from bloating my <mark>Cloudflare</mark> D1 SQLite database.

## The Latency Crisis and Agent Token Burn

Now, this is where things got painful.

In my early prototypes, I had a fast parallel pipeline running in 15 to 18 seconds:
- Treg fetched the tweet and thread comments in parallel (4 to 8 seconds).
- Fast regex code extracted company names and search terms in 0 milliseconds.
- Tavily searched the web for company backstory in 6 seconds.
- Gemini Flash extracted OCR text from attached charts in 8 seconds.
- A single synthesis call to Kimi k2.6 drafted the 3 angles in 7 seconds.

Everything ran concurrently. But during experimentation, an extra intermediate LLM call was added into the pipeline just to generate search queries before calling Tavily.

That single decision ruined the system.

It turned a parallel workflow into a slow sequential line: wait for the tweet, wait 15 seconds for an LLM to write search queries, wait for Tavily, wait for vision, and then wait 40 seconds for the main synthesis call. Runtimes exploded from 18 seconds to over 100 seconds, crashing straight into <mark>Cloudflare</mark> Workers' execution limits.

I stripped the extra LLM call out and returned to deterministic query extraction. But even then, LLM response times would randomly spike back up to 59 seconds or 1 minute and 10 seconds during peak hours.

The real fix came down to infrastructure and provider routing: switching synthesis to Nebius. While generic providers crawled along with unpredictable queues, Nebius pushed incredible throughput, hitting anywhere from 300 to over 800 tokens per second on DeepSeek V4.1 Flash (and over 190 tokens per second on GLM-5.3-Flash Nitro). That level of raw speed pulled the final synthesis down to just 2 to 3 seconds, proving that model latency is often an infrastructure and provider problem rather than a pipeline flaw.

## Technical Stack

- **Framework & Runtime:** SvelteKit 5 running on <mark>Cloudflare</mark> Workers edge runtime
- **Monorepo:** Turborepo with Bun workspaces (`apps/*`, `packages/*`)
- **Database:** <mark>Cloudflare</mark> D1 (SQLite) with Drizzle ORM
- **Blob Storage:** <mark>Cloudflare</mark> R2 for durable execution workspaces and audit traces
- **Pipeline Engine:** `@slap/engine` orchestrating Treg, Tavily search, Gemini Flash Vision, and GLM-5.3-Flash / Kimi k2.6
- **Styling & UI:** Tailwind CSS v4, shadcn-svelte primitives, and HugeIcons
- **Authentication:** Better Auth with email OTP and GitHub OAuth

## The Reality Check: Why I Paused the Project

By early October 2026, the web application and engine were fully deployed.

Then I sat down and tested it on real threads across my feed, including a debate on cold email software.

And that is when the core product reality hit me:

Every generated comment sounded like unsolicited advice.

When a real human reads a post and leaves a great comment, they do not hand down generic advice like an expert consultant. They share a personal experience. They say what happened to them when they tried that approach. Advice without lived experience looks fake and robotic, no matter how much you tune the prompt.

For a post about cold email, I personally knew nothing about the topic. And if I knew nothing, the AI had no personal experience to draw from. It defaulted to polished advice because it had no authentic thoughts from me to work with.

To make an AI comment tool actually sound like you, it cannot just be a generic commenting engine. It needs a continuous personal context system: an app where you dump your raw, messy, ongoing thoughts every single day, so the model actually knows what you believe and what you have lived through.

I realized that building that thoughts system was a completely different product. A generic commenting tool on its own is flawed at the root.

Instead of shipping something I would not personally use every day, I put a status banner right on the homepage: *"Development paused: This project is currently on hold with no plans to resume sooner."*

## The Future of This Project

So where does this leave SLAP?

The project is currently shelved, but it is not dead code. 

The future of SLAP depends entirely on solving the personal context problem first. If I build the dedicated thoughts engine, where an agent continuously accumulates my real work notes, life experiences, and unpolished beliefs, then SLAP becomes a natural distribution plugin on top of that system.

Until then, keeping it paused was the honest choice. I spent 45.64 active hours building it across 59 coding sessions. The engineering in `@slap/engine`, the R2-as-disk model, and the Turborepo setup were great wins that I will carry forward into every future project.
