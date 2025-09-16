import AppError from "../../../base-template/src/utils/errors/AppError.js";
import { artifactDescriptions } from "../gameData/artifactDescriptions.js";
import { createArtifactFromBlueprint } from "../gameData/factories.js";

const addRandomArtifactToLocation = (location) => {
  try {
    const bp =
      artifactDescriptions[(Math.random() * artifactDescriptions.length) | 0];
    const artifact = createArtifactFromBlueprint(bp);

    location.addArtifact(artifact);
    //  console.log(`Placed ${artifact.name} in ${location.name}`);
  } catch (error) {
    throw new AppError(`Error adding artifact to location. ${error}`, 400);
  }
};

export default addRandomArtifactToLocation;
