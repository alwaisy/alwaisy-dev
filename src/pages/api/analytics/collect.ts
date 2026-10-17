import type { APIRoute } from 'astro';
import { verifyHumanRequest, normalizeSlug } from '../../../utils/view-counter';
import { generateMiddlePersona } from '../../../utils/middle-persona';

export const prerender = false;

interface CollectPayload {
    visitorId: string;
    sessionId: string;
    path: string;
    title?: string;
    referrer?: string;
    stepOrder?: number;
    dwellTimeSeconds?: number;
}

function parseDevice(ua: string): { device: string; browser: string } {
    const lower = ua.toLowerCase();
    let device = 'Desktop';
    if (/tablet|ipad/i.test(lower)) device = 'Tablet';
    else if (/mobile|iphone|android/i.test(lower)) device = 'Mobile';

    let browser = 'Other';
    if (lower.includes('chrome') && !lower.includes('edg')) browser = 'Chrome';
    else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
    else if (lower.includes('firefox')) browser = 'Firefox';
    else if (lower.includes('edg')) browser = 'Edge';

    return { device, browser };
}

export const POST: APIRoute = async ({ request, locals }) => {
    // Defense: Validate Human Traffic
    const verification = verifyHumanRequest(request);
    if (!verification.isHuman) {
        return new Response(JSON.stringify({ ok: false, reason: verification.reason }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body: CollectPayload = await request.json();
        const visitorId = body.visitorId ? String(body.visitorId).trim() : '';
        const sessionId = body.sessionId ? String(body.sessionId).trim() : '';
        const path = normalizeSlug(body.path || '/');
        const title = body.title ? String(body.title).slice(0, 150) : path;
        const referrer = body.referrer ? String(body.referrer).slice(0, 250) : 'Direct';
        const stepOrder = typeof body.stepOrder === 'number' ? body.stepOrder : 1;
        const dwellTime = typeof body.dwellTimeSeconds === 'number' ? body.dwellTimeSeconds : 0;

        if (!visitorId || !sessionId) {
            return new Response(JSON.stringify({ ok: false, error: 'Missing visitorId or sessionId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Extract Edge metadata from Cloudflare
        const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
        const country = cf?.country || 'US';
        const city = cf?.city || 'Unknown';
        const ua = request.headers.get('user-agent') || '';
        const { device, browser } = parseDevice(ua);
        const now = Date.now();

        // Access Cloudflare D1
        let db: D1Database | undefined;
        try {
            const runtime = locals as { runtime?: { env?: { ANALYTICS_DB?: D1Database; PAGE_VIEWS?: KVNamespace } } };
            if (runtime.runtime?.env?.ANALYTICS_DB) {
                db = runtime.runtime.env.ANALYTICS_DB;
            } else {
                const cloudflareWorkers = await import('cloudflare:workers');
                const env = cloudflareWorkers.env as unknown as { ANALYTICS_DB?: D1Database; PAGE_VIEWS?: KVNamespace };
                db = env.ANALYTICS_DB;
            }
        } catch {
            db = undefined;
        }

        // Also increment legacy/unified PAGE_VIEWS KV counter if available
        try {
            let kv: KVNamespace | undefined;
            const runtime = locals as { runtime?: { env?: { PAGE_VIEWS?: KVNamespace } } };
            if (runtime.runtime?.env?.PAGE_VIEWS) {
                kv = runtime.runtime.env.PAGE_VIEWS;
            } else {
                const cloudflareWorkers = await import('cloudflare:workers');
                const env = cloudflareWorkers.env as unknown as { PAGE_VIEWS?: KVNamespace };
                kv = env.PAGE_VIEWS;
            }
            if (kv) {
                const viewKey = `views:${path}`;
                const currentStr = await kv.get(viewKey);
                const currentViews = currentStr ? parseInt(currentStr, 10) : 0;
                await kv.put(viewKey, String(currentViews + 1));
            }
        } catch {
            // KV fallback optional
        }

        if (!db) {
            // Return persona preview even in local mode without D1 binding
            const persona = generateMiddlePersona(visitorId, 1);
            return new Response(JSON.stringify({ ok: true, persona }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Check existing visitor to calculate visit_count & persona
        const existingVisitor = await db
            .prepare('SELECT id, visit_count, total_page_views, last_seen FROM visitors WHERE id = ?')
            .bind(visitorId)
            .first<{ id: string; visit_count: number; total_page_views: number; last_seen: number }>();

        let newVisitCount = 1;
        let newTotalViews = 1;

        if (existingVisitor) {
            // If more than 30 minutes since last interaction, count as new session/visit
            const isNewSession = (now - existingVisitor.last_seen) > (30 * 60 * 1000);
            newVisitCount = isNewSession ? existingVisitor.visit_count + 1 : existingVisitor.visit_count;
            newTotalViews = existingVisitor.total_page_views + 1;

            const persona = generateMiddlePersona(visitorId, newVisitCount);

            await db
                .prepare(`
                    UPDATE visitors 
                    SET last_seen = ?, 
                        visit_count = ?, 
                        total_page_views = ?, 
                        last_country = ?, 
                        last_device = ?, 
                        last_browser = ?
                    WHERE id = ?
                `)
                .bind(now, newVisitCount, newTotalViews, country, device, browser, visitorId)
                .run();

            // 2. Insert Journey Step
            await db
                .prepare(`
                    INSERT INTO journeys 
                    (visitor_id, session_id, path, title, referrer, step_order, dwell_time_seconds, created_at, country, city, device, browser)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `)
                .bind(visitorId, sessionId, `/${path}`, title, referrer, stepOrder, dwellTime, now, country, city, device, browser)
                .run();

            return new Response(JSON.stringify({ ok: true, persona, visitCount: newVisitCount }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // New Visitor Creation
        const persona = generateMiddlePersona(visitorId, 1);
        await db
            .prepare(`
                INSERT INTO visitors 
                (id, persona_name, persona_alias, persona_role, persona_quote, persona_badge_color, persona_emoji, first_seen, last_seen, visit_count, total_page_views, last_country, last_device, last_browser)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                visitorId,
                persona.name,
                persona.alias,
                persona.role,
                persona.quote,
                persona.badgeColor,
                persona.avatarEmoji,
                now,
                now,
                1,
                1,
                country,
                device,
                browser
            )
            .run();

        // Insert initial journey
        await db
            .prepare(`
                INSERT INTO journeys 
                (visitor_id, session_id, path, title, referrer, step_order, dwell_time_seconds, created_at, country, city, device, browser)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(visitorId, sessionId, `/${path}`, title, referrer, stepOrder, dwellTime, now, country, city, device, browser)
            .run();

        return new Response(JSON.stringify({ ok: true, persona, visitCount: 1 }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
