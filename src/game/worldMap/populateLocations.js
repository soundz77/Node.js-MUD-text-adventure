import AppError from "../../../base-template/src/utils/errors/AppError.js";
import addRandomCreatureToLocation from "./addRandomCreatureToLocation.js";
import addRandomArtifactToLocation from "./addRandomArtifactToLocation.js";

const populateLocations = (
  locations,
  numCreatures,
  numArtifacts,
  chanceCreatureInlocation
) => {
  try {
    let creaturesAdded = 0;
    let artifactsAdded = 0;

    while (creaturesAdded < numCreatures) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      if (Math.random() < chanceCreatureInlocation) {
        addRandomCreatureToLocation(location);
        creaturesAdded++;
      }
    }

    while (artifactsAdded < numArtifacts) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      addRandomArtifactToLocation(location);
      artifactsAdded++;
    }

    return locations;
  } catch (error) {
    throw new AppError(`Error populating locations. ${error}`, 400);
  }
};

export default populateLocations;
