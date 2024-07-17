// import addARandomArtifactToCreature
import AppError from "../../../base-template/src/utils/errors/AppError.js";
import gameData from "../gameData/game1.js";
import addRandomArtifactToCreature from "./addRandomArtifactToCreature.js";

const addRandomCreatureToLocation = (location) => {
  try {
    let hasArtifact = false;
    const { creatureTypes } = gameData;
    const creature =
      creatureTypes[Math.floor(Math.random() * creatureTypes.length)];
    location.addCreature(creature);

    if (Math.random() < 0.5) {
      addRandomArtifactToCreature(creature);
      hasArtifact = true;
    }

    console.log(`Added ${creature.name} to location ${location.name}`);

    if (hasArtifact) {
      console.log("and gave it ");
      creature.inventory.forEach((artifact) => {
        console.log(artifact.name);
      });
    } else {
      console.log("and gave it nothing. ");
    }
  } catch (error) {
    throw new AppError(`Error adding creature to location ${error}`, 400);
  }
};

export default addRandomCreatureToLocation;
