---
title: 'Avatown - Virtual Avatar Marketplace'
description: A marketplace for virtual avatars across VRChat, Spatial, and Neos VR. Built from scratch as founding frontend engineer, and lessons learned after Dolami shut down.
publishDate: 'May 06 2023'
isFeatured: false
seo:
  image:
    src: '/media/projects/avatown.png'
    alt: Avatown marketplace preview
---

![Project preview](/media/projects/avatown.png)

*(Note: Dolami, Inc. and the Avatown service have officially shut down.)*

I joined <mark>Dolami, Inc.</mark> in 2023 as a founding engineer. On May 6, 2023, I started building Avatown from scratch. Zero pages, zero users, just an ambitious idea. The marketplace was designed to let 3D creators buy, sell, and discover virtual avatars, wearables, and accessories across platforms like <mark>VRChat</mark>, <mark>Spatial</mark>, and <mark>Neos VR</mark>.

## Technical Decisions (The Hard Way)

**Initial Stack:**

- <mark>Next.js</mark> 13 with App Router
- <mark>Material UI</mark> (MUI)
- <mark>Tailwind CSS</mark>
- Atomic Design Pattern
- Server Components

I spent 8 months working with the team to launch the initial beta. Three developers, eight months for a beta. Why did it take so long?

- MUI was difficult to customize and fight against
- Atomic Design created an overly rigid component hierarchy
- Next.js 13 App Router had a steep learning curve back then
- I was learning architectural patterns while trying to ship under pressure

Those eight months of mistakes taught me firsthand what not to do.

## The Senior Engineer Reset

After beta, I advocated for bringing in a senior frontend engineer. Dolami hired one, and working alongside him reshaped how I approach web software. He showed me where my architectural decisions were brittle and where simpler choices would make iterating much faster.

What changed in our stack:

1. **Server Functions to React Query**
   - I resisted this at first because I wanted everything in pure server components
   - I quickly realized why client-side caching and mutation states work better for interactive web apps

2. **MUI to shadcn/ui and Native Tailwind**
   - Removed bloated style wrappers and custom class prefixes
   - Iteration speed doubled almost immediately

3. **Retiring Atomic Design**
   - Atoms, molecules, and organisms sound clean in theory, but they slowed down day-to-day feature development
   - We switched to feature-based domain folders that matched real workflows

4. **Cleaner Project Architecture and i18n**
   - Clean separation of concerns designed with the team
   - Proper internationalization (English and Japanese) to serve creator communities worldwide

## Results and Velocity

Once the new stack was in place:

- Development velocity increased by roughly 50%
- Bundle sizes and page performance improved by 40%
- Developer experience was night and day compared to the early months

Writing code felt effortless again, and shipping features took days instead of weeks.

## The Shutdown and Founder Retrospective

Dolami, Inc. has officially closed its doors.

After Avatown, the founder spent about a year testing alternative hypotheses across the augmented reality space. Despite gaining hundreds of early users, the core hypotheses needed to scale into a venture-scale business did not pan out.

Looking back, the founder shared an honest retrospective that stuck with me: the biggest hurdle was **underestimating platform risk**.

Building on top of third-party platforms like VRChat meant Avatown was tethered to ecosystems it could not control:

- Closed avatar pipeline changes and ecosystem friction
- Reliance on game updates and platform policies
- Difficulty creating a standalone economic moat outside the host games

The founder took the hard lessons in stride to build skills before his next chapter, and sent a warm note thanking me for building the frontend foundation from day one.

## Core Lessons

> Sometimes you need a more experienced engineer to look at your code and tell you you are wrong. It saves you months of stubborn wheel-spinning.

> Never build an entire business model on top of someone else's walled garden without pricing in platform risk. If the host platform shifts, your entire distribution layer shifts with it.

> Atomic Design is rarely worth the ceremony for fast-moving startups, and being wrong early is far cheaper than being wrong late.
