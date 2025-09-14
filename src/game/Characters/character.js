import gameMessages from "../gameData/gameMessages.js";
class Character {
  constructor(
    name,
    health = 10,
    stamina = 10,
    strength = 10,
    defence = 5,
    attack = 10,
    currentLocation = null,
    inventory = [],
    experience = 0,
    level = 1,
    classType = ""
  ) {
    this.name = name;
    this.currentLocation = currentLocation;
    this.inventory = inventory;
    this.classType = classType;
    this.killCount = 0;
    this.killValue = 1;
    this.equippedItems = {};
    this.isAttackable = true;

    this.stats = {
      health: Number(health ?? 10),
      stamina: Number(stamina ?? 10),
      strength: Number(strength ?? 10),
      defence: Number(defence ?? 5),
      attack: Number(attack ?? 10),
      experience: Number(experience ?? 0),
      level: Number(level ?? 1),
      kills: Number(this.killCount ?? 0)
    };
  }

  // Use an item from the inventory
  useItem(itemName) {
    const item = this.inventory.find(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );
    if (item && item.type === "armour") {
      if (this.equippedItems[itemName]) {
        return `You are already using ${itemName}.`;
      }
      this.defence += item.defence;
      this.attack += item.attack;
      this.equippedItems[itemName] = item;
      return `You equipped the ${itemName}, increasing your defence to ${this.defence} and attack to ${this.attack}.`;
    }
    return gameMessages.notUseable;
  }

  // Eat (drink) a consumable item from the inventory
  consumeItem(itemName) {
    const item = this.inventory.find(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );
    if (item && item.type === "edible") {
      const message = item.consume(this);
      // Remove item from inventory after consumption
      this.inventory = this.inventory.filter((invItem) => invItem !== item);
      return message;
    }
    return gameMessages.notEdible;
  }

  addKill() {
    return this.killCount++;
  }

  getKills() {
    return this.killCount;
  }

  // Provide stats in human readable format
  getStats() {
    return `${this.stats.health}. Stamina: ${this.stats.stamina}. Strength: ${this.stats.strength}. Defence: ${this.stats.defence}. Attack: ${this.stats.attack}. Level: ${this.stats.level}. : ${this.stats.experience}. Kills: ${this.stats.killCount}.`;
  }

  // Provide stats as an object
  getStatsObj() {
    return {
      ...this.stats,
      kills: this.killCount
    };
  }

  // Check for items in inventory
  hasInventoryItems() {
    return this.getInventory().length > 0;
  }

  getInventory() {
    const inventory = this.inventory.map((item) => item.name).join(", ");
    return inventory;
  }

  // Drop entire inventory into the current location (only used when character is killed)
  dropInventory(currentLocation) {
    // No artifacts to drop
    if (this.inventory.length === 0) {
      return;
    }

    this.inventory.forEach((artifact) => {
      currentLocation.addArtifact(artifact);
    });

    // Clear inventory after dropping artifacts
    this.inventory = [];

    return `${this.name}'s entire inventory dropped into ${currentLocation.name}.`;
  }

  gainExperience(amount) {
    this.experience += amount;
    return this.checkLevelUp();
  }

  isAlive() {
    return this.health > 0;
  }

  // Used when XP is increased
  checkLevelUp() {
    const levelThreshold = this.level * 100; // Example threshold: Level 1 = 100 XP, Level 2 = 200 etc.
    if (this.experience >= levelThreshold) {
      this.level++; // increment level
      this.experience = 0; // Reset XP to 0
      this.attack += 5; // Example stat increase on level up
      this.defence += 5; // Example stat increase on level up
      this.strength += 5;
      // this.maxHealth += 20; // Example stat increase on level up
      // this.health = this.maxHealth; // Restore health to max on level up

      return `${gameMessages.levelledUp} ${this.level}!`;
    }
  }

  // Actions
  moveTo(location) {
    if (this.currentLocation) {
      this.currentLocation.removeCharacter(this);
    }
    this.currentLocation = location;
    location.addCreature(this);
    return `${this.name} moves to ${location.name}`;
  }

  attackTarget(target) {
    // Calculate the damage done - multiplied is between 01.5 and 0.5
    const randomMultiplier = Math.random() * (1.5 - 0.5) + 0.5;
    // Calculate the attack -attacker's attack x multiplier - target's defence (and is not less than 0)
    const damage = Math.max(
      0,
      Math.round(this.attack * randomMultiplier - target.defence)
    );

    // Change stats
    if (damage > 0) {
      target.health = Math.max(0, target.health - damage);
    }

    const message = `${this.name} attacks ${target.name} and does ${damage} damage!`;
    return { message, damage };
  }

  // Not implemented
  heal(amount) {
    this.health += amount;
    return `${this.name} heals for ${amount} health.`;
  }

  // Used when item is eaten/equipped
  increaseAttribute(attribute, amount) {
    this[attribute] += amount;
    return `${this.name} increases ${attribute} by ${amount}`;
  }

  addItemToInventory(item) {
    this.inventory.push(item);
    return `${this.name} picks up ${item.name}`;
  }

  // Increase stats when levelling up
  levelUp() {
    this.health += 10;
    this.attack += 2;
    this.defence += 2;
  }
}

export default Character;
