import Artifact from "./artifact.js";

class Weapon extends Artifact {
  constructor(
    name,
    description,
    { attack = 0, defence = 0, strength = 0, condition = 100 } = {}
  ) {
    super(name, description, {
      condition,
      stats: { attack, defence, strength }
    });
    this.type = "weapon";
    this.condition = condition;
    this.equipped = false;
  }

  // Method specific to weapons
  getDetails() {
    return `${this.name}: ${this.description}, Attack: ${this.stats.attack}, Defence: ${this.stats.defence}, Strength: ${this.stats.strength}, Condition: ${this.condition}, Equipped: ${this.equipped}`;
  }
}

export default Weapon;
