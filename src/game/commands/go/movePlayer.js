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

    const fromId = current.id ?? null;

    // Let Player.moveTo() handle removal/adding to location.players
    game.player.moveTo(nextLocation);

    const toId = nextLocation.id ?? null;
    // Optional hook (socket layer should set this):
    if (typeof game.onPlayerMoved === "function") {
      try {
        game.onPlayerMoved(game.player, fromId, toId, direction);
      } catch {}
    }

    return `You move ${direction} to ${nextLocation.name}.`;
  } catch (error) {
    throw new AppError(`Error moving to ${direction}: ${error.message}`, 400);
  }
};

export default movePlayer;
