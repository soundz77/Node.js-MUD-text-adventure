export const locationDescriptions = [
  {
    slug: "start",
    title: "Campfire Clearing",
    description:
      "A warm fire crackles at the center of the clearing. This is where your journey begins.",
    exits: { north: "forest_edge", east: "village_square" },
    npcs: [],
    artifacts: ["campfire_ring"],
    safeZone: true,
    tags: ["clearing", "start"]
  },
  {
    slug: "forest_edge",
    title: "Forest Edge",
    description:
      "Tall trees loom to the east, their shadows long in the fading light. A rough trail winds deeper into the woods.",
    exits: { south: "start", east: "deep_forest" },
    npcs: ["wanderer"],
    artifacts: [],
    safeZone: false,
    tags: ["forest"]
  },
  {
    slug: "deep_forest",
    title: "Deep Forest",
    description:
      "The canopy blocks most of the light. Strange sounds echo among the trees, and the path is easy to lose.",
    exits: { west: "forest_edge", north: "cave_entrance" },
    npcs: ["wolf_pack"],
    artifacts: ["mossy_stone"],
    safeZone: false,
    tags: ["forest", "dangerous"]
  },
  {
    slug: "cave_entrance",
    title: "Cave Entrance",
    description:
      "A jagged opening in the hillside leads into darkness. Cold air drifts from within.",
    exits: { south: "deep_forest", north: "cave_depths" },
    npcs: [],
    artifacts: ["broken_cart"],
    safeZone: false,
    tags: ["cave"]
  },
  {
    slug: "cave_depths",
    title: "Cave Depths",
    description:
      "The air is damp and stale. Stalactites hang overhead, and the ground is slick underfoot.",
    exits: { south: "cave_entrance" },
    npcs: ["cave_bat", "cave_bat"],
    artifacts: ["ancient_altar"],
    safeZone: false,
    tags: ["cave", "dark"]
  },
  {
    slug: "village_square",
    title: "Village Square",
    description:
      "A bustling square where merchants sell their wares and travelers gather.",
    exits: { west: "start", north: "inn", east: "river_bank" },
    npcs: ["merchant", "villager"],
    artifacts: ["village_well", "notice_board"],
    safeZone: true,
    tags: ["village", "hub"]
  },
  {
    slug: "inn",
    title: "The Resting Stag Inn",
    description:
      "A cozy inn with a roaring fireplace and the smell of stew in the air. Travelers share stories here.",
    exits: { south: "village_square" },
    npcs: ["innkeeper"],
    artifacts: ["hearth_fire"],
    safeZone: true,
    tags: ["village", "safe"]
  },
  {
    slug: "river_bank",
    title: "River Bank",
    description:
      "A gentle river flows north to south, its surface glistening in the sunlight.",
    exits: { west: "village_square", north: "stone_bridge" },
    npcs: [],
    artifacts: ["fishing_pier"],
    safeZone: false,
    tags: ["river"]
  },
  {
    slug: "stone_bridge",
    title: "Old Stone Bridge",
    description:
      "The bridge arches over the river, its stones worn smooth by centuries of travelers.",
    exits: { south: "river_bank", north: "ruined_tower" },
    npcs: ["bridge_guard"],
    artifacts: [],
    safeZone: false,
    tags: ["river", "crossing"]
  },
  {
    slug: "ruined_tower",
    title: "Ruined Tower",
    description:
      "Broken walls and collapsed stones mark what was once a proud watchtower. The air feels heavy with history.",
    exits: { south: "stone_bridge" },
    npcs: ["specter"],
    artifacts: ["fallen_banner"],
    safeZone: false,
    tags: ["ruin", "haunted"]
  }
];
