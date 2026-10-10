---
title: Why I Paused My AI Commenting Tool After 45 Hours
excerpt: Everyone says to write 30 thoughtful replies a day on social feeds. I built a workflow to speed that up, hit some pretty ugly engineering walls, and then realized the whole premise was broken.
publishDate: 'Oct 09 2026'
tags:
  - Founder Story
  - AI Tools
  - Strategy
seo:
  description: "A retrospective on building SLAP, solving latency with Nebius, using R2 as disk, and why commenting tools fall apart without personal experience."
  image:
    src: '/media/blog/why-i-paused-my-ai-commenting-tool/images/cover.png'
    alt: When the replies sound synthetic - SLAP project cover
isFeatured: false
---

![When the replies sound synthetic - SLAP project cover](/media/blog/why-i-paused-my-ai-commenting-tool/images/cover.png)

Here is the thing nobody tells you about the "comment 30 times a day" growth strategy: by comment twelve, your brain is completely empty.

I found this out the hard way. So I spent 45 hours and 59 coding sessions building **SLAP**, an in-feed context workspace for social feeds. Technically it worked. But once I sat down to use it on real threads, I hit a product problem that no amount of prompt tuning could fix.

The problem was not the latency. It was not the architecture. The problem was that every single reply it generated sounded like unsolicited advice from someone who had never done the thing they were advising on.

> When a real person leaves a great comment, they share lived experience. Advice without personal experience reads like synthetic marketing noise.

That insight is what killed the project. All the engineering work below ,  the microVM experiments, the Nebius provider switch, the 3-reply limit ,  that was all real and it was all pretty interesting. But none of it mattered once I understood the root flaw.

All right, so let me walk through what actually happened.



## Problem I Was Trying to Solve

If you spend any time building in public on social feeds, you know the advice. Go to big accounts every morning. Leave 30 thoughtful comments. Borrow their audience. Drive people back to your profile.

It sounds reasonable on podcasts. But by comment twelve your focus is gone. You stare at a thread with forty opinions, type a response, erase it, second-guess the wording, and end up posting something hollow like "Great point" or a thumbs-up emoji.

Generic AI comment tools make this worse. They flood timelines with hollow enthusiasm and robotic praise. Readers spot them immediately, and the algorithm ignores them.

I wanted something smarter. The idea for SLAP was an in-feed workflow that would inspect a post, evaluate attached charts, read through the top twenty to thirty existing comments so you never echo what someone else already said, and offer three distinct angles with one human reply each. You could also record a quick audio note to lock in your real stance before any model touched the phrasing.

Now, that was the dream. Here is what 45 hours of building actually looked like.



## Hitting the MicroVM Wall

When I started sketching the backend, I tried spinning up isolated Linux microVMs to run headless scripts and shell utilities.

Dead end. Booting virtual machines for a fast in-feed action is way too slow, and paying for idle machine seconds makes no sense for lightweight runs. Cloudflare Workers run on V8 isolates. They cannot fork child processes or execute shell scripts. I mean, I knew this in theory, but I tried it anyway.

So I took a different path: treating Cloudflare R2 object storage directly as a virtual filesystem.

> By treating R2 as a virtual disk, each generation gets a clean workspace folder in plain text files ,  zero container boot times, no SQLite bloat.

Using small, deterministic read and write operations, each session created a folder under `sessions/{userId}/{sessionId}/`. It stored the target post, author profile, top replies, user voice rules, and final drafts in plain TOML and Markdown. Zero startup delay. Straightforward to debug. And kept multi-kilobyte payloads out of my database tables.

That part worked pretty well. But then latency almost killed everything.



## Latency Crisis

In early tests, the parallel pipeline finished in 15 to 18 seconds:

- Fetching the post and active replies in parallel: 4 to 8 seconds
- Text parsing to extract company names: milliseconds
- Tavily web search for company background: 6 seconds
- Gemini Flash Vision for chart images: 8 seconds
- Final synthesis call to Kimi k2.6: 7 seconds

Everything ran concurrently. Then someone added an extra intermediate model step to formulate the search queries before calling Tavily.

That single change broke the entire flow.

It turned a parallel workflow into a slow sequence: wait for the post, wait 15 seconds for a model to write search terms, wait for web search, wait for image extraction, then wait 40 seconds for the final synthesis. Runtimes jumped past 100 seconds, running straight into Cloudflare Workers execution limits.

I stripped the extra step out and went back to deterministic text matching. But even then, generation times would randomly drift back up to a full minute during busy traffic windows.

> Model latency is often an infrastructure and provider problem rather than a prompt pipeline flaw.

The real fix was switching synthesis to Nebius. Conventional API gateways backed up with long queues. Nebius delivered 300 to 800 tokens per second on DeepSeek V4.1 Flash, and over 190 tokens per second on GLM-5.3-Flash Nitro. That pulled final synthesis down to roughly two to three seconds.

At this point the pipeline was pretty fast. But I still had a design problem to fix.



## 3-Reply Rule

Early on, the generation step proposed offering three variations per angle, so nine options total.

I killed that immediately. Nine options is garbage. Giving someone nine options means they spend more time reviewing AI suggestions than actually participating in the conversation.

The codebase enforces one reply per angle across three distinct perspectives: a data-driven point, a counter-argument, or a pragmatic alternative. Three choices total. You pick the one that fits, copy it, move on.

Basically, less is more. That rule turned out to apply to the whole product too.



## Product Reality: Why I Paused

By early October 2026, the app and backend were deployed and functional.

Then I sat down to test it on real conversations, including a detailed debate on cold email software.

Every single generated reply sounded like unsolicited advice.

Think about the comments you actually respect on social media. People rarely appreciate an anonymous account chiming in with polished consulting tips. They respect someone who says: *"I tried that three months ago. Here is where our numbers broke. Here is what we changed."*

On cold email, I had zero personal experience. Because I had no real experience to draw from, the model defaulted to smooth, polished advice. It had nothing authentic to work with.

Now, to make an automated tool genuinely sound like you, it cannot just monitor incoming posts. It requires a continuous personal knowledge base: somewhere you dump your ongoing thoughts, real struggles, and daily notes, so a system actually knows what you believe and what you have been through.

Building that knowledge base is a completely separate product. Without it, a reply tool will always sound synthetic, no matter how much you tune the instructions.

I would say most AI comment tools fail for exactly this reason. They optimize for the reply, not the person making it.

Rather than shipping something I could not honestly recommend to myself, I put a pause notice directly on the site.



## What Happens Next

The project is on hold. But the work was not wasted.

The R2-as-disk pattern, the Turborepo monorepo structure, and the Nebius provider routing are all things I will carry forward. The real output of those 45 hours is a much clearer understanding of where AI-assisted social tools actually break down.

At the very least, now I know: the hard problem is not generating good replies. The hard problem is capturing the personal context that makes them sound real.

That is a different product. And I would rather build it right than ship something hollow.
