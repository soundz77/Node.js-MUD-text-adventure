// Player.js
import Character from "./character.js";
import moveTo from "../commands/go/moveTo.js";
import showInventory from "../commands/inventory/showInventory.js";
import takeArtifact from "../commands/take/takeArtifact.js";
import putArtifact from "../commands/put/putArtifact.js";
import examine from "../commands/examine/examine.js";
import showPlayerStats from "../commands/health/showPlayerStats.js";
import equipCmd from "../commands/equip/equip.js"; // passthrough
import attackCreatureCmd from "../commands/attack/attackCreature.js";

class Player extends Character {
  constructor({
    name = "",
    playerClass = "",
    // base stat maxima (mapped into Character.baseStats)
    health = 20,
    stamina = 50,
    strength = 30,
    defence = 10,
    attack = 20,
    // optional extras
    currentLocation = null,
    inventory = [],
    level = 1,
    experience = 0,
    flags = { isAttackable: true }
  } = {}) {
    super({
      name,
      classType: "player",
      currentLocation,
      inventory,
      baseStats: {
        level: Number(level) || 1,
        experience: Number(experience) || 0,
        healthMax: Number(health) || 20,
        staminaMax: Number(stamina) || 50,
        strength: Number(strength) || 30,
        defence: Number(defence) || 10,
        attack: Number(attack) || 20
      },
      state: {
        health: null, // initialize to healthMax
        stamina: null // initialize to staminaMax
      },
      flags
    });

    this.playerClass = String(playerClass || "");
  }

  // Movement (delegates to your command module)
  moveTo(location) {
    return moveTo(this, location);
  }

  // Inventory (delegates)
  showInventory() {
    return showInventory(this);
  }
  takeArtifact(artifactName) {
    return takeArtifact(this, artifactName);
  }
  dropArtifact(artifactName) {
    return putArtifact(this, artifactName);
  }

  // Interactions
  examine(targetName) {
    return examine(this, targetName);
  }

  // Stats display (your command decides formatting)
  showPlayerStats() {
    return showPlayerStats(this);
  }

  // Combat passthrough (needs Game context)
  attackCreature(game, characterName) {
    return attackCreatureCmd(game, characterName);
  }

  // Convenience equip wrapper (works without full Game)
  equip(itemName, game = null) {
    const ctx = game || { player: this };
    return equipCmd(ctx, itemName);
  }

  // Player-facing details for UI
  getPlayerDetails() {
    // getStatsObj() returns { base, state, derived, kills }
    const stats = this.getStatsObj();
    return {
      name: this.name,
      class: this.playerClass,
      stats,
      experience: this.baseStats.experience
    };
  }
}

export default Player;
