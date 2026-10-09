import { getCollection, type CollectionEntry } from 'astro:content';
import siteConfig from '../../data/site-config';

export const prerender = true;

export async function getStaticPaths() {
    const projects = await getCollection('projects');
    return projects.map((project) => ({
        params: { id: project.id },
        props: { project }
    }));
}

type Props = { project: CollectionEntry<'projects'> };

export async function GET({ props }: { props: Props }) {
    const { project } = props;
    const url = `${siteConfig.website}/projects/${project.id}/`;
    const publishDate = project.data.publishDate.toISOString().split('T')[0];

    let content = `# ${project.data.title}\n\n`;
    content += `URL: ${url}\n`;
    content += `Published: ${publishDate}\n`;
    if (project.data.description) {
        content += `\n> ${project.data.description}\n`;
    }
    content += `\n---\n\n`;
    content += `${project.body || ''}\n`;

    return new Response(content, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept'
        }
    });
}
