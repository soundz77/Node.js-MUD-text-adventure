// gameData.js

export const gameData = {
  counts: {
    locations: 5,
    creatures: 20,
    artifacts: 50
  },
  odds: {
    creatureInLocation: 0.9,
    artifactInLocation: 0.5,
    creatureHasArtifact: 0.5,
    critChance: 0.1
  },
  critMultiplier: 2,
  startLocationId: 1,
  directions: { north: "south", south: "north", east: "west", west: "east" }
};
