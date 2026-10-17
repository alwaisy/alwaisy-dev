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

// Clean, iconic characters from The Middle sitcom
const CHARACTERS: CharacterDefinition[] = [
    { name: 'Sue Heck', alias: 'Sue', color: 'emerald' },
    { name: 'Brick Heck', alias: 'Brick', color: 'indigo' },
    { name: 'Axl Heck', alias: 'Axl', color: 'amber' },
    { name: 'Frankie Heck', alias: 'Frankie', color: 'rose' },
    { name: 'Mike Heck', alias: 'Mike', color: 'zinc' },
    { name: 'Brad Bottig', alias: 'Brad', color: 'pink' },
    { name: 'Weird Ashley', alias: 'Ashley', color: 'purple' },
    { name: 'Big Mike', alias: 'Big Mike', color: 'teal' },
    { name: 'Uncle Rusty', alias: 'Rusty', color: 'yellow' },
    { name: 'Mr. Ehlert', alias: 'Ehlert', color: 'red' },
    { name: 'Nancy Donahue', alias: 'Nancy', color: 'sky' },
    { name: 'Bob Weaver', alias: 'Bob', color: 'blue' }
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
 * Deterministically maps any visitor ID to a clean, simple character from The Middle
 */
export function generateMiddlePersona(visitorId: string): MiddlePersona {
    const hash = hashString(visitorId);
    const char = CHARACTERS[hash % CHARACTERS.length];

    return {
        name: char.name,
        alias: char.alias,
        badgeColor: char.color
    };
}
