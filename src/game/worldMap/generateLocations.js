import AppError from "../../../base-template/src/utils/errors/AppError.js";
import Location from "../Locations/location.js";

// Create the specified number of Locations
const generateLocations = (
  numlocations,
  locationTitles,
  locationDescriptions = "Not set yet"
) => {
  try {
    const locations = [];
    for (let i = 0; i < numlocations; i++) {
      const randomTitle =
        locationTitles[Math.floor(Math.random() * locationTitles.length)];
      const locationId = i + 1;
      const locationDescription = "Not set yet";
      const location = new Location(
        locationId,
        randomTitle,
        locationDescription
      );
      locations.push(location);
    }
    return locations;
  } catch (error) {
    throw new AppError(`Error generating locations. ${error}`, 400);
  }
};

export default generateLocations;
