import Character from "./character.js";

class Creature extends Character {
  constructor(
    name,
    health = 100,
    stamina = 100,
    strength = 100,
    defence = 500,
    attack = 100,
    currentLocation = null,
    inventory = [],
    experience = 0,
    level = 1,
    classType = ""
  ) {
    super(
      name,
      health,
      stamina,
      strength,
      defence,
      attack,
      currentLocation,
      inventory,
      experience,
      level,
      classType
    );
  }

  addArtifact(artifact) {
    this.inventory.push(artifact);
  }

  showArtifacts() {
    return this.inventory.map((artifact) => artifact.name).join(", ");
  }
}

export default Creature;
