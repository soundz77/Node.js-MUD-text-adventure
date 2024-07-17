import Artifact from "../Artifacts/artifact.js";
import Weapon from "../Artifacts/weapon.js";
import Wearable from "../Artifacts/wearable.js";
import Creature from "../Characters/creature.js";
import Edible from "../Artifacts/edible.js";

// Basic config
const gameData = {
  numberOfLocations: 50, // total number of locations in game
  numberOfCreatures: 100, // total number of creatures (all types) in game at startup
  numberOfArtifacts: 30, // total number of artifacts (all types) in game at startup
  chanceCreatureInLocation: 0.9, //: 50% chance of a creature being in a location
  chanceArtifactInlocation: 0.5, //: 50% chance of an artifact being in a location
  chanceCreatureHasArtifact: 0.5, // = 50% chance of a monster having at least one artifact
  startLocation: "Location: 1", // location where players begin the game
  critChance: 0.1, // = 10% chance of critical hit during an attack
  critMultiplier: 2, // Critical hits do damage * critMultiplier
  directions: {
    // Directions available on map
    north: "south",
    south: "north",
    east: "west",
    west: "east",
  },
  locationDescriptions: [
    // Generic location discriptions
    // Only descriptions are required here as everything else is added randomly.
    // Change the settings above to change the number of creatures, locations, etc.
    "A cozy room with a fireplace.",
    "A dark, mysterious chamber.",
    "A lush, green forest clearing.",
    "A damp, underground cave.",
    "An abandoned castle hallway.",
    "A sunny beach with golden sand.",
    "A snow-covered mountain peak.",
    "A tranquil garden with blooming flowers.",
  ],

  creatureTypes: [
    // name, health, stamina, strength, defence, attack, location, inventory, XP, level, class
    new Creature("Goblin", 5, 5, 8, 3, 10, null, [], 0, 1, ""),
    new Creature("Spider", 5, 5, 8, 3, 10, null, [], 0, 1, ""),
    new Creature("Skeleton", 5, 5, 8, 3, 10, null, [], 0, 1, ""),
    new Creature("Orc", 5, 5, 8, 3, 10, null, [], 0, 1, ""),
    new Creature("Spider", 5, 5, 8, 3, 10, null, [], 0, 1, ""),
    new Creature("Dragon", 5, 5, 8, 3, 10, null, [], 0, 1, ""),
  ],

  artifactTypes: [
    // name, description, damage, defence, strength
    new Weapon("Ancient sword", "A sword with mystical powers.", 10, 0, 0),
    new Wearable(
      "Silver shield",
      "A shield that provides extra defence.",
      0,
      10,
      0
    ),
    new Wearable(
      "Mystic amulet",
      "An amulet with magical properties.",
      0,
      0,
      0
    ),
    // name, description, condition
    new Artifact("Golden chalice", "A valuable golden chalice.", 0, 0, 0),
    new Edible(
      "Magic potion",
      "A potion that does strange things to the drinker.",
      20,
      20,
      0
    ),
    new Edible("Mushrooms", "Red with white dots on them.", 20, 10),
    new Edible("Apple", "A juicy red apple.", 10, 5),
    new Edible("Poisonous Berry", "A berry that looks dangerous.", -20, -10),
  ],
};

export default gameData;
