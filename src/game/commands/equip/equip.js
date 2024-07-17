import AppError from ".././../../../base-template/src/utils/errors/AppError.js";

import gameMessages from "../../gameData/gameMessages.js";

const equip = (game, itemName) => {
  try {
    const inventory = game.player?.inventory; // Ensure accessing player inventory
    if (!inventory) {
      throw new AppError("Player inventory is undefined", 400);
    }

    const equipItem = inventory.find(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );
    if (!equipItem) {
      return `First you'll need to get a ${itemName} ...`;
    }

    // Check if the item is a valid type to equip
    if (equipItem.type !== "weapon" && equipItem.type !== "armor") {
      return gameMessages.notEquippable;
    }

    // Check if the item is already equipped
    if (equipItem.equipped === true) {
      return `You've already equipped yourself with a ${itemName}.`;
    }

    let attribute, amount;
    // Add bonus depending on item type
    if (equipItem.type === "weapon") {
      attribute = "attack";
      amount = equipItem.attack;
    } else if (equipItem.type === "armor") {
      // Ensure consistent spelling
      attribute = "defence"; // Assume consistent spelling
      amount = equipItem.defence;
    }

    const result = game.player.increaseAttribute(attribute, amount);

    // Set equipped flag on this specific item instance
    equipItem.equipped = true;

    return `You equip yourself with a ${itemName}. ${result}`;
  } catch (error) {
    console.error(`Error while equipping: ${error.message}`);
    throw new AppError(`Error while equipping`, 400);
  }
};

export default equip;
