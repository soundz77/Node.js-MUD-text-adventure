import Artifact from "./artifact.js";

class Edible extends Artifact {
  constructor(
    name,
    description,
    { health = 0, stamina = 0, attack = 0, defence = 0, strength = 0 } = {}
  ) {
    super(name, description, {
      stats: { health, stamina, attack, defence, strength }
    });
    this.type = "edible";
  }

  /** Apply consumable effects to a character’s stats */
  consume(character) {
    const s = this.stats;
    // all number-safe adds
    character.stats.health = Math.max(
      0,
      Number(character.stats.health ?? 0) + s.health
    );
    character.stats.stamina = Math.max(
      0,
      Number(character.stats.stamina ?? 0) + s.stamina
    );
    character.stats.attack = Number(character.stats.attack ?? 0) + s.attack;
    character.stats.defence = Number(character.stats.defence ?? 0) + s.defence;
    character.stats.strength =
      Number(character.stats.strength ?? 0) + s.strength;
    return `${character.name} consumes ${this.name}.`;
  }
}

export default Edible;
