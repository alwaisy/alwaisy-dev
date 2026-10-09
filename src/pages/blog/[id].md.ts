import { getCollection, type CollectionEntry } from 'astro:content';
import siteConfig from '../../data/site-config';

export const prerender = true;

export async function getStaticPaths() {
    const posts = await getCollection('blog');
    return posts.map((post) => ({
        params: { id: post.id },
        props: { post }
    }));
}

type Props = { post: CollectionEntry<'blog'> };

export async function GET({ props }: { props: Props }) {
    const { post } = props;
    const url = `${siteConfig.website}/blog/${post.id}/`;
    const publishDate = post.data.publishDate.toISOString().split('T')[0];

    let content = `# ${post.data.title}\n\n`;
    content += `URL: ${url}\n`;
    content += `Published: ${publishDate}\n`;
    if (post.data.tags?.length) {
        content += `Tags: ${post.data.tags.join(', ')}\n`;
    }
    if (post.data.excerpt) {
        content += `\n> ${post.data.excerpt}\n`;
    }
    content += `\n---\n\n`;
    content += `${post.body || ''}\n`;

    return new Response(content, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept'
        }
    });
}
