import gameMessages from "../../gameData/gameMessages.js";

const examine = (player, targetName) => {
  const currentLocation = player.currentLocation;
  const lowerCaseTargetName = targetName.toLowerCase();
  const artifacts = currentLocation.artifacts;
  const creatures = currentLocation.creatures;
  const inventory = player.inventory;
  let target = null;

  // Check for artifacts in the current location
  for (const artifact of artifacts) {
    if (artifact.name.toLowerCase() === lowerCaseTargetName) {
      target = artifact;
      break;
    }
  }

  // If not found in current location artifacts, check for creatures
  if (!target) {
    for (const creature of creatures) {
      if (creature.name.toLowerCase() === lowerCaseTargetName) {
        target = creature;
        break;
      }
    }
  }

  // If still not found, check for artifacts in the player's inventory
  if (!target) {
    for (const artifact of inventory) {
      if (artifact.name.toLowerCase() === lowerCaseTargetName) {
        target = artifact;
        break;
      }
    }
  }

  // Log the description of the target if found
  if (target) {
    if (!target.description) {
      return `${gameMessages.noDescription} ${target.name}`;
    }
    return `You examine the ${target.name}: ${target.description}`;
  }
  return `Cannot find ${targetName} to examine.`;
};

export default examine;
