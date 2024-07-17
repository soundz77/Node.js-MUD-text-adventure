import Character from "./character.js";
import moveTo from "../commands/go/moveTo.js";
import showInventory from "../commands/inventory/showInventory.js";
import takeArtifact from "../commands/take/takeArtifact.js";
import putArtifact from "../commands/put/putArtifact.js";
import examine from "../commands/examine/examine.js";
import showPlayerStats from "../commands/health/showPlayerStats.js";
import equip from "../commands/equip/equip.js";
import attackCreature from "../commands/attack/attackCreature.js";

class Player extends Character {
  constructor({
    name = "",
    playerClass = "",
    health = 20,
    stamina = 50,
    strength = 30,
    defence = 10,
    attack = 20,
  }) {
    super(name, health, stamina, strength, defence, attack);
    this.playerClass = playerClass;
  }

  // Most of these should be moved to the Character class

  moveTo(location) {
    return moveTo(this, location);
  }

  getPlayerDetails() {
    return {
      playerName: this.player.name,
      playerClass: this.player.playerClass,
      playerHealth: this.player.health,
      playerAttack: this.player.attack,
      playerStamina: this.player.stamina,
    };
  }

  showInventory() {
    return showInventory(this);
  }

  takeArtifact(artifactName) {
    return takeArtifact(this, artifactName);
  }

  putArtifact(artifactName) {
    return putArtifact, (this, artifactName);
  }

  examine(targetName) {
    return examine(this, targetName);
  }

  showPlayerStats() {
    return showPlayerStats(this);
  }

  attackCreature(characterName) {
    return attackCreature(this, characterName);
  }

  equip(itemName) {
    return equip(this, itemName);
  }
}

export default Player;
