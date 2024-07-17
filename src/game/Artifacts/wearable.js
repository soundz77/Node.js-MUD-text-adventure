import Weapon from "./artifact.js";

class Wearable extends Weapon {
  constructor(name, description, attack, defence) {
    super(name, description);
    this.attack = attack;
    this.defence = defence;
    this.type = "armour";
  }

  // move to Artifact
  getDetails() {
    return `${this.name}: ${this.description}, defence: ${this.defence}, Condition: ${this.condition}`;
  }
}

export default Wearable;
