import type { APIRoute } from 'astro';
import { verifyHumanRequest, normalizeSlug } from '../../../utils/view-counter';
import { resolveUniqueIntelligentPersona, generateRandomFallbackPersona } from '../../../utils/middle-persona';

export const prerender = false;

interface CollectPayload {
    type?: 'pageview' | 'dwell';
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
            const persona = generateRandomFallbackPersona(visitorId, new Set());
            return new Response(JSON.stringify({ ok: true, persona }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if THIS visitor already has an assigned persona
        const existing = await db
            .prepare(`SELECT persona_name, persona_alias, persona_badge_color FROM visitors WHERE id = ?`)
            .bind(visitorId)
            .first<{ persona_name?: string; persona_alias?: string; persona_badge_color?: string }>();

        let personaName = existing?.persona_name;
        let personaAlias = existing?.persona_alias;
        let personaBadgeColor = existing?.persona_badge_color;

        // If new visitor, query ALL currently claimed persona names from D1 to guarantee 100% uniqueness
        if (!personaName || personaName.includes('#')) {
            const claimedRows = await db
                .prepare(`SELECT persona_name FROM visitors WHERE id != ?`)
                .bind(visitorId)
                .all<{ persona_name: string }>();

            const claimedNames = new Set<string>();
            for (const row of (claimedRows.results || [])) {
                if (row.persona_name) claimedNames.add(row.persona_name);
            }

            // Resolve persona via while loop with Jev and database verification
            const resolved = await resolveUniqueIntelligentPersona(
                visitorId,
                {
                    path: `/${path}`,
                    referrer,
                    device,
                    browser,
                    dwellTimeSeconds: dwellTime,
                    stepOrder
                },
                claimedNames,
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

        // Try atomic upsert with collision retry:
        // If two simultaneous hits try to claim the exact same name at the exact same millisecond,
        // the UNIQUE constraint will trigger a catch block, which immediately generates a clean unique fallback.
        let insertSuccess = false;
        let finalPersona = activePersona;

        for (let retry = 0; retry < 2 && !insertSuccess; retry++) {
            try {
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
                        finalPersona.name,
                        finalPersona.alias,
                        'Visitor',
                        '',
                        finalPersona.badgeColor,
                        '',
                        now,
                        now,
                        country,
                        device,
                        browser
                    )
                    .run();

                insertSuccess = true;
            } catch (upsertErr) {
                // If a unique constraint collision happened on persona_name due to concurrent race condition
                const errStr = String(upsertErr);
                if (errStr.includes('UNIQUE constraint failed: visitors.persona_name') || errStr.includes('idx_visitors_persona_name')) {
                    // Pick a guaranteed unique random string fallback
                    finalPersona = generateRandomFallbackPersona(visitorId, new Set([finalPersona.name]));
                } else {
                    throw upsertErr;
                }
            }
        }

        // 2. Journey Tracking:
        // If this is a dwell heartbeat / page unload event, update dwell_time_seconds on the existing step
        if (body.type === 'dwell') {
            await db
                .prepare(`
                    UPDATE journeys 
                    SET dwell_time_seconds = MAX(dwell_time_seconds, ?)
                    WHERE id = (
                        SELECT id FROM journeys 
                        WHERE visitor_id = ? AND session_id = ? AND path = ?
                        ORDER BY created_at DESC 
                        LIMIT 1
                    )
                `)
                .bind(dwellTime, visitorId, sessionId, `/${path}`)
                .run();

            return new Response(JSON.stringify({ ok: true, updatedDwell: dwellTime }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Otherwise this is a fresh pageview: Insert new Journey Step
        await db
            .prepare(`
                INSERT INTO journeys 
                (visitor_id, session_id, path, title, referrer, step_order, dwell_time_seconds, created_at, country, city, device, browser)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
            `)
            .bind(visitorId, sessionId, `/${path}`, title, referrer, stepOrder, now, country, city, device, browser)
            .run();

        return new Response(JSON.stringify({ ok: true, persona: finalPersona }), {
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
