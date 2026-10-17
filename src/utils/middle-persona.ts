export interface MiddlePersona {
    name: string;          // Pure character name, e.g. "Sue Heck", "Brick Heck", "Axl Heck"
    alias: string;         // e.g. "Sue"
    badgeColor: string;    // emerald, indigo, amber, rose, zinc, pink, purple, teal, sky
    avatarEmoji: string;   // 🪥, 📚, 🎸, 🍗, etc.
}

interface CharacterDefinition {
    name: string;
    alias: string;
    emoji: string;
    color: string;
}

// Clean, iconic characters from The Middle sitcom
const CHARACTERS: CharacterDefinition[] = [
    { name: 'Sue Heck', alias: 'Sue', emoji: '🪥', color: 'emerald' },
    { name: 'Brick Heck', alias: 'Brick', emoji: '📚', color: 'indigo' },
    { name: 'Axl Heck', alias: 'Axl', emoji: '🎸', color: 'amber' },
    { name: 'Frankie Heck', alias: 'Frankie', emoji: '🍗', color: 'rose' },
    { name: 'Mike Heck', alias: 'Mike', emoji: '🪨', color: 'zinc' },
    { name: 'Brad Bottig', alias: 'Brad', emoji: '✨', color: 'pink' },
    { name: 'Weird Ashley', alias: 'Ashley', emoji: '🧙‍♀️', color: 'purple' },
    { name: 'Big Mike', alias: 'Big Mike', emoji: '📦', color: 'teal' },
    { name: 'Uncle Rusty', alias: 'Rusty', emoji: '🚐', color: 'yellow' },
    { name: 'Mr. Ehlert', alias: 'Ehlert', emoji: '🚗', color: 'red' },
    { name: 'Nancy Donahue', alias: 'Nancy', emoji: '🥧', color: 'sky' },
    { name: 'Bob Weaver', alias: 'Bob', emoji: '👔', color: 'blue' }
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
        badgeColor: char.color,
        avatarEmoji: char.emoji
    };
}
