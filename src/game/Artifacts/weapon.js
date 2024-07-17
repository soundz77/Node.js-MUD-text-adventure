import Artifact from "./artifact.js";

class Weapon extends Artifact {
  constructor(name, description, attack, defence, strength) {
    super(name, description);
    this.attack = attack;
    this.defence = defence;
    this.strength = strength;
    this.type = "weapon";
    this.equipped = false;
  }

  // Method specific to weapons
  getDetails() {
    return `${this.name}: ${this.description}, Attack: ${this.attack}, Defence: ${this.defence}, Strength: ${this.strength}, Condition: ${this.condition}, Equipped: ${this.equipped}`;
  }
}

export default Weapon;
