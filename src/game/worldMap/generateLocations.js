import AppError from "../../../base-template/src/utils/errors/AppError.js";
import Location from "../Locations/location.js";
import gameData from "../gameData/game1.js";

// Create the specified number of Locations
const generateLocations = (numlocations) => {
  try {
    const { locationDescriptions } = gameData;
    const locations = [];
    for (let i = 0; i < numlocations; i++) {
      const randomDescription =
        locationDescriptions[
          Math.floor(Math.random() * locationDescriptions.length)
        ];
      const locationName = `Location: ${i + 1}`;
      const location = new Location(locationName, randomDescription);
      locations.push(location);
    }
    return locations;
  } catch (error) {
    throw new AppError(`Error generating locations. ${error}`, 400);
  }
};

export default generateLocations;
