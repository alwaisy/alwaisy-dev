---
title: 'Agent Cache - Clean Local Documentation Bundles for AI Coding Agents'
description: Turn any documentation website into a clean Markdown ZIP for Cursor, Claude Code, and Windsurf without remote API delays.
publishDate: 'Oct 2026'
isFeatured: true
seo:
  image:
    src: '/media/projects/agentcache.png'
    alt: Agent Cache documentation packaging preview
---

![Project preview](/media/projects/agentcache.png)

<a href="https://agentcache.run" target="_blank">Visit Agent Cache</a>

**Project Overview:**

AI coding agents work best when you give them plain local files.

There has been a lot of hype around remote documentation tools like Context7. People talk about them constantly, but in my experience, having an agent make remote network calls across the internet every single time it needs an API definition is slow and brittle. Context7 treats documentation as a metered query stream ($10 per seat per month for 5,000 queries, plus overage charges). Why pay a monthly subscription and make repeated API requests across the wire just to look up a function signature that rarely changes?

Firecrawl takes another angle, but charges $19 to $99 per month on a credit meter (charging you even on 404s and 403 blocks) while producing raw, unstructured page dumps without native documentation hierarchy. And while `llms.txt` is useful, it is usually just a list of links. It forces agents to fetch individual URLs on the fly into temporary scratchpads, leaving you with fragmented, incomplete context.

My itch was much simpler: when I am building a feature in my editor, I want my agent to focus on that single feature using clean local documentation already sitting on my disk. No network hops, no waiting on third-party servers, and no token waste.

So I built Agent Cache. You paste any documentation URL, and it packages the entire site into a clean, structured ZIP of Markdown files that you drop straight into your repository.

## The Cloudflare Workers Failure and VPS Pivot

I did not start with a traditional server. Like many developers, I initially tried to build the extraction engine on Cloudflare Workers.

It failed almost immediately:
1. **The 50-Subrequest Limit**: Cloudflare free workers enforce a hard ceiling of 50 subrequests per execution. A crawler evaluating six origins across five subpaths exhausted worker quotas before extraction even began.
2. **Cloudflare-to-Cloudflare Blocks**: When the worker tried to fetch documentation from domains protected by Cloudflare WAF (like `chatgpt.com`), requests were instantly blocked with `403 Forbidden` and challenge tokens.
3. **Ephemeral State**: Because workers are stateless, clicking download on the frontend triggered a full re-scrape instead of serving the cached result.

I abandoned serverless workers and locked in a dedicated VPS monolith running Bun and Hono, backed by Turso for job state, Caddy for reverse proxying, and Cloudflare R2 for storing completed ZIP bundles. Having persistent disk access meant deterministic job folders, retained markdown trees, and instant 5-millisecond downloads.

## The 3-Tier Acquisition Ladder and the 100-Startup Benchmark

To prove the pipeline could handle real documentation quirks, I ran a benchmark across 71 Silicon Valley and YC developer tools (including PostHog, Clerk, Airbyte, Stytch, WorkOS, Upstash, Neon, and Nango).

The benchmark hit a **95.8% success rate**, pulling **38,073 clean documentation files** (328.26 MB total). More importantly, the data proved that **over 61% of developer documentation does not require HTML scraping at all**:

1. **Tier 1: GitHub Tree CDN (32.4% of sites)**: If open-source repository links exist in the documentation navbar or footer, the engine inspects the GitHub Trees API (`/git/trees/main?recursive=1`) and downloads pristine raw MDX straight from `raw.githubusercontent.com`. It extracted Clerk (1,124 files) in 28 seconds and PostHog (1,915 files) in 40 seconds with zero bot-blocking risk.
2. **Tier 2: Direct `.md` API (29.4% of sites)**: Many modern platforms (like Mintlify) expose raw Markdown by appending `.md` to routes. Concurrent direct downloads pulled WorkOS (1,601 files) in 29 seconds and Mintlify (1,139 files) in 72 seconds.
3. **Tier 3: Clean HTML DOM (38.2% of sites)**: JSDOM and a custom Turndown parser act as the fallback for custom CMS platforms, stripping sidebars, cookie banners, and headers while preserving code blocks and relative links.

Along the way, I uncovered several subtle web edge cases: never probe direct `.md` on the root domain (which returns 404; always probe deep subpaths like `/docs/intro`), avoid `HEAD` requests on edge routes (Netlify and Cloudflare throw `502 Bad Gateway` on `HEAD` requests for dynamic Markdown endpoints; use lightweight `GET` instead), and normalize `.md`/`.mdx` extensions to prevent accidental `.md.md` double extensions.

## Zero-LLM Extraction and Live Streaming

One of the most deliberate decisions in Agent Cache was keeping **zero LLM inference in the extraction pipeline**.

Using an LLM to parse, clean, or summarize documentation dramatically slows down jobs, increases server bills, and introduces the risk of hallucinated code syntax. Deterministic extraction is fast, free to run, and guarantees that code examples match the source documentation character for character.

Instead of monolithic loading bars, I built Server-Sent Events (SSE) streaming at `/dingdong/{job-id}`. Users watch the engine probe tiers, resolve topology, and fetch pages in real time directly in the browser terminal.

## Technical Stack

- **Framework & Runtime:** Hono running on Bun
- **Database:** Turso (libSQL) to track background job lifecycles
- **Storage:** Cloudflare R2 for storing generated ZIP bundles
- **Frontend:** HTMX with clean CSS, Newsreader typography, and zero client-side framework overhead
- **Deployment:** Docker with Caddy reverse proxy and Cloudflare edge caching
- **Open Source:** Available on GitHub at [osspakistan/agent-cache-web](https://github.com/osspakistan/agent-cache-web)

## The Reality Check

In the first 48 hours after launching at [agentcache.run](https://agentcache.run), the site logged 848 unique visitor sessions and 110 real documentation crawl jobs in the Turso database.

It is not an over-engineered enterprise platform. It simply solves one real problem: giving your coding agent clean, authoritative Markdown documentation on your local disk so it stops hallucinating APIs.
