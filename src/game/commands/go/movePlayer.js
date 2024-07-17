import AppError from "../../../../base-template/src/utils/errors/AppError.js";

const movePlayer = (game, direction) => {
  try {
    const nextLocation = game.player.currentLocation.getExit(direction);
    if (nextLocation) {
      game.player.moveTo(nextLocation);
      return `You move ${direction} to ${nextLocation.description}.`;
    }
    return `There is no exit to the ${direction}.`;
  } catch (error) {
    throw new AppError(`Error moving to ${direction} ${error}`);
  }
};
export default movePlayer;
