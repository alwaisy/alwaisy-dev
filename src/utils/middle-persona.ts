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

export const PREFIXES: PrefixDef[] = [
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
    { word: 'Pawn Shop', color: 'stone', hint: 'Curious explorer, unique angle' },
    { word: 'Orson High', color: 'purple', hint: 'School spirit, everyday learner' },
    { word: 'Maple Drive', color: 'amber', hint: 'Neighborhood grit, streetwise' },
    { word: 'Camp Hi-Ho', color: 'emerald', hint: 'Upbeat campfire optimism' },
    { word: 'Town Council', color: 'slate', hint: 'Civic minded, governance' }
];

// 2. Characters from The Middle Sitcom Universe
interface CharacterDef {
    name: string;
    alias: string;
    color: string;
    hint: string;
}

export const CHARACTERS: CharacterDef[] = [
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
    { name: 'Tim-Tom', alias: 'Tim-Tom', color: 'amber', hint: 'Harmonious, inspiring message' },
    { name: 'Cassidy', alias: 'Cassidy', color: 'purple', hint: 'Poetic, artistic, intellectual' },
    { name: 'Hutch', alias: 'Hutch', color: 'amber', hint: 'College roommate, chill vibe' },
    { name: 'Kenny', alias: 'Kenny', color: 'slate', hint: 'Gamer, silent late night scroller' },
    { name: 'Cindy', alias: 'Cindy', color: 'emerald', hint: 'Quirky, dry humor, minimal words' },
    { name: 'Devin', alias: 'Devin', color: 'teal', hint: 'Competitive, sporty, direct' },
    { name: 'Rita', alias: 'Rita', color: 'red', hint: 'Rebel, unexpected chaotic path' }
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
 * Generates all valid candidate combos (PREFIX + CHARACTER).
 * Total pool: 16 prefixes * 20 characters = 320 unique combinations!
 */
export function getAllAvailableCombos(claimedNames: Set<string>): MiddlePersona[] {
    const list: MiddlePersona[] = [];
    for (const p of PREFIXES) {
        for (const c of CHARACTERS) {
            const fullName = `${p.word} ${c.name}`;
            if (!claimedNames.has(fullName)) {
                list.push({
                    name: fullName,
                    alias: c.alias,
                    badgeColor: p.color,
                    prefix: p.word
                });
            }
        }
    }
    return list;
}

/**
 * Random fallback string generator if Jev or the candidate pool is exhausted.
 * Generates an unmistakable, completely unique fallback like "Orson-Wanderer-8a3f".
 */
export function generateRandomFallbackPersona(visitorId: string, claimedNames: Set<string>): MiddlePersona {
    let candidate = '';
    let counter = 0;
    do {
        const randHex = Math.random().toString(36).substring(2, 6);
        candidate = `Orson Scout ${randHex.toUpperCase()}`;
        counter++;
        if (counter > 20) break;
    } while (claimedNames.has(candidate));

    return {
        name: candidate,
        alias: 'Scout',
        badgeColor: 'indigo',
        prefix: 'Orson'
    };
}

/**
 * Query Jev-1.14 decisions model with candidate options that are GUARANTEED NOT YET CLAIMED.
 */
async function queryJevForBestCombo(
    visitorId: string,
    context: VisitorContext,
    candidates: MiddlePersona[],
    apiKey: string
): Promise<MiddlePersona | null> {
    try {
        // Feed up to 8 of the best available candidates matching visitor criteria
        const sampleCandidates = candidates.slice(0, 8);
        const criteria: Record<string, string> = {};
        for (const cand of sampleCandidates) {
            const pDef = PREFIXES.find(p => p.word === cand.prefix);
            const cDef = CHARACTERS.find(c => c.alias === cand.alias);
            criteria[cand.name] = `${pDef?.hint || 'Vibe'}, ${cDef?.hint || 'Character'}`;
        }

        const stateDesc = [
            `Visitor route: ${context.path || '/'}`,
            `Device: ${context.device || 'Desktop'} using ${context.browser || 'Browser'}`,
            `Referrer: ${context.referrer || 'Direct'}`,
            `Dwell time: ${context.dwellTimeSeconds || 0}s`,
            `Step order: ${context.stepOrder || 1}`
        ].join('. ');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

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
                    best_combo: {
                        type: 'choice',
                        instructions: 'Pick the single best persona name from the available options for this visitor.',
                        criteria
                    }
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const result = await response.json() as {
            answers?: {
                best_combo?: { choice?: string };
            };
        };

        const chosenName = result.answers?.best_combo?.choice;
        if (!chosenName) return null;

        return sampleCandidates.find(c => c.name === chosenName) || null;
    } catch {
        return null;
    }
}

/**
 * Intelligent decision-powered generator with WHILE LOOP and DATABASE duplicate verification:
 * 1. Checks available candidates not in database claimed set
 * 2. Runs while loop (up to 3 attempts) consulting Jev
 * 3. Verifies zero match with claimed database names
 * 4. Breaks on success; if Jev fails, falls back to a clean unique string combo before breaking
 */
export async function resolveUniqueIntelligentPersona(
    visitorId: string,
    context: VisitorContext,
    claimedNames: Set<string>,
    apiKey?: string
): Promise<MiddlePersona> {
    // 1. Get all unclaimed combos from the 320-item lore pool
    let available = getAllAvailableCombos(claimedNames);

    if (available.length === 0) {
        return generateRandomFallbackPersona(visitorId, claimedNames);
    }

    // Shuffle available pool pseudo-deterministically by visitorId so different visitors see diverse subsets
    const vHash = hashString(visitorId);
    available.sort((a, b) => {
        const hA = hashString(a.name + visitorId);
        const hB = hashString(b.name + visitorId);
        return hA - hB;
    });

    let attempt = 0;
    const maxAttempts = 3;
    let selectedPersona: MiddlePersona | null = null;

    while (attempt < maxAttempts) {
        attempt++;

        if (apiKey && available.length > 0) {
            const jevChoice = await queryJevForBestCombo(visitorId, context, available, apiKey);
            if (jevChoice && !claimedNames.has(jevChoice.name)) {
                selectedPersona = jevChoice;
                break; // Found guaranteed unique choice from Jev!
            }
        }

        // If Jev was unavailable or picked an already taken name, try the top candidate from the shuffled available pool
        const topCandidate = available[0];
        if (topCandidate && !claimedNames.has(topCandidate.name)) {
            selectedPersona = topCandidate;
            break;
        }

        // If duplicate was found, filter it out and continue loop
        if (topCandidate) {
            claimedNames.add(topCandidate.name);
            available = available.filter(a => a.name !== topCandidate.name);
        }
    }

    // If loop finishes without an agreed unique name, generate a clean unique string before breaking
    if (!selectedPersona || claimedNames.has(selectedPersona.name)) {
        selectedPersona = generateRandomFallbackPersona(visitorId, claimedNames);
    }

    return selectedPersona;
}
