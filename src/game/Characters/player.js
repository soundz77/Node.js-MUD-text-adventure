import Character from "./character.js";
import moveTo from "../commands/go/moveTo.js";
import showInventory from "../commands/inventory/showInventory.js";
import takeArtifact from "../commands/take/takeArtifact.js";
import putArtifact from "../commands/put/putArtifact.js";
import examine from "../commands/examine/examine.js";
import showPlayerStats from "../commands/health/showPlayerStats.js";
import equipCmd from "../commands/equip/equip.js"; // renamed to avoid shadowing
import attackCreatureCmd from "../commands/attack/attackCreature.js";

class Player extends Character {
  constructor({
    name = "",
    playerClass = "",
    health = 20,
    stamina = 50,
    strength = 30,
    defence = 10,
    attack = 20
  } = {}) {
    // Character sets this.stats with these values
    super(name, health, stamina, strength, defence, attack);
    this.playerClass = playerClass;
  }

  // Movement
  moveTo(location) {
    return moveTo(this, location);
  }

  // Always read from stats only
  getPlayerDetails() {
    return {
      name: this.name,
      class: this.playerClass,
      stats: this.stats,
      experience: this.stats.experience
    };
  }

  showInventory() {
    return showInventory(this);
  }

  takeArtifact(artifactName) {
    return takeArtifact(this, artifactName);
  }

  putArtifact(artifactName) {
    // fixed comma-operator bug
    return putArtifact(this, artifactName);
  }

  examine(targetName) {
    return examine(this, targetName);
  }

  // If this returns a string or object, keep the command module authoritative
  showPlayerStats() {
    return showPlayerStats(this);
  }

  // Keep this as a thin passthrough; the real handler needs the Game context
  attackCreature(game, characterName) {
    return attackCreatureCmd(game, characterName);
  }

  // Convenience: let Player.equip() work without a full Game by fabricating { player: this }
  equip(itemName, game = null) {
    const ctx = game || { player: this };
    return equipCmd(ctx, itemName);
  }
}

export default Player;
