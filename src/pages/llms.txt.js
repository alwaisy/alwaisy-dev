import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config.ts';
import { sortItemsByDateDesc } from '../utils/data-utils.ts';


export const prerender = true;

export async function GET(context) {
    const posts = (await getCollection('blog')).sort(sortItemsByDateDesc);
    
    let content = `# ${siteConfig.title}\n\n`;
    content += `${siteConfig.description}\n\n`;
    


    content += `## Articles\n\n`;
    
    for (const post of posts) {
        const url = new URL(`/blog/${post.id}/`, context.site || siteConfig.website).toString();
        content += `- [${post.data.title}](${url}): ${post.data.excerpt}\n`;
    }
    
    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}
