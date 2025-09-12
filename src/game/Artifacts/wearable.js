import Artifact from "./artifact.js";

class Wearable extends Artifact {
  constructor(
    name,
    description,
    { defence = 0, attack = 0, strength = 0, condition = 100 } = {}
  ) {
    super(name, description, {
      condition,
      stats: { defence, attack, strength }
    });
    this.type = "wearable";
    this.equipped = false;
  }

  // move to Artifact
  getDetails() {
    return `${this.name}: ${this.description}, defence: ${this.stats.defence}, strength: ${this.stats.strength}, Condition: ${this.condition}`;
  }
}

export default Wearable;
