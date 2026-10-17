import type { APIRoute } from 'astro';

export const prerender = false;

export interface JourneyStep {
    id: number;
    sessionId: string;
    path: string;
    title: string;
    referrer: string;
    stepOrder: number;
    dwellTimeSeconds: number;
    createdAt: number;
    country: string;
    city: string;
    device: string;
    browser: string;
}

export interface VisitorWithJourney {
    id: string;
    personaName: string;
    personaAlias: string;
    personaRole: string;
    personaQuote: string;
    personaBadgeColor: string;
    personaEmoji: string;
    firstSeen: number;
    lastSeen: number;
    visitCount: number;
    totalPageViews: number;
    lastCountry: string;
    lastDevice: string;
    lastBrowser: string;
    journey: JourneyStep[];
}

export const GET: APIRoute = async ({ locals }) => {
    let db: D1Database | undefined;
    let dbError: string | null = null;
    try {
        const cfModule = await import('cloudflare:workers');
        const workerEnv = cfModule?.env as unknown as { ANALYTICS_DB?: D1Database } | undefined;
        db = workerEnv?.ANALYTICS_DB;
        if (!db) {
            const runtime = locals as { runtime?: { env?: { ANALYTICS_DB?: D1Database } } };
            db = runtime.runtime?.env?.ANALYTICS_DB;
        }
    } catch (e) {
        dbError = e instanceof Error ? e.message : String(e);
        db = undefined;
    }

    if (!db) {
        return new Response(JSON.stringify({
            summary: {
                totalPageViews: 0,
                uniqueVisitors: 0,
                returningVisitors: 0,
                topPersona: 'None yet'
            },
            visitors: [],
            topPages: [],
            topReferrers: [],
            countries: [],
            devices: [],
            dailyTrends: [],
            debugDbMissing: true,
            dbError
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 1. Core Totals
        const totalViewsRow = await db.prepare('SELECT COUNT(*) as count FROM journeys').first<{ count: number }>();
        const uniqueVisitorsRow = await db.prepare('SELECT COUNT(*) as count FROM visitors').first<{ count: number }>();
        const returningVisitorsRow = await db.prepare('SELECT COUNT(*) as count FROM visitors WHERE visit_count > 1').first<{ count: number }>();
        const bounceVisitorsRow = await db.prepare('SELECT COUNT(*) as count FROM visitors WHERE total_page_views = 1').first<{ count: number }>();
        const topCountryRow = await db.prepare('SELECT country, COUNT(*) as count FROM journeys WHERE country != \'\' AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 1').first<{ country: string; count: number }>();

        const totalViews = totalViewsRow?.count || 0;
        const uniqueVisitors = uniqueVisitorsRow?.count || 0;
        const singlePageBounces = bounceVisitorsRow?.count || 0;
        const bounceRate = uniqueVisitors > 0 ? Math.round((singlePageBounces / uniqueVisitors) * 100) : 0;
        const topCountry = topCountryRow ? `${topCountryRow.country} (${Math.round((topCountryRow.count / (totalViews || 1)) * 100)}%)` : '--';

        // 2. Top Pages
        const topPages = await db.prepare(`
            SELECT path, COUNT(*) as views 
            FROM journeys 
            GROUP BY path 
            ORDER BY views DESC 
            LIMIT 10
        `).all<{ path: string; views: number }>();

        // 3. Top Referrers
        const topReferrers = await db.prepare(`
            SELECT referrer, COUNT(*) as count 
            FROM journeys 
            WHERE referrer != '' AND referrer IS NOT NULL
            GROUP BY referrer 
            ORDER BY count DESC 
            LIMIT 8
        `).all<{ referrer: string; count: number }>();

        // 4. Country Breakdown
        const countries = await db.prepare(`
            SELECT country, COUNT(*) as count 
            FROM journeys 
            WHERE country != '' AND country IS NOT NULL
            GROUP BY country 
            ORDER BY count DESC 
            LIMIT 8
        `).all<{ country: string; count: number }>();

        // 5. Device Breakdown
        const devices = await db.prepare(`
            SELECT device, COUNT(*) as count 
            FROM journeys 
            WHERE device != '' AND device IS NOT NULL
            GROUP BY device 
            ORDER BY count DESC
        `).all<{ device: string; count: number }>();

        // 6. Recent Visitors with their Journeys (latest 15 visitors)
        const recentVisitors = await db.prepare(`
            SELECT 
                id, 
                persona_name as personaName, 
                persona_alias as personaAlias, 
                persona_role as personaRole, 
                persona_quote as personaQuote, 
                persona_badge_color as personaBadgeColor, 
                persona_emoji as personaEmoji, 
                first_seen as firstSeen, 
                last_seen as lastSeen, 
                visit_count as visitCount, 
                total_page_views as totalPageViews, 
                last_country as lastCountry, 
                last_device as lastDevice, 
                last_browser as lastBrowser
            FROM visitors
            ORDER BY last_seen DESC
            LIMIT 15
        `).all<Omit<VisitorWithJourney, 'journey'>>();

        // Fetch journey steps for each recent visitor
        const visitorsWithJourney: VisitorWithJourney[] = [];
        for (const visitor of (recentVisitors.results || [])) {
            const steps = await db.prepare(`
                SELECT 
                    id, 
                    session_id as sessionId, 
                    path, 
                    title, 
                    referrer, 
                    step_order as stepOrder, 
                    dwell_time_seconds as dwellTimeSeconds, 
                    created_at as createdAt, 
                    country, 
                    city, 
                    device, 
                    browser
                FROM journeys
                WHERE visitor_id = ?
                ORDER BY created_at ASC
                LIMIT 20
            `).bind(visitor.id).all<JourneyStep>();

            visitorsWithJourney.push({
                ...visitor,
                journey: steps.results || []
            });
        }

        // 7. Daily Trends (full 14-day continuous range with 0-filled days)
        const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        const rawTrends = await db.prepare(`
            SELECT 
                date(created_at / 1000, 'unixepoch') as date, 
                COUNT(*) as views 
            FROM journeys 
            WHERE created_at >= ?
            GROUP BY date 
            ORDER BY date ASC
        `).bind(fourteenDaysAgo).all<{ date: string; views: number }>();

        const trendMap = new Map<string, number>();
        for (const row of (rawTrends.results || [])) {
            trendMap.set(row.date, row.views);
        }

        // Fill complete continuous 14-day range
        const dailyTrends: Array<{ date: string; label: string; views: number }> = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
            const dateStr = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyTrends.push({
                date: dateStr,
                label,
                views: trendMap.get(dateStr) || 0
            });
        }

        return new Response(JSON.stringify({
            summary: {
                totalPageViews: totalViews,
                uniqueVisitors: uniqueVisitors,
                returningVisitors: returningVisitorsRow?.count || 0,
                topCountry,
                topCountryCode: topCountryRow?.country || '',
                bounceRate: `${bounceRate}%`
            },
            visitors: visitorsWithJourney,
            topPages: topPages.results || [],
            topReferrers: topReferrers.results || [],
            countries: countries.results || [],
            devices: devices.results || [],
            dailyTrends
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=15, stale-while-revalidate=60'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
