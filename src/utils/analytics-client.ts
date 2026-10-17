/**
 * Client-Side Autonomous Analytics Tracker with Middle Personas & Journey Tracking
 */

const STORAGE_KEY_VISITOR = 'mid_v_id';
const STORAGE_KEY_SESSION = 'mid_s_id';
const STORAGE_KEY_STEP = 'mid_step_order';
const STORAGE_KEY_LAST_PAGELOAD = 'mid_last_load';

function getOrGenerateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function initAnalyticsTracker() {
    if (typeof window === 'undefined') return;

    // 1. Identify or persist visitor UUID (stored in localStorage)
    let visitorId = localStorage.getItem(STORAGE_KEY_VISITOR);
    if (!visitorId) {
        visitorId = getOrGenerateUUID();
        localStorage.setItem(STORAGE_KEY_VISITOR, visitorId);
    }

    // 2. Identify or refresh session (stored in sessionStorage)
    let sessionId = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (!sessionId) {
        sessionId = getOrGenerateUUID();
        sessionStorage.setItem(STORAGE_KEY_SESSION, sessionId);
        sessionStorage.setItem(STORAGE_KEY_STEP, '1');
    }

    const stepOrder = parseInt(sessionStorage.getItem(STORAGE_KEY_STEP) || '1', 10);

    // Calculate dwell time on previous page before transition
    const now = Date.now();
    const lastLoadTime = parseInt(sessionStorage.getItem(STORAGE_KEY_LAST_PAGELOAD) || '0', 10);
    const dwellSeconds = lastLoadTime > 0 ? Math.min(Math.round((now - lastLoadTime) / 1000), 1800) : 0;
    sessionStorage.setItem(STORAGE_KEY_LAST_PAGELOAD, String(now));

    // Get current path and referrer
    const currentPath = window.location.pathname;
    const referrer = document.referrer ? new URL(document.referrer, window.location.origin).hostname : 'Direct';
    const pageTitle = document.title || currentPath;

    // Send tracking beacon/fetch
    const payload = {
        visitorId,
        sessionId,
        path: currentPath,
        title: pageTitle,
        referrer,
        stepOrder,
        dwellTimeSeconds: dwellSeconds
    };

    fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
    })
        .then((res) => res.json() as Promise<{ ok?: boolean; persona?: { name: string; avatarEmoji: string; quote: string; role: string } }>)
        .then((data) => {
            if (data.ok && data.persona) {
                // Save resolved persona to localStorage for immediate UI greeting
                localStorage.setItem('mid_persona_name', data.persona.name);
                localStorage.setItem('mid_persona_emoji', data.persona.avatarEmoji);
                localStorage.setItem('mid_persona_role', data.persona.role);
                localStorage.setItem('mid_persona_quote', data.persona.quote);

                window.dispatchEvent(new CustomEvent('mid:persona-ready', { detail: data.persona }));
            }
        })
        .catch(() => {
            // Silently fail without impacting user experience
        });

    // Increment step order for next internal click
    sessionStorage.setItem(STORAGE_KEY_STEP, String(stepOrder + 1));
}
