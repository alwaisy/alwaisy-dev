---
title: Why I Paused My AI Commenting Tool After 45 Hours
excerpt: Everyone says to write 30 thoughtful replies a day on social feeds. I built an automated workflow to speed that up, wrestled with cloud isolates and token speeds, and then realized why the whole premise was flawed.
publishDate: 'Oct 09 2026'
tags:
  - Founder Story
  - AI Tools
  - Strategy
seo:
  description: "A retrospective on building SLAP, solving latency with Nebius, using R2 as disk, and why commenting tools fall apart without personal experience."
  image:
    src: '/media/projects/slap.png'
    alt: SLAP project interface preview
isFeatured: false
---

![SLAP project interface preview](/media/projects/slap.png)

> Engaging on social feeds is supposed to be the fastest way to grow, but writing 30 thoughtful replies every single day turns your head into mush.

If you spend any time building projects in public, you already know the playbook. People repeat the same advice constantly: go to big accounts, leave 30 thoughtful comments every morning, borrow attention, and bring people back to your profile.

It sounds reasonable when people talk about it on podcasts. But sit down and actually try it. By reply number twelve, your focus is shot. You stare at a thread with forty opinions, start typing a response, erase it, second-guess your wording, and end up posting something hollow like "Great point" or a thumbs-up emoji.

Generic AI reply tools make this worse. They flood timelines with hollow enthusiasm, irrelevant summaries, and robotic praise. Readers recognize them immediately, and the algorithm ignores them.

I wanted to fix that problem for myself. I called the project **SLAP**. The goal was a clean workflow that would inspect a post, evaluate attached charts, read through the top twenty to thirty existing comments so you never repeat what someone else already said, and offer three distinct angles with one human reply each. You could also record a quick audio note to establish your real stance before any model touched the phrasing.

I spent 45 hours and 59 coding sessions building it. Technically, the stack worked. But once I sat down to use it on real discussions, I ran into a product reality that no amount of prompt tuning could repair.

---

## What Was Actually Built

I wanted the software organized properly from day one, so I set it up as a Turborepo monorepo powered by Bun workspaces:

- `apps/web`: A SvelteKit 5 web application running on Cloudflare Workers edge runtime.
- `packages/pipeline`: The backend pipeline handling external APIs, web searches, image extraction, and text generation.
- `packages/contracts`: Zod schemas and validation rules shared across the workspace.
- `packages/logger`: Structured logging to track every step of the generation cycle.

Separating the generation pipeline from the web frontend was one of the best technical decisions I made. It allowed me to run standalone terminal benchmarks against the pipeline without booting up a dev server or waiting on browser refreshes.

### The Core Features That Reached Production

1. **The Context Pipeline:** A workflow that fetches target posts and active comment trees through external APIs, gathers author background via Tavily web search, reads image charts with Gemini Flash Vision, and generates responses using Kimi k2.6 and GLM models.
2. **The Mechanical Quality Gate:** An automated cleanup step. If any generated draft exceeds 160 characters, begins with generic articles ("The", "A", "An"), or includes awkward punctuation, a second pass trims it to under 145 characters.
3. **The Web Dashboard (`/deck`):** An interface deployed on Cloudflare Workers using Better Auth (email OTP and GitHub login), Cloudflare D1 (SQLite) with Drizzle ORM, and Cloudflare R2 object storage. It tracks daily quotas, progress streaks, and custom user voice instructions.
4. **The Live Runner (`/app`):** A place to paste any post link, enter an optional viewpoint, and watch live telemetry across every phase of generation.

---

## The MicroVM Wall and Treating R2 as a Disk

When I started sketching the backend, I considered spinning up isolated Linux microVMs to run headless scripts and shell utilities.

That turned out to be a dead end. Booting virtual machines for a quick in-feed action was far too slow, and paying for idle machine seconds makes no sense for lightweight runs. Furthermore, Cloudflare Workers run on V8 isolates. They cannot fork child processes or execute shell scripts.

