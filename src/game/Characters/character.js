// Character.js
// - Equipment is by SLOT (not by name). Items may define { slot, mods:{ attack, defence, strength, healthMax, staminaMax } }
// - Effects are temporary modifiers with optional duration ticks (runner can decay and call expire)

class Character {
  constructor({
    name,
    classType = "",
    currentLocation = null,
    inventory = [],
    baseStats = {
      level: 1,
      experience: 0,
      healthMax: 10,
      staminaMax: 10,
      strength: 10,
      defence: 5,
      attack: 10
    },
    state = {
      health: null, // null → will initialize to healthMax
      stamina: null // null → will initialize to staminaMax
    },
    flags = {
      isAttackable: true
    }
  }) {
    // Identity / role
    this.name = String(name ?? "Unnamed");
    this.classType = String(classType ?? "");

    // Location
    this.currentLocation = currentLocation;

    // Inventory & equipment
    this.inventory = Array.isArray(inventory) ? inventory.slice() : [];
    this.equipped = {
      head: null,
      chest: null,
      legs: null,
      hands: null,
      feet: null,
      neck: null,
      finger1: null,
      finger2: null,
      mainHand: null,
      offHand: null
    };

    // Temporary effects (buffs/debuffs). Each: { id, mods:{...}, durationTicks?: number }
    this.effects = [];

    // Kills & value
    this.killCount = 0;
    this.killValue = 1;

    // Flags
    this.flags = {
      isAttackable: Boolean(flags?.isAttackable ?? true)
    };

    // Stats: base & current state
    this.baseStats = {
      level: Number(baseStats.level ?? 1),
      experience: Number(baseStats.experience ?? 0),
      healthMax: Number(baseStats.healthMax ?? 10),
      staminaMax: Number(baseStats.staminaMax ?? 10),
      strength: Number(baseStats.strength ?? 10),
      defence: Number(baseStats.defence ?? 5),
      attack: Number(baseStats.attack ?? 10)
    };

    this.state = {
      health:
        state.health == null
          ? this.baseStats.healthMax
          : Math.max(
              0,
              Math.min(Number(state.health), this.baseStats.healthMax)
            ),
      stamina:
        state.stamina == null
          ? this.baseStats.staminaMax
          : Math.max(
              0,
              Math.min(Number(state.stamina), this.baseStats.staminaMax)
            )
    };
  }

  // ---- Derived stats (base + equipment + effects) ----
  getDerivedStats() {
    const addMods = (acc, mods) => {
      if (!mods) return acc;
      if (mods.attack != null) acc.attack += Number(mods.attack);
      if (mods.defence != null) acc.defence += Number(mods.defence);
      if (mods.strength != null) acc.strength += Number(mods.strength);
      if (mods.healthMax != null) acc.healthMax += Number(mods.healthMax);
      if (mods.staminaMax != null) acc.staminaMax += Number(mods.staminaMax);
      return acc;
    };

    // Start with base
    const out = {
      level: this.baseStats.level,
      experience: this.baseStats.experience,
      attack: this.baseStats.attack,
      defence: this.baseStats.defence,
      strength: this.baseStats.strength,
      healthMax: this.baseStats.healthMax,
      staminaMax: this.baseStats.staminaMax
    };

    // Equipment
    for (const slot of Object.keys(this.equipped)) {
      const it = this.equipped[slot];
      if (it?.mods) addMods(out, it.mods);
    }

    // Effects
    for (const ef of this.effects) {
      if (ef?.mods) addMods(out, ef.mods);
    }

    return out;
  }

  // ---- Snapshots / getters ----
  isAlive() {
    return this.state.health > 0;
  }

  getStatsObj() {
    const derived = this.getDerivedStats();
    return {
      base: { ...this.baseStats },
      state: { ...this.state },
      derived,
      kills: this.killCount
    };
  }

  getInventory() {
    // Return the live array (callers should not mutate directly if you want stronger encapsulation)
    return this.inventory;
  }

  getInventoryNames() {
    return this.inventory.map((it) => it.name);
  }

  hasInventoryItems() {
    return this.inventory.length > 0;
  }

