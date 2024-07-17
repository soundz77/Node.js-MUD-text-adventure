import Game from "./Game.js";
import AppError from "../../base-template/src/utils/errors/AppError.js";

const startGame = new Game();

try {
  startGame.start();
  console.log("Game started...");
} catch (error) {
  throw new AppError(`Unable to start game: ${error}`);
}

export default startGame;
