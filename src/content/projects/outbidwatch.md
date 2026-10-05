---
title: 'OutbidWatch - Cataloging the Wild Pay-to-Rank Bidding Craze'
description: A chronological observatory tracking over 330 pay-to-rank leaderboards, built with Cloudflare Workers, Hono, and D1.
publishDate: 'Sep 2026'
isFeatured: false
seo:
  image:
    src: '/media/projects/outbidwatch.png'
    alt: OutbidWatch directory preview
---

![Project preview](/media/projects/outbidwatch.png)

<a href="https://outbidwatch.lol" target="_blank">Visit OutbidWatch</a>

Most silly internet projects end up making actual money.

In early 2026, my feed was suddenly taken over by these weird bidding platforms. It was not pay-to-list. It was pay-to-rank. You paid five dollars to push your project to the top spot on a homepage, and ten minutes later someone paid six dollars to outbid you. Clones were launching every few hours: thinktime, cuntent, takefirst, outplanet.

It was chaotic, absurd, and fascinating. I decided to build OutbidWatch to catalog the entire circus and track which platform actually launched first.

It turned out to be a massive engineering headache.

## 30-Minute Scraper I Had to Kill

When I started, I had an ambitious plan. I wanted a live leaderboard that stayed updated in real time.

The idea was to have background scrapers visit every single bidding site every thirty minutes, grab the latest bid amounts, and update the directory automatically.

I tried building it multiple ways: lightweight fetch parsers, headless browser scrapers, and scheduled serverless functions. It turned into a maintenance nightmare. Half the bidding platforms had broken HTML that changed twice a day, breaking regex selectors. Other sites hid their live bids behind client-side JavaScript hydration. More than half the platforms went dead within forty-eight hours, throwing 404s, domain parking pages, or Cloudflare Turnstile captchas. On top of that, Cloudflare Workers enforce a 50-subrequest limit per execution, which meant crawling dozens of external sites exhausted quotas immediately.

I failed to make real-time updates reliable. It was eating up all my time and blocking the entire launch. To remove the blocker, I had to be realistic and kill that feature completely. I simplified the scope to focus on what actually mattered: a dependable, high-integrity chronological directory and timeline.

## Launch Date Engineering Odyssey

Determining the true launch order of over 300 platforms was another rabbit hole.

At first, I relied on domain registration dates from WHOIS records via RDAP. But a domain registration date does not tell you when a site actually opened for business. A founder could register a domain in November and launch in February.

Next, I tried the Wayback Machine, but it was completely useless for platforms that were only two days to three weeks old because crawlers had not archived them yet.

Then I tried Certificate Transparency logs. I connected directly to crt.sh's open database via `psql -t -h crt.sh -p 5432 -U guest certwatch` to query `x509_notBefore(c.CERTIFICATE)` issuance dates. That ran straight into server pool caps: `pgbouncer cannot connect to server` and `no more connections allowed`. I wrote Python retry loops with exponential backoff and connection-reuse logic just to get queries through.

Even then, certificate logs had a flaw: builders had generated pre-existing wildcard certificates (`*.domain.com`) for staging environments weeks earlier, and Cloudflare Universal SSL issued certificates before any public content existed.

In the end, I had to do it the hard way: manual OSINT detective work. I dug through Twitter, searched for the original launch tweets from founders, and cross-referenced their earliest announcement posts. Finding the actual maker behind each platform, and then trying to verify where they were located, was a massive pain. But it gave the directory real integrity.

## Ingestion Pipeline

To manage over 300 platforms without drowning in manual database entries, I built a modular Unix-style pipeline:

1. **Deduplication**: `01_dedup.mjs` normalized domains, stripped path variants (like `lastspot.lol/friends`), and collapsed duplicates into clean canonical records.
2. **Extraction Ladder**: An automated ladder queried `curl.md` first with millisecond cost tracking, falling back to `r.jina.ai` with custom selectors. If a page was under 200 characters or blocked by anti-bot checks, it was flagged as dead without wasting paid credits.
3. **Purify & Signals**: A custom script stripped scripts, navigation headers, and footers while preserving `x.com` and `twitter.com` links into a structured signals file to track founder handles.
4. **Context.dev Logo Integration**: Connected Context.dev CDN Logo Links directly to the domain with an initials fallback (like `TV` for `topvc.lol`), avoiding the need to rehost image bytes.
5. **SQL Generation**: Seed queues were converted into executable SQL scripts applied directly to Cloudflare D1 with `bun run db:seed`.

## Technical Stack

Once I stripped out the over-engineered real-time scraper, the stack became lean and fast:

- **Runtime:** Cloudflare Workers running on Bun
- **Framework:** Hono v4 for server-rendered HTML and REST endpoints
- **Database:** Cloudflare D1 (serverless SQLite) storing platform records and submissions
- **Styling:** Tailwind CSS v4 with Phosphor Icons
- **Dynamic Previews:** Resvg SVG generation engine at `/api/og`
- **Agent Integration:** `navigator.modelContext` so browser agents can query the directory
- **Open Source:** Available on GitHub at [osspakistan/outbidwatch-lol](https://github.com/osspakistan/outbidwatch-lol)

## What I Learned

Sometimes you have to kill your favorite feature just to get a project shipped. If I had stayed stubborn about building an automated 30-minute bidding crawler across 300 unstable websites, OutbidWatch would still be stuck on my local machine.

Cutting that feature and doing the hard manual verification gave me a directory that was actually useful while the trend was at its peak.
