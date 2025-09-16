import AppError from "../../../base-template/src/utils/errors/AppError.js";
import { artifactDescriptions } from "../gameData/artifactDescriptions.js";
import { createArtifactFromBlueprint } from "../gameData/factories.js";

const addRandomArtifactToCreature = (creature) => {
  try {
    // pick a blueprint, then instantiate
    const bp =
      artifactDescriptions[(Math.random() * artifactDescriptions.length) | 0];
    const artifact = createArtifactFromBlueprint(bp);

    creature.addArtifact(artifact);

    //    console.log(`Gave ${artifact.name} to creature: ${creature.name}`);
  } catch (error) {
    throw new AppError(`Error adding artifact to creature. ${error}`, 400);
  }
};

export default addRandomArtifactToCreature;
