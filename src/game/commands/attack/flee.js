import AppError from ".././../../../base-template/src/utils/errors/AppError.js";

const flee = (game, creatures) => {
  let message = "";
  creatures.forEach((creature) => {
    const fleeChance = Math.random();
    if (fleeChance < 0.3) {
      const exits = Object.keys(game.player.currentLocation.exits);
      const randomExit = exits[Math.floor(Math.random() * exits.length)];
      const neighbourLocation = game.player.currentLocation.getExit(randomExit);

      if (!neighbourLocation) {
        throw new AppError(
          `${creature.name} cannot find a neighbouring Location to flee to!`
        );
      }

      creatures.splice(creatures.indexOf(creature), 1);
      neighbourLocation.addCharacter(creature);
      message += `${creature.name} flees to the ${randomExit}! `;
    }
  });
  return message;
};

export default flee;
