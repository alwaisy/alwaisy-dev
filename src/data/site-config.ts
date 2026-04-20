import avatar from '../assets/images/avatar.png';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://alwaisy.dev',
    avatar: {
        src: avatar,
        alt: 'Awais Alwaisy'
    },
    title: 'Awais Alwaisy',
    subtitle: "Covering solo product founders. The ones building from 0 to first $1k MRR.",
    description:
        "I write about solo founders and indie hackers who ship without VC backing. Problem-first stories, real numbers, and the decisions that actually moved the needle.",
    image: {
        src: '/og.png',
        alt: 'Awais Alwaisy - Solo Founder Media'
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'Writings',
            href: '/blog'
        },
        {
            text: 'Tags',
            href: '/tags'
        }
    ],
    footerNavLinks: [
        {
            text: 'About Me',
            href: '/about'
        },
        {
            text: "Let's Talk",
            href: '/contact'
        }
    ],
    socialLinks: [
        {
            text: 'LinkedIn',
            href: 'https://linkedin.com/in/alwaisy'
        },
        {
            text: 'GitHub',
            href: 'https://github.com/alwaisy'
        },
        {
            text: 'X/Twitter',
            href: 'https://x.com/alvaisy'
        }
    ],
    hero: {
        title: "I cover solo product founders.",
        text: "Not funded startups. Not VC-backed companies. The people building products alone or with one other person. The ones figuring out how to get from zero to first customer, from first customer to $1k MRR.\n\nI started as a Vue developer in 2021. Built e-commerce stores, healthcare portals, legacy system rewrites. But I kept noticing the same pattern. Smart engineers executing other people's visions for their entire careers. I didn't want that.\n\nSo I tried things. YouTube channel. A Reddit community. A ProductHunt clone. A finance newsletter. And now **Fewwords** — an AI-powered summarization tool I built solo to solve my own problem.\n\nNow I write about people like me. I lead with the problem they solve, not their founder resume. I ask about their tech stack choices, their pricing decisions, the moment they almost quit.\n\nI'm one of these people. That is why I can cover them.",
        actions: [
            {
                text: "Read the about page",
                href: '/about'
            }
        ]
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
