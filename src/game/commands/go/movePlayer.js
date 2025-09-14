import AppError from "../../../../base-template/src/utils/errors/AppError.js";

const movePlayer = (game, direction) => {
  try {
    const current = game.player.currentLocation;
    if (!current) {
      throw new AppError("Player has no current location", 400);
    }

    const nextLocation = current.getExit(direction);
    if (!nextLocation) {
      return `There is no exit to the ${direction}.`;
    }

    // Let Player.moveTo() handle removal/adding to location.players
    game.player.moveTo(nextLocation);

    return `You move ${direction} to ${nextLocation.name}.`;
  } catch (error) {
    throw new AppError(`Error moving to ${direction}: ${error.message}`, 400);
  }
};

export default movePlayer;