So I tried a different path: using Cloudflare R2 object storage directly as a virtual filesystem.

> By treating R2 storage as a virtual disk, each generation gets a clean folder in plain text files without paying for container boot times or cluttering a database.

Using small, deterministic read and write operations, each session created a workspace folder under `sessions/{userId}/{sessionId}/`. It stored the target post, author profile, top replies, user voice rules, and final drafts in plain TOML and Markdown. It gave me zero startup delay, straightforward inspection during debugging, and kept multi-kilobyte payload dumps out of my SQLite database tables.

---

## The Latency Crisis and Provider Throughput

Latency almost ruined the project halfway through.

In early tests, the parallel steps finished in 15 to 18 seconds:
- Fetching the post and active replies in parallel took 4 to 8 seconds.
- Text parsing extracted company names in milliseconds.
- Web search retrieved company background in 6 seconds.
- Image processing extracted chart text in 8 seconds.
- A single synthesis call drafted the three perspectives in 7 seconds.

Everything ran concurrently. But during experimentation, an extra intermediate model step was inserted into the middle of the workflow just to formulate search queries.

That single change broke the entire flow.

It converted a concurrent process into a slow sequence: wait for the post, wait 15 seconds for a model to write search terms, wait for web search, wait for image extraction, and then wait 40 seconds for the final synthesis. Total runtimes jumped past 100 seconds, running straight into execution timeouts on edge workers.

I removed the extra model step and returned to deterministic text matching. Even then, generation times would randomly drift back up to a full minute during busy traffic windows.

> Model latency is often an infrastructure and provider problem rather than a prompt pipeline flaw.

The real solution was switching providers to Nebius. While conventional API gateways backed up with long queues, Nebius delivered sustained speeds between 300 and 800 tokens per second on DeepSeek V4.1 Flash, and over 190 tokens per second on GLM-5.3-Flash Nitro. That throughput pulled final synthesis down to roughly two to three seconds.

---

## The 3-Reply Limit

Early in development, the generation step suggested offering three variations for every perspective, totaling nine options.

I dropped that idea immediately. Giving someone nine options creates decision fatigue. You spend more time reviewing AI suggestions than actually participating in the conversation.

The codebase strictly enforces one reply per angle across three distinct perspectives: a data point, a counter-argument, or a pragmatic alternative. That means three choices total. You pick the perspective that fits, copy it, and keep moving.

---

## The Product Reality: Why I Paused

By early October 2026, the application and backend were deployed and functional.

Then I sat down to test it on real conversations across my feed, including a detailed debate on cold email software.

That was when the real flaw became obvious:

Every single generated reply sounded like unsolicited advice.

> When a real person writes a great comment, they share lived experience. Advice without personal experience reads like synthetic marketing noise.

Think about the replies you actually respect on social media. People rarely appreciate an anonymous account chiming in with unsolicited consulting tips. They respect someone who says: *"I tried that three months ago, here is where our numbers broke, and here is what we changed."*

On a topic like cold email, I had no personal experience. Because I had no experience, the model had nothing authentic to draw from. It defaulted to smooth, polished advice because it lacked real context about my work.

To make an automated tool genuinely sound like you, it cannot just monitor incoming posts. It requires a continuous personal knowledge base: a place where you record your ongoing thoughts, real struggles, and daily notes, so a system actually knows what you believe and what you have built.

Building that personal knowledge base is a completely separate product. Without it, an automated reply tool will always sound synthetic, no matter how much you tune the instructions.

Rather than publishing something I could not honestly recommend to myself, I placed a pause notice directly on the site: *"Development paused: This project is currently on hold with no plans to resume sooner."*

---

## What Happens Next

The project is on hold, but the work was not wasted.

The time spent building the pipeline, structuring the monorepo, and validating R2 as a lightweight workspace storage layer produced reusable patterns I will apply to future software.

Pausing an idea when you discover a structural flaw is not a setback. It is the only sensible way to build software that respects both the builder and the user.
