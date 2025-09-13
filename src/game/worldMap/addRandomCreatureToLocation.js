import AppError from "../../../base-template/src/utils/errors/AppError.js";
import { creatureBlueprints } from "../gameData/gameData.js";
import addRandomArtifactToCreature from "./addRandomArtifactToCreature.js";
import { createCreatureFromBlueprint } from "../gameData/factories.js";

/**
 * Add a random creature to a location.
 * @param {Location} location
 * @param {{ pHasArtifact?: number }} [opts]
 */
const addRandomCreatureToLocation = (location, opts = {}) => {
  try {
    const { pHasArtifact = 0.5 } = opts;

    // pick a blueprint, then instantiate
    const bp =
      creatureBlueprints[(Math.random() * creatureBlueprints.length) | 0];
    const creature = createCreatureFromBlueprint(bp);

    // add to the location using your existing API
    location.addCreature(creature);

    // optionally give it an artifact
    let hasArtifact = false;
    if (Math.random() < pHasArtifact) {
      addRandomArtifactToCreature(creature);
      hasArtifact = true;
    }

    // debug logs
    // console.log(`Added ${creature.name} to location ${location.name}`);
    if (hasArtifact) {
      //  console.log("and gave it:");
      // creature.inventory.forEach((a) => console.log(a.name));
    } else {
      // console.log("and gave it nothing.");
    }
  } catch (error) {
    throw new AppError(`Error adding creature to location. ${error}`, 400);
  }
};

export default addRandomCreatureToLocation;
