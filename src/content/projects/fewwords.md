---
title: 'Fewwords - AI content summarization that actually works'
description: Articles, YouTube videos, Reddit threads. I built this because I couldn't sit through 2-hour videos and my browser was a graveyard of tabs I'd never read.
publishDate: 'Jan 2026'
seo:
  image:
    src: 'https://fewwords.app/og-image.png'
    alt: Fewwords - AI content summarization tool
---

![Project preview](https://fewwords.app/og-image.png)

<a href="https://fewwords.app" target="_blank">Visit Fewwords</a>

**Project Overview:**

I have a confession: I can't focus through long articles. And I definitely can't sit through 2-hour videos. My attention span is short, and my browser was a graveyard of 47 open tabs I'd never actually read. We both know that "later" never comes.

For a year, my workflow was broken. Every time I wanted to extract the essence of a video, I had to hunt for a transcript tool, copy a wall of text, and paste it into ChatGPT with unreliable prompts. It worked, but it felt like too much friction just to save time.

So I built Fewwords. An AI-powered summarization tool for articles, YouTube videos, and Reddit threads.

## The First Attempt (And Why It Failed)

This wasn't my first try.

In early 2025, I built a first version called Key-Insights. At the time, AI models weren't capable of processing video natively. So I had to rely on brittle transcription scrapers that YouTube eventually blocked.

I hit a technical dead end and quit.

**The Reality:**

- Transcription scrapers kept breaking
- YouTube actively blocked them
- The AI couldn't understand video content directly
- Eight months of work, unusable

Eight months of mistakes taught me what not to do.

## The Rebuild

By early 2026, the technology had caught up. New models like the Gemini 3 series became capable of watching and understanding video content directly. I rebuilt everything from scratch to use this new architecture.

**What Changed:**

1. **Native video understanding** — No more transcription scrapers. The AI watches the video directly.

2. **Multi-stage classification engine** — It doesn't just "summarize." It classifies content type and picks the right strategy:
   - **Structured:** Essays, research, analysis
   - **Data Shot:** Specs, tutorials, how-tos
   - **Decision Brief:** News, reviews, updates

3. **Three distinct pipelines** — One for articles, one for short videos, one for long-form content up to 3 hours

4. **Versioned prompt strategy** — Different prompts for different content types, iterated based on real output quality

5. **Real-time progress** — Server-Sent Events (SSE) so users see progress as the AI works through long content

## Technical Stack

I would say the stack is pretty modern:

- **Framework:** Nuxt 4 with Vue 3
- **Runtime:** Bun (fast, simple)
- **Database:** PostgreSQL with Drizzle ORM
- **Queue System:** BullMQ with Redis for background processing
- **AI:** OpenRouter for multi-provider LLM access
- **Auth:** Passwordless Magic Link (simple, secure)
- **Styling:** Tailwind CSS v4

The architecture matters here. When you're processing 3-hour videos, you can't block the main thread. Everything runs through queues. Users get real-time updates via SSE. The database tracks job status. It's built for actual load, not just demos.

## Results

**What works now:**

- Paste a URL, get actionable bullets in 60 seconds
- Articles, YouTube videos, Reddit threads (with more coming)
- Shareable public links for every summary
- No account needed to create or read
- Free to start, credits system for heavy users

**Performance:**

- Background processing keeps the UI responsive
- Real-time progress updates via SSE
- Multi-provider LLM setup for reliability
- Queue system handles spikes without crashing

## What I Learned

Sometimes the technology just isn't ready. Key-Insights failed because I was building against the limits of 2025 AI models. I could have kept fighting scrapers and workarounds. But I would say it made more sense to wait for the technology to catch up.

The second build took a fraction of the time and produced something actually usable. That's the difference between fighting constraints and building with them.

Content classification isn't a nice-to-have. It's the core feature. A tutorial needs different extraction than a research paper. An opinion piece needs different framing than a product review. The generic "summarize this" prompt produces generic garbage. Versioned, content-specific prompts produce something useful.

I'm not going to lie, I haven't fully validated the demand for this yet. I built it because I needed it. If it helps you close even one tab today, then it was worth the effort.

Questions or feedback? [Reach out](https://fewwords.app/contact).

[Try it free](https://fewwords.app)
