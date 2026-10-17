import type { APIRoute } from 'astro';
import { verifyHumanRequest, normalizeSlug } from '../../../utils/view-counter';
import { resolveIntelligentPersona, generateFallbackPersona } from '../../../utils/middle-persona';

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

        let db: D1Database | undefined;
        let openRouterKey: string | undefined;

        try {
            const cfModule = await import('cloudflare:workers');
            const workerEnv = cfModule?.env as unknown as { ANALYTICS_DB?: D1Database; PAGE_VIEWS?: KVNamespace; OPENROUTER_API_KEY?: string } | undefined;
            db = workerEnv?.ANALYTICS_DB;
            openRouterKey = workerEnv?.OPENROUTER_API_KEY;
            if (!db) {
                const runtime = locals as { runtime?: { env?: { ANALYTICS_DB?: D1Database; PAGE_VIEWS?: KVNamespace; OPENROUTER_API_KEY?: string } } };
                db = runtime.runtime?.env?.ANALYTICS_DB;
                if (!openRouterKey) openRouterKey = runtime.runtime?.env?.OPENROUTER_API_KEY;
            }
        } catch {
            db = undefined;
        }

        // Increment legacy/unified PAGE_VIEWS KV counter if available
        try {
            let kv: KVNamespace | undefined;
            const cfModule = await import('cloudflare:workers');
            const workerEnv = cfModule?.env as unknown as { PAGE_VIEWS?: KVNamespace } | undefined;
            kv = workerEnv?.PAGE_VIEWS;
            if (!kv) {
                const runtime = locals as { runtime?: { env?: { PAGE_VIEWS?: KVNamespace } } };
                kv = runtime.runtime?.env?.PAGE_VIEWS;
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
            const persona = generateFallbackPersona(visitorId);
            return new Response(JSON.stringify({ ok: true, persona }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if visitor already has an assigned persona
        const existing = await db
            .prepare(`SELECT persona_name, persona_alias, persona_badge_color FROM visitors WHERE id = ?`)
            .bind(visitorId)
            .first<{ persona_name?: string; persona_alias?: string; persona_badge_color?: string }>();

        let personaName = existing?.persona_name;
        let personaAlias = existing?.persona_alias;
        let personaBadgeColor = existing?.persona_badge_color;

        // If new visitor, or previous persona had old tag "#", resolve smart persona with Jev
        if (!personaName || personaName.includes('#')) {
            const resolved = await resolveIntelligentPersona(
                visitorId,
                {
                    path: `/${path}`,
                    referrer,
                    device,
                    browser,
                    dwellTimeSeconds: dwellTime,
                    stepOrder
                },
                openRouterKey
            );
            personaName = resolved.name;
            personaAlias = resolved.alias;
            personaBadgeColor = resolved.badgeColor;
        }

        const activePersona = {
            name: personaName,
            alias: personaAlias || 'Visitor',
            badgeColor: personaBadgeColor || 'indigo'
        };

        // Atomic Upsert: Preserves existing persona while updating visit stats
        await db
            .prepare(`
                INSERT INTO visitors 
                (id, persona_name, persona_alias, persona_role, persona_quote, persona_badge_color, persona_emoji, first_seen, last_seen, visit_count, total_page_views, last_country, last_device, last_browser)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    last_seen = excluded.last_seen,
                    total_page_views = visitors.total_page_views + 1,
                    visit_count = CASE 
                        WHEN (excluded.last_seen - visitors.last_seen) > 1800000 THEN visitors.visit_count + 1 
                        ELSE visitors.visit_count 
                    END,
                    persona_name = excluded.persona_name,
                    persona_alias = excluded.persona_alias,
                    persona_badge_color = excluded.persona_badge_color,
                    last_country = excluded.last_country,
                    last_device = excluded.last_device,
                    last_browser = excluded.last_browser
            `)
            .bind(
                visitorId,
                activePersona.name,
                activePersona.alias,
                'Visitor',
                '',
                activePersona.badgeColor,
                '',
                now,
                now,
                country,
                device,
                browser
            )
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

        return new Response(JSON.stringify({ ok: true, persona: activePersona }), {
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
