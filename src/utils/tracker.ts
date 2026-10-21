/**
 * Client-Side Autonomous Analytics Tracker with True Per-Page Dwell Time Tracking
 */

const COOKIE_VISITOR = 'mid_v_id';
const COOKIE_SESSION = 'mid_s_id';
const STORAGE_KEY_STEP = 'mid_step_order';
const SESSION_TTL_SECONDS = 30 * 60; // 30 minutes rolling session window
const VISITOR_TTL_SECONDS = 365 * 24 * 60 * 60; // 1 year visitor persistence

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function getOrGenerateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// In-memory state for currently active page dwell timer
let currentPageEntryTime = 0;
let currentPath = '';
let currentTitle = '';
let currentReferrer = '';
let activePingInterval: ReturnType<typeof setInterval> | null = null;
let isTrackerInitialized = false;

function sendTelemetry(type: 'pageview' | 'dwell', dwellSeconds = 0) {
    if (typeof window === 'undefined') return;

    // 1. Visitor ID: Persistent 1-year cookie
    let visitorId = getCookie(COOKIE_VISITOR);
    if (!visitorId) {
        visitorId = getOrGenerateUUID();
    }
    // Refresh visitor cookie max-age to 1 year on activity
    setCookie(COOKIE_VISITOR, visitorId, VISITOR_TTL_SECONDS);

    // 2. Session ID: Rolling 30-minute cookie (survives tab close and reopen)
    let sessionId = getCookie(COOKIE_SESSION);
    if (!sessionId) {
        sessionId = getOrGenerateUUID();
        sessionStorage.setItem(STORAGE_KEY_STEP, '1');
    }
    // Refresh session cookie max-age to 30 minutes on every ping/activity
    setCookie(COOKIE_SESSION, sessionId, SESSION_TTL_SECONDS);

    const stepOrder = parseInt(sessionStorage.getItem(STORAGE_KEY_STEP) || '1', 10);
    const path = currentPath || window.location.pathname;
    const title = currentTitle || document.title || path;
    const referrer = currentReferrer || (document.referrer ? new URL(document.referrer, window.location.origin).hostname : 'Direct');

    const payload = {
        type,
        visitorId,
        sessionId,
        path,
        title,
        referrer,
        stepOrder,
        dwellTimeSeconds: Math.round(dwellSeconds)
    };

    // For page unload / tab close events, prefer navigator.sendBeacon
    const beaconUrl = '/api/telemetry/beacon';
    const jsonBody = JSON.stringify(payload);

    if (type === 'dwell' && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
            const blob = new Blob([jsonBody], { type: 'application/json' });
            navigator.sendBeacon(beaconUrl, blob);
            return;
        } catch {
            // Fallback to fetch with keepalive below
        }
    }

    fetch(beaconUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody,
        keepalive: true
    })
        .then((res) => res.json() as Promise<{ ok?: boolean; persona?: { name: string; badgeColor: string } }>)
        .then((data) => {
            if (data.ok && data.persona) {
                localStorage.setItem('mid_persona_name', data.persona.name);
                localStorage.setItem('mid_persona_color', data.persona.badgeColor);
                window.dispatchEvent(new CustomEvent('mid:persona-ready', { detail: data.persona }));
            }
        })
        .catch(() => {
            // Fail silently without impacting user experience
        });

    if (type === 'pageview') {
        sessionStorage.setItem(STORAGE_KEY_STEP, String(stepOrder + 1));
    }
}

function flushCurrentDwell() {
    if (currentPageEntryTime > 0) {
        const dwellSeconds = Math.min(Math.round((Date.now() - currentPageEntryTime) / 1000), 1800);
        if (dwellSeconds > 0) {
            sendTelemetry('dwell', dwellSeconds);
        }
    }
}

export function initAnalyticsTracker() {
    if (typeof window === 'undefined') return;

    // 1. If transitioning from a previous page, flush its accrued dwell time first
    flushCurrentDwell();

    // 2. Start clock fresh for the newly entered page
    currentPageEntryTime = Date.now();
    currentPath = window.location.pathname;
    currentTitle = document.title || currentPath;
    currentReferrer = document.referrer ? new URL(document.referrer, window.location.origin).hostname : 'Direct';

    // 3. Send initial pageview event (dwell = 0 at moment of entry)
    sendTelemetry('pageview', 0);

    // 4. Set up periodic heartbeats while user stays on page (every 15 seconds)
    if (activePingInterval) clearInterval(activePingInterval);
    activePingInterval = setInterval(() => {
        if (document.visibilityState === 'visible' && currentPageEntryTime > 0) {
            const currentAccrued = Math.min(Math.round((Date.now() - currentPageEntryTime) / 1000), 1800);
            if (currentAccrued > 0) {
                sendTelemetry('dwell', currentAccrued);
            }
        }
    }, 15000);

    // 5. Global lifecycle listeners (attached once)
    if (!isTrackerInitialized) {
        isTrackerInitialized = true;

        // When user switches tabs or hides browser
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                flushCurrentDwell();
            } else if (document.visibilityState === 'visible') {
                // Resume active dwell timer
                currentPageEntryTime = Date.now();
            }
        });

        // When user closes tab, navigates away, or closes browser
        window.addEventListener('pagehide', () => {
            flushCurrentDwell();
        });
        window.addEventListener('beforeunload', () => {
            flushCurrentDwell();
        });
    }
}
