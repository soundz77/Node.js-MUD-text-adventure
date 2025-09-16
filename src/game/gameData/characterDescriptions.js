// gameData/characterDescriptions.js
export const characterDescriptions = [
  {
    slug: "wanderer",
    name: "Tired Wanderer",
    class: "civilian",
    level: 1,
    stats: { health: 18, stamina: 10, strength: 3, defence: 2, attack: 2 },
    homeSlug: "forest_edge",
    roam: true, // may stroll between adjacent rooms
    dialogue: [
      "The woods are deeper than they look.",
      "Got any food to spare?"
    ],
    drops: [], // no loot
    temperament: "neutral"
  },
  {
    slug: "wolf_pack",
    name: "Wolf Pack",
    class: "beast",
    level: 2,
    stats: { health: 28, stamina: 16, strength: 6, defence: 3, attack: 5 },
    homeSlug: "deep_forest",
    roam: false,
    dialogue: [],
    drops: ["wolf_pelt"], // optional, define later if you like
    temperament: "hostile"
  },
  {
    slug: "cave_bat",
    name: "Cave Bat",
    class: "beast",
    level: 1,
    stats: { health: 8, stamina: 12, strength: 2, defence: 1, attack: 2 },
    homeSlug: "cave_depths",
    roam: true, // flits between cave rooms
    dialogue: [],
    drops: [],
    temperament: "hostile"
  },
  {
    slug: "merchant",
    name: "Traveling Merchant",
    class: "merchant",
    level: 3,
    stats: { health: 20, stamina: 12, strength: 3, defence: 3, attack: 2 },
    homeSlug: "village_square",
    roam: false,
    dialogue: ["Best prices this side of the river!", "See anything you like?"],
    shopInventory: ["bread", "waterskin", "torch"], // optional link to item bps
    temperament: "friendly",
    safeZoneRespect: true // never engages in combat even if attacked
  },
  {
    slug: "villager",
    name: "Chatty Villager",
    class: "civilian",
    level: 1,
    stats: { health: 14, stamina: 10, strength: 2, defence: 1, attack: 1 },
    homeSlug: "village_square",
    roam: true,
    dialogue: [
      "They say the old tower is haunted.",
      "Did you check the notice board?"
    ],
    drops: [],
    temperament: "friendly"
  },
  {
    slug: "innkeeper",
    name: "Innkeeper Bran",
    class: "innkeeper",
    level: 2,
    stats: { health: 22, stamina: 12, strength: 3, defence: 3, attack: 2 },
    homeSlug: "inn",
    roam: false,
    dialogue: [
      "Rooms are upstairs. Mind the steps.",
      "Help yourself to stew if you’ve coin."
    ],
    services: ["rest", "food"],
    temperament: "friendly",
    safeZoneRespect: true
  },
  {
    slug: "bridge_guard",
    name: "Bridge Guard",
    class: "guard",
    level: 3,
    stats: { health: 30, stamina: 16, strength: 6, defence: 5, attack: 5 },
    homeSlug: "stone_bridge",
    roam: false,
    dialogue: ["Keep to the path.", "Trouble from the tower lately…"],
    drops: ["guard_token"],
    temperament: "neutral"
  },
  {
    slug: "specter",
    name: "Tower Specter",
    class: "undead",
    level: 4,
    stats: { health: 26, stamina: 20, strength: 5, defence: 6, attack: 7 },
    homeSlug: "ruined_tower",
    roam: false,
    dialogue: ["...leave..."],
    drops: ["tarnished_ring"],
    resistances: ["physical"],
    weaknesses: ["holy"],
    temperament: "hostile"
  }
];
