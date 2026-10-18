-- Migration: Create Analytics & Visitor Journey Tables

CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,                       -- Deterministic or random visitor hash / UUID
    persona_name TEXT NOT NULL,                -- e.g. "Sue the 37-Time Failed Track Tryout"
    persona_alias TEXT NOT NULL,               -- e.g. "Sue"
    persona_role TEXT NOT NULL,                -- e.g. "Eternal Optimist"
    persona_quote TEXT NOT NULL,               -- e.g. "Whoop! I will make the team!"
    persona_badge_color TEXT NOT NULL,         -- e.g. "emerald"
    persona_emoji TEXT NOT NULL,               -- e.g. "🪥"
    first_seen INTEGER NOT NULL,               -- Timestamp ms
    last_seen INTEGER NOT NULL,                -- Timestamp ms
    visit_count INTEGER NOT NULL DEFAULT 1,    -- Total sessions
    total_page_views INTEGER NOT NULL DEFAULT 1,
    last_country TEXT,                         -- Cloudflare CF.country
    last_device TEXT,                          -- mobile, desktop, tablet
    last_browser TEXT                          -- chrome, safari, firefox, etc.
);

CREATE TABLE IF NOT EXISTS journeys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,                  -- Foreign key to visitors(id)
    session_id TEXT NOT NULL,                  -- Grouping pages within a single sitting
    path TEXT NOT NULL,                        -- e.g. "/blog/paddle-to-polar"
    title TEXT,                                -- Page title
    referrer TEXT,                             -- HTTP referrer or domain
    step_order INTEGER NOT NULL DEFAULT 1,     -- 1, 2, 3 in the session chain
    dwell_time_seconds INTEGER DEFAULT 0,      -- Seconds spent before navigating
    created_at INTEGER NOT NULL,               -- Timestamp ms
    country TEXT,
    city TEXT,
    device TEXT,
    browser TEXT
);

CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors(last_seen DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_visitors_persona_name ON visitors(persona_name);
CREATE INDEX IF NOT EXISTS idx_journeys_visitor_id ON journeys(visitor_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_journeys_path ON journeys(path);
CREATE INDEX IF NOT EXISTS idx_journeys_created_at ON journeys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journeys_session_id ON journeys(session_id);