  // ---- Movement ----
  moveTo(location) {
    if (!location) {
      return { ok: false, message: "Invalid destination." };
    }
    // Standardize on add/removeCharacter regardless of Player/character
    if (this.currentLocation?.removeCharacter) {
      this.currentLocation.removeCharacter(this);
    }
    this.currentLocation = location;
    if (location?.addCharacter) {
      location.addCharacter(this);
    }
    return { ok: true, message: `${this.name} moves to ${location.name}` };
  }

  // ---- Inventory & equipment ----
  addItemToInventory(item) {
    this.inventory.push(item);
    return {
      ok: true,
      message: `${this.name} picks up ${item?.name ?? "item"}`
    };
  }

  removeItemFromInventory(predicateOrIndex) {
    if (typeof predicateOrIndex === "number") {
      const [removed] = this.inventory.splice(predicateOrIndex, 1);
      return removed ?? null;
    }
    const idx = this.inventory.findIndex(predicateOrIndex);
    if (idx >= 0) return this.inventory.splice(idx, 1)[0];
    return null;
  }

  equip(slot, item) {
    if (!item) return { ok: false, message: "No item to equip." };
    if (!slot || !(slot in this.equipped)) {
      return { ok: false, message: `Invalid slot '${slot}'.` };
    }
    // Optional: validate item.slot compatibility if your items carry it
    // if (item.slot && item.slot !== slot) { ... }

    const previously = this.equipped[slot];
    this.equipped[slot] = item;
    return {
      ok: true,
      message: `${this.name} equips ${item.name} on ${slot}.`,
      unequipped: previously ?? null
    };
  }

  unequip(slot) {
    if (!slot || !(slot in this.equipped)) {
      return { ok: false, message: `Invalid slot '${slot}'.` };
    }
    const removed = this.equipped[slot];
    this.equipped[slot] = null;
    return {
      ok: true,
      message: removed
        ? `${this.name} unequips ${removed.name}.`
        : "Nothing equipped.",
      item: removed
    };
  }

  // Consumables: items should expose .consume(actor) OR carry { effects:[...], heal/stamina, etc. }
  consume(itemNameOrPredicate) {
    const idx =
      typeof itemNameOrPredicate === "function"
        ? this.inventory.findIndex(itemNameOrPredicate)
        : this.inventory.findIndex(
            (it) =>
              it.name?.toLowerCase?.() ===
              String(itemNameOrPredicate).toLowerCase()
          );

    if (idx < 0) return { ok: false, message: "You can't consume that." };

    const item = this.inventory[idx];
    if (item?.consume) {
      // Delegate to item behavior
      const res = item.consume(this);
      // Remove from inventory if item declares it is consumed
      if (!res || res.consumed !== false) this.inventory.splice(idx, 1);
      return res ?? { ok: true, message: "Consumed." };
    }

    // Generic support: apply simple heals/effects if present on data
    let msg = [];
    if (item?.heal) {
      const healed = this.heal(item.heal);
      msg.push(`Healed ${healed} HP`);
    }
    if (Array.isArray(item?.effects) && item.effects.length) {
      for (const ef of item.effects) this.addEffect(ef);
      msg.push(`Applied ${item.effects.length} effect(s)`);
    }
    // Assume consumable by default if it has heal/effects
    if (item?.heal || (item?.effects && item.effects.length)) {
      this.inventory.splice(idx, 1);
      return { ok: true, message: msg.join(". ") };
    }

    return { ok: false, message: "Not edible/usable." };
  }

  // ---- Effects ----
  addEffect(effect) {
    // effect: { id?, mods:{...}, durationTicks?: number }
    const ef = { ...effect };
    if (!ef.id)
      ef.id = `ef:${Date.now()}:${Math.random().toString(16).slice(2, 8)}`;
    this.effects.push(ef);
    return ef.id;
  }

  removeEffect(effectId) {
    const i = this.effects.findIndex((e) => e.id === effectId);
    if (i >= 0) this.effects.splice(i, 1);
  }

  tickEffects() {
    // Called by world runner; decrease durations and remove expired
    const keep = [];
    for (const ef of this.effects) {
      if (typeof ef.durationTicks === "number") {
        ef.durationTicks -= 1;
        if (ef.durationTicks > 0) keep.push(ef);
      } else {
        keep.push(ef); // permanent until removed
      }
    }
    this.effects = keep;
  }

