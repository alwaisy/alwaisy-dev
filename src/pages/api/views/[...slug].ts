import type { APIRoute } from 'astro';
import { verifyHumanRequest, getDailyVisitorHash, normalizeSlug } from '../../../utils/view-counter';

export const prerender = false;

// In-memory fallback for local development or when KV binding is not initialized
const devMemoryCounts = new Map<string, number>();
const devMemoryHashes = new Set<string>();

async function getKvBinding(): Promise<KVNamespace | null> {
    // In Cloudflare Workers runtime (Astro v6), env is provided by 'cloudflare:workers'
    try {
        const cfModule = await import('cloudflare:workers');
        const workerEnv = cfModule?.env as { PAGE_VIEWS?: KVNamespace } | undefined;
        return workerEnv?.PAGE_VIEWS || null;
    } catch {
        // Running in Node dev server or environment without workerd
        return null;
    }
}

export const GET: APIRoute = async ({ params }) => {
    const rawSlug = params.slug || 'home';
    const slug = normalizeSlug(rawSlug);
    const kv = await getKvBinding();

    let views = 0;
    if (kv) {
        try {
            const val = await kv.get(`views:${slug}`);
            views = val ? parseInt(val, 10) : 0;
        } catch {
            views = 0;
        }
    } else {
        views = devMemoryCounts.get(slug) || 0;
    }

    return new Response(JSON.stringify({ slug, views }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    });
};

export const POST: APIRoute = async ({ params, request }) => {
    const rawSlug = params.slug || 'home';
    const slug = normalizeSlug(rawSlug);

    // Defense Layer 1-5: Edge and request-level human inspection
    const verification = verifyHumanRequest(request);
    if (!verification.isHuman) {
        return new Response(JSON.stringify({ ok: false, error: 'rejected', reason: verification.reason }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Defense Layer 6: Payload validation (client sends engagement token)
    let body: { engaged?: boolean; t?: number } | null = null;
    try {
        body = (await request.json()) as { engaged?: boolean; t?: number };
    } catch {
        body = null;
    }

    // Require client proof of engagement
    if (!body || body.engaged !== true) {
        return new Response(JSON.stringify({ ok: false, error: 'missing_engagement' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const kv = await getKvBinding();
    const visitorHash = await getDailyVisitorHash(request, slug);

    let views = 0;
    let incremented = false;

    if (kv) {
        try {
            // Defense Layer 7: Server-side 24-hour deduplication via KV with expiration TTL
            const alreadySeen = await kv.get(`seen:${visitorHash}`);

            const currentStr = await kv.get(`views:${slug}`);
            views = currentStr ? parseInt(currentStr, 10) : 0;

            if (!alreadySeen) {
                views += 1;
                incremented = true;
                // Store updated count
                await kv.put(`views:${slug}`, views.toString());
                // Mark visitor hash as counted for 24 hours (86,400 seconds)
                await kv.put(`seen:${visitorHash}`, '1', { expirationTtl: 86400 });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'kv_error';
            return new Response(JSON.stringify({ ok: false, error: message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } else {
        // Local dev memory fallback
        const alreadySeen = devMemoryHashes.has(visitorHash);
        views = devMemoryCounts.get(slug) || 0;

        if (!alreadySeen) {
            views += 1;
            incremented = true;
            devMemoryCounts.set(slug, views);
            devMemoryHashes.add(visitorHash);
        }
    }

    return new Response(JSON.stringify({ ok: true, slug, views, incremented }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    });
};
