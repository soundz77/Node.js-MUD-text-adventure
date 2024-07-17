import AppError from "../../../../base-template/src/utils/errors/AppError.js";
import Location from "../../Locations/location.js";

const moveTo = (player, location) => {
  if (location instanceof Location) {
    player.currentLocation = location;
    return `Player moved to location: ${location.name}`;
  }
  throw new AppError(`Invalid location object passed to moveTo:`, location);
};

export default moveTo;
