import { getCollection, type CollectionEntry } from 'astro:content';
import siteConfig from '../data/site-config';

export const prerender = true;

export async function getStaticPaths() {
    const pages = await getCollection('pages');
    return pages.map((page) => ({
        params: { id: page.id },
        props: { page }
    }));
}

type Props = { page: CollectionEntry<'pages'> };

export async function GET({ props }: { props: Props }) {
    const { page } = props;
    const url = `${siteConfig.website}/${page.id}/`;

    let content = `# ${page.data.title}\n\n`;
    content += `URL: ${url}\n`;
    if (page.data.seo?.description) {
        content += `\n> ${page.data.seo.description}\n`;
    }
    content += `\n---\n\n`;
    content += `${page.body || ''}\n`;

    return new Response(content, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept'
        }
    });
}
