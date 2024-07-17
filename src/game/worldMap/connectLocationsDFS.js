import AppError from "../../../base-template/src/utils/errors/AppError.js";
import gameData from "../gameData/game1.js";

const connectLocationsDFS = (locations) => {
  try {
    const { directions } = gameData;
    const visited = new Set();
    const stack = [locations[0]];

    while (stack.length > 0) {
      const location = stack.pop();
      if (visited.has(location)) continue;
      visited.add(location);

      const shuffledDirections = Object.keys(directions).sort(
        () => Math.random() - 0.5
      );

      for (const direction of shuffledDirections) {
        if (Math.random() < 0.7) {
          const nextLocation =
            locations[Math.floor(Math.random() * locations.length)];
          if (!visited.has(nextLocation)) {
            location.exits[direction] = nextLocation;
            nextLocation.exits[directions[direction]] = location;
            stack.push(nextLocation);
          }
        }
      }
    }

    const locationsWithExits = locations.filter(
      (location) => Object.keys(location.exits).length > 0
    );

    return locationsWithExits;
  } catch (error) {
    throw new AppError(`Error connecting locations. ${error}`, 400);
  }
};

export default connectLocationsDFS;
