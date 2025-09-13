// game/startGame.js
import Game from "./Game.js";
import AppError from "../../base-template/src/utils/errors/AppError.js";

let gameSingleton = null;
let started = false;

export function startGame(deps = {}) {
  if (!gameSingleton) gameSingleton = new Game(deps);
  if (started) return gameSingleton;

  try {
    gameSingleton.start();
    started = true;
    console.log("Game started…");
    return gameSingleton;
  } catch (err) {
    gameSingleton = null;
    started = false;
    throw new AppError(`Unable to start game: ${err?.message || err}`);
  }
}

export function getGame() {
  if (!started || !gameSingleton) {
    throw new AppError(
      "Game has not been started yet. Call startGame() first."
    );
  }
  return gameSingleton;
}

// optional, if you want to support graceful shutdowns
export function stopGame() {
  if (!started || !gameSingleton) return;
  gameSingleton.stop?.();
  started = false;
}
