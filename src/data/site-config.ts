import avatar from '../assets/images/avatar.png';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://alwaisy.dev',
    avatar: {
        src: avatar,
        alt: 'Awais Alwaisy / Startup Guy'
    },
    title: 'Awais Alwaisy / Startup Guy',
    subtitle: "Building Pakistan's Startup Ecosystem",
    description:
        "Frontend Engineer turned Community Builder. Founder of PakStartups. Building the infrastructure that produces Pakistan's next generation of founders and CEOs.",
    image: {
        src: '/og.png',
        alt: 'Awais Alwaisy - Community Builder & Founder'
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
        title: "Hey, I'm Awais. I Build Ecosystems, Not Just Code.",
        text: "After 3+ years building B2B SaaS frontends for US companies, I realized something. Real impact comes from creating platforms where others can build.\n\nNow I'm focused on Pakistan's startup infrastructure. Founded **PakStartups** (Pakistan's largest startup community on Reddit), building ProductHunt for Pakistani startups, and creating 7+ professional communities across ML/AI, embedded systems, UX, and more.\n\nPreviously shipped healthcare portals with 40% productivity improvements, e-commerce platforms handling thousands of daily transactions, and legacy system modernizations with 50% performance gains.\n\nTech stack: React, Next.js 14, TypeScript, Vue.js 3, Node.js.\n\nCheck out my work on [GitHub](https://github.com/alwaisy) or connect on [LinkedIn](https://linkedin.com/in/alwaisy).",
        actions: [
            {
                text: "Let's Chat",
                href: '/contact'
            }
        ]
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
