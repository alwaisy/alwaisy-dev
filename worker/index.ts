interface Env {
    ASSETS: {
        fetch(request: Request | string): Promise<Response>;
    };
}

// Parses the Accept header and checks if Markdown is preferred or requested over HTML
export function prefersMarkdown(header: string | null): boolean {
    if (!header) return false;
    const parts = header.split(',').map((s) => {
        const [mime, ...params] = s.trim().split(';');
        let q = 1.0;
        for (const param of params) {
            const [k, v] = param.trim().split('=');
            if (k === 'q') q = parseFloat(v);
        }
        return { mime: mime.trim().toLowerCase(), q: Number.isNaN(q) ? 1.0 : q };
    });

    let markdownQ = 0;
    let htmlQ = 0;

    for (const part of parts) {
        if (part.mime === 'text/markdown') {
            markdownQ = Math.max(markdownQ, part.q);
        }
        if (part.mime === 'text/html') {
            htmlQ = Math.max(htmlQ, part.q);
        }
    }

    return markdownQ > 0 && markdownQ >= htmlQ;
}

export function formatMarkdown404(pathname: string): string {
    return (
        `# 404 Not Found\n\n` +
        `The requested URL \`${pathname}\` was not found on this server.\n\n` +
        `Here are some helpful links:\n` +
        `- Sitemaps: https://alwaisy.dev/sitemap-index.xml\n` +
        `- LLMs Index: https://alwaisy.dev/llms.txt\n` +
        `- Full Content Archive: https://alwaisy.dev/llms-full.txt\n` +
        `- Homepage: https://alwaisy.dev/\n`
    );
}

export function withVaryAccept(res: Response): Response {
    const headers = new Headers(res.headers);
    const currentVary = headers.get('Vary');
    if (!currentVary) {
        headers.set('Vary', 'Accept');
    } else if (!currentVary.toLowerCase().includes('accept')) {
        headers.set('Vary', `${currentVary}, Accept`);
    }
    return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers
    });
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const accept = request.headers.get('accept');
        const isMarkdown = prefersMarkdown(accept);

        // Markdown content negotiation for homepage
        if ((url.pathname === '/' || url.pathname === '') && isMarkdown) {
            const llmsUrl = new URL('/llms.txt', request.url);
            const llmsRes = await env.ASSETS.fetch(new Request(llmsUrl.toString()));
            if (llmsRes.ok) {
                const markdownBody = await llmsRes.text();
                return new Response(markdownBody, {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': 'text/markdown; charset=utf-8',
                        'Vary': 'Accept'
                    }
                });
            }
        }

        // Try asset fetch
        const assetResponse = await env.ASSETS.fetch(request);

        // Agent-friendly 404 response
        if (assetResponse.status === 404) {
            if (isMarkdown) {
                return new Response(formatMarkdown404(url.pathname), {
                    status: 404,
                    statusText: 'Not Found',
                    headers: {
                        'Content-Type': 'text/markdown; charset=utf-8',
                        'Vary': 'Accept'
                    }
                });
            }
            return withVaryAccept(assetResponse);
        }

        return withVaryAccept(assetResponse);
    }
};
