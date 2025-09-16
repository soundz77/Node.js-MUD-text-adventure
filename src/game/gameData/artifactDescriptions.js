// gameData/artifactDescriptions.js
// Stationary, environmental fixtures (not typical inventory loot).
export const artifactDescriptions = [
  {
    slug: "campfire_ring",
    name: "Stone Campfire Ring",
    kind: "stationary",
    description: "A ring of stones around glowing embers. Warmth lingers.",
    stationary: true,
    interactions: ["rest", "warm_hands"], // hook to actions
    locationSlug: "start"
  },
  {
    slug: "mossy_stone",
    name: "Moss-Covered Stone",
    kind: "stationary",
    description: "A flat stone blanketed in thick moss.",
    stationary: true,
    interactions: ["examine"],
    locationSlug: "deep_forest"
  },
  {
    slug: "broken_cart",
    name: "Broken Cart",
    kind: "stationary",
    description:
      "A shattered wheel and scattered boards lie by the cave mouth.",
    stationary: true,
    interactions: ["search"], // might yield scraps/clues
    locationSlug: "cave_entrance",
    locked: false
  },
  {
    slug: "ancient_altar",
    name: "Ancient Altar",
    kind: "stationary",
    description: "Runes are etched into the stone, faintly luminescent.",
    stationary: true,
    interactions: ["read_runes", "offer_item"],
    locationSlug: "cave_depths",
    locked: true // requires key/condition to use fully
  },
  {
    slug: "village_well",
    name: "Village Well",
    kind: "stationary",
    description: "Clear water gleams at the bottom of the stone-lined well.",
    stationary: true,
    interactions: ["draw_water", "examine"],
    locationSlug: "village_square"
  },
  {
    slug: "notice_board",
    name: "Notice Board",
    kind: "stationary",
    description: "Pinned notes flutter in the breeze: jobs, bounties, rumors.",
    stationary: true,
    interactions: ["read_notices"], // can populate quests
    locationSlug: "village_square"
  },
  {
    slug: "hearth_fire",
    name: "Inn Hearth",
    kind: "stationary",
    description: "A crackling fire that fills the room with comforting warmth.",
    stationary: true,
    interactions: ["rest", "cook"],
    locationSlug: "inn"
  },
  {
    slug: "fishing_pier",
    name: "Fishing Pier",
    kind: "stationary",
    description:
      "A short pier with a creaking plank and a view of the current.",
    stationary: true,
    interactions: ["fish", "sit"],
    locationSlug: "river_bank"
  },
  {
    slug: "fallen_banner",
    name: "Fallen Banner",
    kind: "stationary",
    description: "A torn banner half-buried in rubble, its emblem faded.",
    stationary: true,
    interactions: ["examine", "salvage_cloth"],
    locationSlug: "ruined_tower"
  }
];
