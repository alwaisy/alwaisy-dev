export interface MiddlePersona {
    name: string;          // e.g. "Sue Heck the 37-Time Failed Track Tryout"
    alias: string;         // e.g. "Sue"
    role: string;          // e.g. "Eternal Optimist"
    quote: string;         // e.g. "Whoop! I will make the team!"
    badgeColor: string;    // emerald, indigo, amber, rose, zinc, pink, purple, teal, sky
    avatarEmoji: string;   // 🪥, 📚, 🎸, 🍗, 🪨, ✨, 🧙‍♀️, 📦
    loyaltyTier: string;   // "Orson Newcomer", "Casual Passerby", "Town Regular", "Orson Hall of Famer"
}

interface MiddleCharacter {
    alias: string;
    role: string;
    emoji: string;
    color: string;
    quotes: string[];
}

const CHARACTERS: MiddleCharacter[] = [
    {
        alias: 'Sue Heck',
        role: 'Eternal Optimist & Tryout Legend',
        emoji: '🪥',
        color: 'emerald',
        quotes: [
            '"Whoop! I know in my heart I\'m gonna make it this time!"',
            '"1-2-3-4, Wrestlerettes are at the door!"',
            '"Spreading sunshine throughout Orson, one smile at a time."',
            '"I didn\'t make track, but I was named alternate towel monitor!"'
        ]
    },
    {
        alias: 'Brick Heck',
        role: 'Book Whisperer & Micro-Font Critic',
        emoji: '📚',
        color: 'indigo',
        quotes: [
            '"*(whispers to scrollbar)* ...scrollbar..."',
            '"I\'m not ignoring you, I\'m reading the warranty on this toaster."',
            '"Did you know fonts have emotional weights? Baskerville is very aloof."',
            '"I cannot cross this page link without tapping my shoe three times."'
        ]
    },
    {
        alias: 'Axl Heck',
        role: 'Founder of BossCo & Boxer Shorts Philosopher',
        emoji: '🎸',
        color: 'amber',
        quotes: [
            '"Ax-man only reads the headlines. Everything else is filler."',
            '"BossCo will conquer the Midwest before lunch."',
            '"Why do dishes when you can just eat chips out of the bag directly?"',
            '"I\'m not asleep, I\'m incubating genius."'
        ]
    },
    {
        alias: 'Frankie Heck',
        role: 'Drive-Thru Connoisseur & Quilt Storer',
        emoji: '🍗',
        color: 'rose',
        quotes: [
            '"There\'s chocolate frosting in the pantry. Dinner is officially served."',
            '"I store winter quilts in the oven. It\'s called space management."',
            '"You\'re doing fine. Nobody died, and we almost recycled today."',
            '"I\'m five minutes away from moving into an RV in the quarry."'
        ]
    },
    {
        alias: 'Mike Heck',
        role: 'Quarry Philosopher & Stoic Anchor',
        emoji: '🪨',
        color: 'zinc',
        quotes: [
            '"I go to work. I come home. That\'s the speech."',
            '"Why talk when sitting in complete silence achieves the exact same thing?"',
            '"It\'s a good blog. Now turn off the hallway light."',
            '"Emotions are fine, as long as they stay in your own room."'
        ]
    },
    {
        alias: 'Brad Bottig',
        role: 'Orson Jazz-Hands Co-Captain',
        emoji: '✨',
        color: 'pink',
        quotes: [
            '"And step-ball-change, turn, SMILE! The energy is electric!"',
            '"Every single web page is an audition for Broadway, darling!"',
            '"Have you seen my sweater vest? It matches my enthusiasm!"'
        ]
    },
    {
        alias: 'Weird Ashley',
        role: 'Dark Arts Prom Enchantress',
        emoji: '🧙‍♀️',
        color: 'purple',
        quotes: [
            '"I saw your visitor cookie in my crystal cauldron."',
            '"The stars aligned for me to read this exact paragraph."',
            '"Silence is louder than your analytics script."'
        ]
    },
    {
        alias: 'Big Mike',
        role: 'Free-Range Hoarder & Appliance Whisperer',
        emoji: '📦',
        color: 'teal',
        quotes: [
            '"Found this router in a dumpster by Sears. Works fine if you hit it."',
            '"Why throw away an egg carton? That\'s 12 potential screw organizers."',
            '"I don\'t need internet, but I\'ll take the spare Ethernet cable."'
        ]
    },
    {
        alias: 'Uncle Rusty',
        role: 'Unlicensed Entrepreneur & Van Dweller',
        emoji: '🚐',
        color: 'yellow',
        quotes: [
            '"Listen, I got three pallets of slightly dented energy drinks in the van."',
            '"Never sign a contract with a pen that has someone else\'s bank name on it."',
            '"I\'m not evading taxes, I\'m on a temporary geographic sabbatical."'
        ]
    },
    {
        alias: 'Mr. Ehlert',
        role: 'Used Car Mogul & Billboard Overlord',
        emoji: '🚗',
        color: 'red',
        quotes: [
            '"If you can\'t sell a 2004 Taurus in this economy, don\'t talk to me!"',
            '"Time is money, Heck! Stop staring into space and move metal!"',
            '"Our prices are insane, and frankly, so am I."'
        ]
    },
    {
        alias: 'Nancy Donahue',
        role: 'Bake Sale Enforcer & Neighborhood Czar',
        emoji: '🥧',
        color: 'sky',
        quotes: [
            '"Just dropped off some sugar cookies! No pressure to finish them all today!"',
            '"We Donahues color-code our recycling bins. It builds character."',
            '"Bless your heart, that\'s certainly an ambitious blog strategy!"'
        ]
    }
];

const SHENANIGANS = [
    '37-Time Failed Track Tryout',
    'Founder of BossCo Lawn Mowing',
    'Whispers To The Screen',
    'Oven Storage Quilt Enthusiast',
    'Drive-Thru Bag Sleuth',
    'Lost Retainer Search Party Leader',
    'Blue Bag Jellybean Hoarder',
    'Yellow Line Bridge Avoider',
    'Font Fontastic Club President',
    'Cereal Box Micro-Reader',
    'Dumpster Appliance Rescuer',
    'Unironic Fannypack Defender',
    'Cross-Country Bus Snoozer',
    'Passive-Aggressive Casserole Baker',
    'Wrestlerette Team Choreographer',
    'Midnight Frosting Spooner',
    'Quarry Heavy Equipment Admirer',
    'Parking Lot Shopping Cart Collector'
];

/**
 * Computes a deterministic 32-bit integer hash from any string (like a visitor UUID)
 */
export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

/**
 * Resolves a loyalty tier label based on total visits recorded
 */
export function getLoyaltyTier(visitCount: number): string {
    if (visitCount <= 1) return 'Orson Newcomer';
    if (visitCount <= 4) return 'Curious Passerby';
    if (visitCount <= 10) return 'Town Regular';
    return 'Orson Hall of Famer';
}

/**
 * Generates a persistent, hilarious The Middle persona deterministically from any visitor ID
 */
export function generateMiddlePersona(visitorId: string, visitCount: number = 1): MiddlePersona {
    const hash = hashString(visitorId);

    const char = CHARACTERS[hash % CHARACTERS.length];
    const shenanigan = SHENANIGANS[(hash >> 3) % SHENANIGANS.length];
    const quote = char.quotes[(hash >> 5) % char.quotes.length];

    return {
        name: `${char.alias} the ${shenanigan}`,
        alias: char.alias,
        role: char.role,
        quote,
        badgeColor: char.color,
        avatarEmoji: char.emoji,
        loyaltyTier: getLoyaltyTier(visitCount)
    };
}