  // ---- Health / stamina ----
  applyDamage(amount) {
    const dmg = Math.max(0, Math.floor(Number(amount) || 0));
    this.state.health = Math.max(0, this.state.health - dmg);
    return dmg;
  }

  heal(amount) {
    const healed = Math.max(0, Math.floor(Number(amount) || 0));
    const derived = this.getDerivedStats();
    const before = this.state.health;
    this.state.health = Math.min(derived.healthMax, before + healed);
    return this.state.health - before; // actual healed
  }

  restoreStamina(amount) {
    const amt = Math.max(0, Math.floor(Number(amount) || 0));
    const derived = this.getDerivedStats();
    const before = this.state.stamina;
    this.state.stamina = Math.min(derived.staminaMax, before + amt);
    return this.state.stamina - before;
  }

  // ---- XP / leveling ----
  gainExperience(amount) {
    let xpGain = Math.max(0, Math.floor(Number(amount) || 0));
    let levelsGained = 0;
    this.baseStats.experience += xpGain;

    // Loop in case of big XP grants
    while (
      this.baseStats.experience >= this._levelThreshold(this.baseStats.level)
    ) {
      this.baseStats.experience -= this._levelThreshold(this.baseStats.level);
      this.baseStats.level += 1;
      levelsGained += 1;
      this._onLevelUp(); // apply growth
    }

    return {
      ok: true,
      xpGained: xpGain,
      newLevel: this.baseStats.level,
      levelsGained
    };
  }

  _levelThreshold(level) {
    // Simple: 100 * level (customize as needed)
    return 100 * Math.max(1, Math.floor(level));
  }

  _onLevelUp() {
    // Example growth; adjust to your design
    this.baseStats.attack += 2;
    this.baseStats.defence += 2;
    this.baseStats.strength += 2;
    this.baseStats.healthMax += 10;
    this.baseStats.staminaMax += 5;

    // Optionally top up on level-up
    const d = this.getDerivedStats();
    this.state.health = Math.min(d.healthMax, this.state.health + 10);
    this.state.stamina = Math.min(d.staminaMax, this.state.stamina + 5);
  }

  // ---- Kills ----
  addKill(value = 1) {
    this.killCount += Math.max(0, Number(value) || 0);
    return this.killCount;
  }

  getKills() {
    return this.killCount;
  }

  // ---- Inventory drop (e.g., on death) ----
  dropInventory(targetLocation) {
    if (!targetLocation || !targetLocation.addArtifact) return null;
    if (this.inventory.length === 0) return null;

    for (const artifact of this.inventory) {
      targetLocation.addArtifact(artifact);
    }
    const dropped = this.inventory.length;
    this.inventory = [];
    return { ok: true, dropped };
  }

  // ---- Minimal attack helper (prefer a Combat System; this is a fallback) ----
  // Respects derived stats; caller should check room.safeZone and target.flags.isAttackable
  attackTarget(target, { rng = Math.random } = {}) {
    if (!target) return { ok: false, message: "No target." };
    if (!this.isAlive()) return { ok: false, message: "You are down." };
    if (!target.flags?.isAttackable)
      return { ok: false, message: "Target cannot be attacked." };

    const me = this.getDerivedStats();
    const him = target.getDerivedStats?.() ?? { defence: 0 };

    // Simple variability; supply seeded rng from caller for tests
    const multiplier = 0.5 + rng() * 1.0; // 0.5 .. 1.5
    const raw = Math.round(me.attack * multiplier);
    const damage = Math.max(0, raw - Math.max(0, Math.floor(him.defence)));

    const dealt = target.applyDamage(damage);
    return {
      ok: true,
      damage: dealt,
      targetHp: target.state?.health ?? null
    };
  }

  // ---- Room integration helpers (optional) ----
  getDetails() {
    // Minimal snapshot for UI/state broadcasting
    const { base, state, derived, kills } = this.getStatsObj();
    return {
      name: this.name,
      classType: this.classType,
      stats: { base, state, derived, kills }
    };
  }
}

export default Character;
