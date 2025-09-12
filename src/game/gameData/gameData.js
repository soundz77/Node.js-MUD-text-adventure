// gameData/game1.js
// PURE DATA: no class imports or `new` here.

export const gameData = {
  counts: {
    locations: 50,
    creatures: 100,
    artifacts: 30
  },
  odds: {
    creatureInLocation: 0.9,
    artifactInLocation: 0.5,
    creatureHasArtifact: 0.5,
    critChance: 0.1
  },
  critMultiplier: 2,
  startLocationName: "Location: 1",
  directions: { north: "south", south: "north", east: "west", west: "east" }
};

export const locationDescriptions = [
  "A cozy room with a fireplace.",
  "A dark, mysterious chamber.",
  "A lush, green forest clearing.",
  "A damp, underground cave.",
  "An abandoned castle hallway.",
  "A sunny beach with golden sand.",
  "A snow-covered mountain peak.",
  "A tranquil garden with blooming flowers."
];

export const creatureBlueprints = [
  {
    id: "goblin",
    name: "Goblin",
    stats: { health: 5, stamina: 5, strength: 8, defence: 3, attack: 10 },
    level: 1,
    baseXP: 5,
    class: ""
  },
  {
    id: "spider",
    name: "Spider",
    stats: { health: 5, stamina: 5, strength: 8, defence: 3, attack: 10 },
    level: 1,
    baseXP: 4,
    class: ""
  },
  {
    id: "skeleton",
    name: "Skeleton",
    stats: { health: 6, stamina: 5, strength: 8, defence: 4, attack: 10 },
    level: 1,
    baseXP: 6,
    class: ""
  },
  {
    id: "orc",
    name: "Orc",
    stats: { health: 8, stamina: 6, strength: 10, defence: 4, attack: 12 },
    level: 1,
    baseXP: 9,
    class: ""
  },
  {
    id: "dragon",
    name: "Dragon",
    stats: { health: 50, stamina: 20, strength: 20, defence: 12, attack: 25 },
    level: 5,
    baseXP: 100,
    class: ""
  }
];

export const artifactBlueprints = [
  {
    id: "ancient-sword",
    kind: "weapon",
    name: "Ancient sword",
    description: "A sword with mystical powers.",
    mods: { damage: 10, defence: 0, strength: 0 }
  },
  {
    id: "silver-shield",
    kind: "wearable",
    name: "Silver shield",
    description: "A shield that provides extra defence.",
    mods: { damage: 0, defence: 10, strength: 0 }
  },
  {
    id: "mystic-amulet",
    kind: "wearable",
    name: "Mystic amulet",
    description: "An amulet with magical properties.",
    mods: { damage: 0, defence: 0, strength: 0 }
  },
  {
    id: "golden-chalice",
    kind: "artifact",
    name: "Golden chalice",
    description: "A valuable golden chalice.",
    mods: { damage: 0, defence: 0, strength: 0 }
  },
  {
    id: "magic-potion",
    kind: "edible",
    name: "Magic potion",
    description: "A potion that does strange things to the drinker.",
    effects: { health: 20, stamina: 20 }
  },
  {
    id: "mushrooms",
    kind: "edible",
    name: "Mushrooms",
    description: "Red with white dots on them.",
    effects: { health: 20, stamina: 10 }
  },
  {
    id: "apple",
    kind: "edible",
    name: "Apple",
    description: "A juicy red apple.",
    effects: { health: 10, stamina: 5 }
  },
  {
    id: "poisonous-berry",
    kind: "edible",
    name: "Poisonous Berry",
    description: "A berry that looks dangerous.",
    effects: { health: -20, stamina: -10 }
  }
];
