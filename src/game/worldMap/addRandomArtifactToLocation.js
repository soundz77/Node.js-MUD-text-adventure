import AppError from "../../../base-template/src/utils/errors/AppError.js";

import gameData from "../gameData/game1.js";

const addRandomArtifactToLocation = (location) => {
  try {
    const { artifactTypes } = gameData;
    const artifact =
      artifactTypes[Math.floor(Math.random() * artifactTypes.length)];
    location.addArtifact(artifact);
    console.log(`Placed ${artifact.name} in ${location.name}`);
  } catch (error) {
    throw new AppError(`Error adding artifact to location. ${error}`, 400);
  }
};

export default addRandomArtifactToLocation;
