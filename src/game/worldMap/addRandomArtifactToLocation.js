import AppError from "../../../base-template/src/utils/errors/AppError.js";
import { artifactBlueprints } from "../gameData/gameData.js";
import { createArtifactFromBlueprint } from "../gameData/factories.js";

const addRandomArtifactToLocation = (location) => {
  try {
    const bp =
      artifactBlueprints[(Math.random() * artifactBlueprints.length) | 0];
    const artifact = createArtifactFromBlueprint(bp);

    location.addArtifact(artifact);
   //  console.log(`Placed ${artifact.name} in ${location.name}`);
  } catch (error) {
    throw new AppError(`Error adding artifact to location. ${error}`, 400);
  }
};

export default addRandomArtifactToLocation;
