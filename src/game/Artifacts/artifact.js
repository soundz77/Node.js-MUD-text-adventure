// Artifacts/artifact.js
class Artifact {
  constructor(
    name,
    description,
    {
      condition = 100,
      // unified stats payload (all optional, all numbers)
      stats = { attack: 0, defence: 0, strength: 0, health: 0, stamina: 0 }
    } = {}
  ) {
    this.name = name;
    this.description = description;
    this.condition = Number(condition);
    // normalize all numeric fields
    this.stats = {
      attack: Number(stats.attack ?? 0),
      defence: Number(stats.defence ?? 0),
      strength: Number(stats.strength ?? 0),
      health: Number(stats.health ?? 0),
      stamina: Number(stats.stamina ?? 0)
    };
    this.type = "artifact";
    this.value = 10;
  }

  /** Upgrade/modify this item’s stats in-place (positive or negative) */
  applyUpgrade(delta = {}) {
    for (const k of Object.keys(this.stats)) {
      if (delta[k] != null)
        this.stats[k] = Number(this.stats[k]) + Number(delta[k]);
    }
    return this;
  }

  getFullDetails() {
    const s = this.stats;
    const statStr = `Atk:${s.attack} Def:${s.defence} Str:${s.strength} HP:${s.health} Sta:${s.stamina}`;
    return `${this.name}: ${this.description} | ${statStr} | Cond:${this.condition}`;
  }

  getBasicDetails() {
    return this.name;
  }
}

export default Artifact;
