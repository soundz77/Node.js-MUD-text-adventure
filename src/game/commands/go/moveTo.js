import AppError from "../../../../base-template/src/utils/errors/AppError.js";
import Location from "../../Locations/location.js";

// Update this to move anything, not just players
// Also create a higher class for gamePieces and use it for players, characters, items, NPCs as all have some functions in common

const moveTo = (player, location) => {
  if (!(location instanceof Location)) {
    throw new AppError(`Invalid location object passed to moveTo`, 400);
  }

  // Remove from current location’s players list
  if (player.currentLocation?.removePlayer) {
    player.currentLocation.removePlayer(player);
  }

  // Update player reference
  player.currentLocation = location;

  // Add to new location’s players list
  if (location?.addPlayer) {
    location.addPlayer(player);
  }

  return `Player moved to location: ${location.name}`;
};

export default moveTo;
