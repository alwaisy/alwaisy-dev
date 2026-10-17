export interface MiddlePersona {
    name: string;          // 2 to 3 words, e.g. "Library Brick", "Quarry Mike", "Spudsy Sue"
    alias: string;         // e.g. "Brick", "Mike", "Sue"
    badgeColor: string;    // emerald, indigo, amber, rose, zinc, pink, purple, teal, sky, cyan
    prefix?: string;       // e.g. "Library", "Quarry", "Spudsy"
}

export interface VisitorContext {
    path?: string;
    referrer?: string;
    device?: string;
    browser?: string;
    dwellTimeSeconds?: number;
    stepOrder?: number;
    totalPageViews?: number;
}

// 1. Roles, Places & Quirks (Prefixes)
interface PrefixDef {
    word: string;
    color: string;
    hint: string;
}

const PREFIXES: PrefixDef[] = [
    { word: 'Library', color: 'indigo', hint: 'Analytical, deep reading, books and docs' },
    { word: 'Quarry', color: 'zinc', hint: 'Bedrock, direct, pragmatic, infrastructure' },
    { word: 'Spudsy', color: 'emerald', hint: 'Frontline hustle, energetic, enthusiastic' },
    { word: 'Boss Co', color: 'amber', hint: 'Casual slacker swagger, fast mover, entrepreneur' },
    { word: 'Motors', color: 'rose', hint: 'Busy multitasker, jumping across pages' },
    { word: 'Tap Dance', color: 'pink', hint: 'Creative, upbeat, visual arts and demos' },
    { word: 'Clinic', color: 'cyan', hint: 'Methodical checkups, changelog and details' },
    { word: 'Frugal', color: 'teal', hint: 'Finding hidden gems, efficient, smart' },
    { word: 'Hoosier', color: 'sky', hint: 'Down to earth, friendly local' },
    { word: 'Wrestlerette', color: 'fuchsia', hint: 'Determined, relentless grit' },
    { word: 'Notre Dame', color: 'blue', hint: 'Academic, high standards' },
    { word: 'Pawn Shop', color: 'stone', hint: 'Curious explorer, unique angle' }
];

// 2. Characters from The Middle Sitcom Universe
interface CharacterDef {
    name: string;
    alias: string;
    color: string;
    hint: string;
}

const CHARACTERS: CharacterDef[] = [
    // Core Family
    { name: 'Brick', alias: 'Brick', color: 'indigo', hint: 'Analytical reader, microfiche, tech details' },
    { name: 'Mike', alias: 'Mike', color: 'zinc', hint: 'Stoic, practical, direct bio and backend' },
    { name: 'Axl', alias: 'Axl', color: 'amber', hint: 'Fast scroller, slacker, skimming quickly' },
    { name: 'Sue', alias: 'Sue', color: 'emerald', hint: 'High enthusiasm, trying every link and demo' },
    { name: 'Frankie', alias: 'Frankie', color: 'rose', hint: 'Multitasking, busy, jumping between tabs' },

    // Extended Family & Town Lore
    { name: 'Rusty', alias: 'Rusty', color: 'stone', hint: 'Unconventional thinker, odd hours' },
    { name: 'Sean', alias: 'Sean', color: 'blue', hint: 'Polite, scholarly, direct entry' },
    { name: 'Brad', alias: 'Brad', color: 'pink', hint: 'Lively, sparkling, interactive demos' },
    { name: 'Nancy', alias: 'Nancy', color: 'sky', hint: 'Neighborly, warm, returning visitor' },
    { name: 'Darrin', alias: 'Darrin', color: 'teal', hint: 'Loyal, simple, direct' },
    { name: 'Lexie', alias: 'Lexie', color: 'cyan', hint: 'Sophisticated, modern setup' },
    { name: 'Goodwin', alias: 'Goodwin', color: 'cyan', hint: 'Methodical inspection of changelog' },
    { name: 'Ehlert', alias: 'Ehlert', color: 'rose', hint: 'Veteran boss, bottom line focused' },
    { name: 'Tim-Tom', alias: 'Tim-Tom', color: 'amber', hint: 'Harmonious, inspiring message' }
];

export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

/**
 * Deterministic fallback combo generator: Generates authentic 2-to-3 word names
 * from The Middle universe without numbers or hash tags.
 * e.g. "Library Brick", "Quarry Mike", "Spudsy Sue", "Boss Co Axl"
 */
export function generateFallbackPersona(visitorId: string): MiddlePersona {
    const hash = hashString(visitorId);
    const prefix = PREFIXES[hash % PREFIXES.length];
    const char = CHARACTERS[Math.floor(hash / PREFIXES.length) % CHARACTERS.length];

    return {
        name: `${prefix.word} ${char.name}`,
        alias: char.alias,
        badgeColor: prefix.color,
        prefix: prefix.word
    };
}

/**
 * Intelligent decision-powered combo generator using typesafe/jev-1.14 on OpenRouter.
 * Evaluates the visitor browsing state (path, dwell time, device, referrer)
 * and returns calibrated choices for a tight 2-to-3 word sitcom combo.
 */
export async function resolveIntelligentPersona(
    visitorId: string,
    context: VisitorContext,
    apiKey?: string
): Promise<MiddlePersona> {
    const fallback = generateFallbackPersona(visitorId);
    if (!apiKey) {
        return fallback;
    }

    try {
        const stateDesc = [
            `Visitor ID: ${visitorId.slice(0, 8)}`,
            `Landing route: ${context.path || '/'}`,
            `Device: ${context.device || 'Desktop'} using ${context.browser || 'Browser'}`,
            `Referrer: ${context.referrer || 'Direct'}`,
            `Dwell time: ${context.dwellTimeSeconds || 0}s`,
            `Steps visited: ${context.stepOrder || 1}`
        ].join('. ');

        const prefixCriteria: Record<string, string> = {};
        for (const p of PREFIXES) {
            prefixCriteria[p.word] = p.hint;
        }

        const charCriteria: Record<string, string> = {};
        for (const c of CHARACTERS) {
            charCriteria[c.name] = c.hint;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200); // Strict 1.2s timeout for edge speed

        const response = await fetch('https://openrouter.ai/api/alpha/decisions', {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://alwaisy.dev',
                'X-Title': 'alwaisy.dev'
            },
            body: JSON.stringify({
                model: 'typesafe/jev-1.14',
                state: [stateDesc],
                questions: {
                    prefix: {
                        type: 'choice',
                        instructions: 'Pick the single best 1-to-2 word role, place, or quirk from The Middle universe.',
                        criteria: prefixCriteria
                    },
                    character: {
                        type: 'choice',
                        instructions: 'Pick the character from The Middle that best matches the visitor style.',
                        criteria: charCriteria
                    }
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return fallback;
        }

        const result = await response.json() as {
            answers?: {
                prefix?: { choice?: string };
                character?: { choice?: string };
            };
        };

        const chosenPrefixWord = result.answers?.prefix?.choice;
        const chosenCharName = result.answers?.character?.choice;

        const prefixDef = PREFIXES.find(p => p.word === chosenPrefixWord) || PREFIXES[0];
        const charDef = CHARACTERS.find(c => c.name === chosenCharName) || CHARACTERS[0];

        const fullName = `${prefixDef.word} ${charDef.name}`;
        // Ensure strictly 2 to 3 words
        const words = fullName.trim().split(/\s+/);
        const tightName = words.slice(0, 3).join(' ');

        return {
            name: tightName,
            alias: charDef.alias,
            badgeColor: prefixDef.color,
            prefix: prefixDef.word
        };
    } catch {
        return fallback;
    }
}
