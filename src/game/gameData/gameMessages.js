const gameMessages = {
  attackNothing:
    "You flay your arms about and growl like a rabid dog. You never know, it might help...", // attack nothing
  noSuchCreatureFound: "There is no such creature in this location.", // No creature found in location
  inventoryDropped: "The creature's inventory drops to the floor:", // Creature defeated and drops inv
  inventoryEmpty: "You're inventory is empty. Go find some stuff...",
  emptyInventory: " nothing but dust...", // Creature defeated, inv is empty
  unknownArtifact: "I don't know what that is.",
  unknownCommand: "I'm sure that means something somewhere...",
  playerDefeated: "You have been defeated by the creature!", // Player losses attack
  criticalHit: "Critical hit! ",
  notEdible: "You can't eat that!",
  notUseable: "You can't use that!",
  notEquippable: "You can't equip yourself with one of those here.",
  levelledUp: "You leveled up! You've reached level: ",
  noDescription: "There's nothing particularly interesting about this ", // examine object without description
};

export default gameMessages;
