// Human verification and bot protection utilities for page view tracking

export interface VerificationResult {
    isHuman: boolean;
    reason?: string;
}

// Known bot User-Agent substrings
const BOT_UA_PATTERNS = [
    'bot',
    'crawl',
    'spider',
    'slurp',
    'mediapartners',
    'curl',
    'wget',
    'python',
    'httpclient',
    'postman',
    'headless',
    'lighthouse',
    'bytespider',
    'gptbot',
    'chatgpt',
    'claudebot',
    'anthropic',
    'cohere',
    'perplexity',
    'applebot',
    'yandex',
    'duckduckbot',
    'baiduspider',
    'sogou',
    'exabot',
    'facebot',
    'facebookexternalhit',
    'ia_archiver'
];

/**
 * Validates whether an incoming HTTP request appears to be from a legitimate human browser.
 * Employs multiple defense layers.
 */
export function verifyHumanRequest(request: Request): VerificationResult {
    const ua = (request.headers.get('user-agent') || '').toLowerCase();

    // Defense Layer 1: Missing or trivial User-Agent
    if (!ua || ua.length < 12) {
        return { isHuman: false, reason: 'missing_or_short_ua' };
    }

    // Defense Layer 2: Known scraper/bot User-Agent patterns
    if (BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern))) {
        return { isHuman: false, reason: 'bot_ua_pattern' };
    }

    // Defense Layer 3: Cloudflare Bot Management signals (when running in production on Cloudflare)
    // request.cf is injected by Cloudflare edge runtime
    const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
    if (cf) {
        // If Cloudflare flagged it as a verified bot (search engine, crawler)
        if (cf.verifiedBot) {
            return { isHuman: false, reason: 'cf_verified_bot' };
        }
        // If Cloudflare Bot Score is available (1-99), score < 30 is automated traffic
        if (typeof cf.botManagement?.score === 'number' && cf.botManagement.score < 30) {
            return { isHuman: false, reason: 'cf_bot_score_low' };
        }
    }

    // Defense Layer 4: Purpose prefetch header inspection
    // Browsers send Purpose/Sec-Purpose when prefetching links ahead of time; don't count as a view
    const purpose = request.headers.get('purpose') || request.headers.get('sec-purpose');
    if (purpose && purpose.toLowerCase().includes('prefetch')) {
        return { isHuman: false, reason: 'prefetch' };
    }

    // Defense Layer 5: Sec-Fetch-Dest / Sec-Fetch-Mode sanity
    // Real browser navigation/fetch requests define Sec-Fetch-Mode as 'cors' or 'navigate'
    const secFetchMode = request.headers.get('sec-fetch-mode');
    if (secFetchMode && secFetchMode !== 'cors' && secFetchMode !== 'no-cors' && secFetchMode !== 'navigate') {
        return { isHuman: false, reason: 'invalid_fetch_mode' };
    }

    return { isHuman: true };
}

/**
 * Generates a privacy-friendly, rotating daily hash for deduplicating visitor views.
 * No persistent cookies or personal data are stored.
 */
export async function getDailyVisitorHash(request: Request, slug: string): Promise<string> {
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown-ip';
    const ua = request.headers.get('user-agent') || 'unknown-ua';
    // Salt with today's UTC date string (e.g. 2026-10-17) so hashes cannot be cross-referenced across days
    const today = new Date().toISOString().split('T')[0];

    const data = `${ip}::${ua}::${today}::${slug}`;
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(data));

    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Normalizes a URL pathname or identifier into a canonical slug key for KV storage.
 */
export function normalizeSlug(raw: string): string {
    let slug = raw.trim().toLowerCase();
    // Strip leading and trailing slashes
    slug = slug.replace(/^\/+|\/+$/g, '');
    if (!slug) return 'home';
    return slug;
}
