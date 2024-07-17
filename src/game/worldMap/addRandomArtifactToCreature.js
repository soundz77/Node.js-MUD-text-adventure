import AppError from "../../../base-template/src/utils/errors/AppError.js";

import gameData from "../gameData/game1.js";

const addRandomArtifactToCreature = (creature) => {
  try {
    const { artifactTypes } = gameData;
    const artifact =
      artifactTypes[Math.floor(Math.random() * artifactTypes.length)];
    creature.addArtifact(artifact);

    console.log(`Gave ${artifact.name} to creature: ${creature.name}`);
  } catch (error) {
    throw new AppError(`Error adding artifact to creature. ${error}`, 400);
  }
};

export default addRandomArtifactToCreature;
