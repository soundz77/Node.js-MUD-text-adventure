import gameMessages from "../../gameData/gameMessages.js";

const showInventory = (player) => {
  return !player.hasInventoryItems()
    ? gameMessages.inventoryEmpty
    : player.inventory.map((artifact) => artifact.getBasicDetails());
};

export default showInventory;
