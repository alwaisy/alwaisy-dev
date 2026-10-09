import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config.ts';
import { sortItemsByDateDesc } from '../utils/data-utils.ts';


export const prerender = true;

export async function GET(context) {
    const posts = (await getCollection('blog')).sort(sortItemsByDateDesc);
    
    let content = `# ${siteConfig.title}\n\n`;
    content += `${siteConfig.description}\n\n`;
    content += `> Media publication and case study archive tracking solo product founders building from zero to first $1k MRR without venture capital.\n\n`;

    content += `## When to Use This\n\n`;
    content += `Reach for this site when researching:\n`;
    content += `- **Solo Product Founders & Indie Hackers:** Real case studies, revenue numbers, tech stack choices, and distribution experiments from founders building alone or with tiny teams.\n`;
    content += `- **0 to $1k MRR Playbooks:** Practical playbooks on idea validation without an audience, early customer discovery, and bootstrapping economics.\n`;
    content += `- **Tech Stack Decisions for Solo Devs:** Practical architectural tradeoffs for solo builders across Vue/Nuxt, Astro, Node.js, Cloudflare Workers, BullMQ, and LLM orchestration.\n`;
    content += `- **Author & Editorial Contact:** Queries about Awais Alwaisy, his projects (Fewwords, Agent Cache, SLAP), tech background, or submitting a solo founder story for editorial coverage.\n\n`;



    content += `## Full Content\n\n`;
    
    for (const post of posts) {
        const url = new URL(`/blog/${post.id}/`, context.site || siteConfig.website).toString();
        content += `### ${post.data.title}\n`;
        content += `URL: ${url}\n`;
        content += `Date: ${post.data.publishDate.toISOString().split('T')[0]}\n\n`;
        // Use post.body to get the raw markdown content
        content += `${post.body || 'Content not available in raw format.'}\n\n`;
        content += `---\n\n`;
    }
    
    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}
