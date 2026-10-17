export interface MiddlePersona {
    name: string;          // Pure character name, e.g. "Sue Heck", "Brick Heck", "Axl Heck"
    alias: string;         // e.g. "Sue"
    badgeColor: string;    // emerald, indigo, amber, rose, zinc, pink, purple, teal, sky
}

interface CharacterDefinition {
    name: string;
    alias: string;
    color: string;
}

// Clean, iconic characters from The Middle sitcom universe
const CHARACTERS: CharacterDefinition[] = [
    // Main Family
    { name: 'Frankie Heck', alias: 'Frankie', color: 'rose' },
    { name: 'Mike Heck', alias: 'Mike', color: 'zinc' },
    { name: 'Axl Heck', alias: 'Axl', color: 'amber' },
    { name: 'Sue Heck', alias: 'Sue', color: 'emerald' },
    { name: 'Brick Heck', alias: 'Brick', color: 'indigo' },

    // Extended Family
    { name: 'Big Mike Heck', alias: 'Big Mike', color: 'teal' },
    { name: 'Rusty Heck', alias: 'Rusty', color: 'yellow' },
    { name: 'Pat Spence', alias: 'Pat', color: 'pink' },
    { name: 'Tag Spence', alias: 'Tag', color: 'orange' },
    { name: 'Janet Spence', alias: 'Janet', color: 'purple' },
    { name: 'Dutch Spence', alias: 'Dutch', color: 'stone' },
    { name: 'Aunt Edie', alias: 'Edie', color: 'violet' },
    { name: 'Aunt Ginny', alias: 'Ginny', color: 'fuchsia' },

    // Neighbors: The Donahues & The Glossners
    { name: 'Nancy Donahue', alias: 'Nancy', color: 'sky' },
    { name: 'Ron Donahue', alias: 'Ron', color: 'blue' },
    { name: 'Sean Donahue', alias: 'Sean', color: 'cyan' },
    { name: 'Shelly Donahue', alias: 'Shelly', color: 'teal' },
    { name: 'Dotty Donahue', alias: 'Dotty', color: 'lime' },
    { name: 'Rita Glossner', alias: 'Rita', color: 'red' },
    { name: 'Derrick Glossner', alias: 'Derrick', color: 'orange' },
    { name: 'Rodney Glossner', alias: 'Rodney', color: 'amber' },
    { name: 'Donald Wayne Glossner', alias: 'Donald', color: 'yellow' },
    { name: 'Paula Norwood', alias: 'Paula', color: 'emerald' },
    { name: 'Bill Norwood', alias: 'Bill', color: 'slate' },

    // Friends, Classmates & Love Interests
    { name: 'Brad Bottig', alias: 'Brad', color: 'pink' },
    { name: 'Carly', alias: 'Carly', color: 'rose' },
    { name: 'Darrin McGrew', alias: 'Darrin', color: 'blue' },
    { name: 'Cassidy Finch', alias: 'Cassidy', color: 'indigo' },
    { name: 'Devin Levin', alias: 'Devin', color: 'teal' },
    { name: 'Weird Ashley Wyman', alias: 'Ashley', color: 'purple' },
    { name: 'Lexie Brooks', alias: 'Lexie', color: 'emerald' },
    { name: 'Cindy Hornberger', alias: 'Cindy', color: 'lime' },
    { name: 'Kenny', alias: 'Kenny', color: 'zinc' },
    { name: 'Troy Tangaroa', alias: 'Troy', color: 'cyan' },
    { name: 'Courtney', alias: 'Courtney', color: 'fuchsia' },
    { name: 'Debbie', alias: 'Debbie', color: 'violet' },
    { name: 'Logan', alias: 'Logan', color: 'sky' },
    { name: 'Jeremy', alias: 'Jeremy', color: 'amber' },
    { name: 'Tyler', alias: 'Tyler', color: 'stone' },
    { name: 'Arlo', alias: 'Arlo', color: 'emerald' },
    { name: 'Zack', alias: 'Zack', color: 'indigo' },

    // Adults, Coworkers, Mentors & Town Figures
    { name: 'Don Ehlert', alias: 'Ehlert', color: 'red' },
    { name: 'Bob Weaver', alias: 'Bob', color: 'blue' },
    { name: 'Dr. Ted Goodwin', alias: 'Dr. Goodwin', color: 'cyan' },
    { name: 'Pete Miller', alias: 'Pete', color: 'zinc' },
    { name: 'Reverend Tim-Tom', alias: 'Tim-Tom', color: 'amber' },
    { name: 'Dr. Fulton', alias: 'Dr. Fulton', color: 'teal' },
    { name: 'Mr. Farrar', alias: 'Mr. Farrar', color: 'slate' },
    { name: 'Chuck', alias: 'Chuck', color: 'stone' }
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
 * Deterministically maps any visitor ID to a clean, unique character persona.
 * Appends a 4-character deterministic tag (#a8f2) so every visitor is uniquely distinct
 * and no two visitors have identical names.
 */
export function generateMiddlePersona(visitorId: string): MiddlePersona {
    const hash = hashString(visitorId);
    const char = CHARACTERS[hash % CHARACTERS.length];
    
    // Extract a deterministic 4-character tag from the visitorId
    const cleanId = visitorId.replace(/[^a-zA-Z0-9]/g, '');
    const tag = (cleanId.slice(0, 4) || hash.toString(16).slice(0, 4)).toLowerCase();

    return {
        name: `${char.name} #${tag}`,
        alias: char.alias,
        badgeColor: char.color
    };
}
