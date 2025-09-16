// Creature.js
import Character from "./character.js";

class Creature extends Character {
  constructor({
    name,
    classType = "creature",
    currentLocation = null,
    inventory = [],
    baseStats = {
      level: 1,
      experience: 0,
      healthMax: 20,
      staminaMax: 15,
      strength: 6,
      defence: 3,
      attack: 5
    },
    state = { health: null, stamina: null },
    flags = { isAttackable: true },

    // Creature-specific data (no behavior here)
    species = "unknown",
    temperament = "neutral", // "hostile" | "neutral" | "friendly"
    homeSlug = null, // resolved to id at load time
    homeId = null, // prefer id at runtime
    drops = [], // item slugs/ids
    resistances = [], // e.g., ["physical"]
    weaknesses = [] // e.g., ["holy"]
  } = {}) {
    super({
      name,
      classType,
      currentLocation,
      inventory,
      baseStats,
      state,
      flags
    });

    this.species = species;
    this.temperament = temperament;
    this.homeSlug = homeSlug;
    this.homeId = homeId;
    this.drops = Array.isArray(drops) ? drops.slice() : [];
    this.resistances = Array.isArray(resistances) ? resistances.slice() : [];
    this.weaknesses = Array.isArray(weaknesses) ? weaknesses.slice() : [];
  }

  // Optional: concise details for UI/logs
  getDetails() {
    const d = super.getDetails();
    return {
      ...d,
      species: this.species,
      temperament: this.temperament
    };
  }
}

export default Creature;
