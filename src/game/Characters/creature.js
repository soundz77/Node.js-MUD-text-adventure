import Character from "./character.js";

class Creature extends Character {
  constructor(name) {
    super(name);
    this.name = name;
  }

  addArtifact(artifact) {
    this.inventory.push(artifact);
  }

  showArtifacts() {
    return this.inventory.map((artifact) => artifact.name).join(", ");
  }
}

export default Creature;
