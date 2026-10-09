// Content negotiation and agent helper utilities

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

export function withVaryAccept(headers: Headers): Headers {
    const currentVary = headers.get('Vary');
    if (!currentVary) {
        headers.set('Vary', 'Accept');
    } else if (!currentVary.toLowerCase().includes('accept')) {
        headers.set('Vary', `${currentVary}, Accept`);
    }
    return headers;
}

export function withAgentDiscoveryLinkHeaders(headers: Headers): Headers {
    headers.set(
        'Link',
        '</.well-known/api-catalog>; rel="api-catalog", ' +
        '</about>; rel="service-doc", ' +
        '</.well-known/ai-catalog.json>; rel="ai-catalog", ' +
        '</llms.txt>; rel="describedby"'
    );
    return headers;
}
