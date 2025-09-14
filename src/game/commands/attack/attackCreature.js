import AppError from "../../../../base-template/src/utils/errors/AppError.js";
import calculateAttackDamage from "./calculateAttackDamage.js";
import retaliation from "./retaliation.js";
import flee from "./flee.js";
import { gameData } from "../../gameData/gameData.js";
import gameMessages from "../../gameData/gameMessages.js";

const attackCreature = (game, creatureName) => {
  try {
    let result = "";
    let player = {};

    if (!creatureName) {
      result = gameMessages.attackNothing;
      return { result, player };
    }

    const creaturesInLocation = game.player.currentLocation?.creatures || [];
    const target = creaturesInLocation.find(
      (m) => m.name.toLowerCase() === creatureName.toLowerCase()
    );

    if (!target) {
      result = gameMessages.noSuchCreatureFound;
      return { result, player };
    }

    // Validate numeric fields without truthy traps
    const playerAttack = Number(game.player.stats.attack);
    const targetDefence = Number(target.stats.defence);

    if (Number.isNaN(playerAttack) || Number.isNaN(targetDefence)) {
      throw new AppError(
        `Attack/defence invalid: playerAttack=${game.player.attack}, targetDefence=${target.defence}`,
        400
      );
    }

    const {
      odds: { critChance },
      critMultiplier
    } = gameData;
    if (typeof critChance !== "number" || typeof critMultiplier !== "number") {
      throw new AppError(
        `Crit config invalid: critChance=${critChance}, critMultiplier=${critMultiplier}`,
        400
      );
    }

    // Calculate damage
    const totalDamage = calculateAttackDamage(
      playerAttack,
      targetDefence,
      critChance,
      critMultiplier
    );

    if (!totalDamage || typeof totalDamage.attackDamage !== "number") {
      throw new AppError(`calculateAttackDamage returned invalid result`, 400);
    }

    result += totalDamage.message ?? "";
    result += `You attacked ${target.name} for ${totalDamage.attackDamage} damage. `;

    // Apply damage
    target.health = Math.max(
      0,
      Number(target.health ?? 0) - totalDamage.attackDamage
    );

    if (!target.isAlive?.() ? target.health <= 0 : !target.isAlive()) {
      // Target died
      result += `${target.name} has been defeated! `;

      // Remove creature from location
      const idx = creaturesInLocation.indexOf(target);
      if (idx >= 0) creaturesInLocation.splice(idx, 1);

      // Drop inventory
      result += gameMessages.inventoryDropped;
      if (target.hasInventoryItems?.()) {
        const creatureInventory = target.getInventory?.();
        target.dropInventory?.(game.player.currentLocation);
        result += creatureInventory || "";
      } else {
        result += gameMessages.emptyInventory;
      }

      // Rewards
      game.player.killCount = (game.player.killCount || 0) + 1;
      const xp = Number(target.killValue ?? 0);
      const leveledUp = game.player.gainExperience?.(xp);
      if (leveledUp && leveledUp.length > 0) {
        result += ` ${leveledUp}`;
      }
    } else {
      // Retaliation
      const retaliated = retaliation(game, target); // { message, damage }
      if (retaliated?.message) result += retaliated.message;

      if (
        !game.player.isAlive?.()
          ? game.player.health <= 0
          : !game.player.isAlive()
      ) {
        result += gameMessages.playerDefeated;
        game.player.dropInventory?.(game.player.currentLocation);
        // track kill for the target (your addKill returns ++)
        target.addKill?.();
        game.isGameOver = true;
      }
    }

    // Handle creatures fleeing
    const fleeMsg = flee(game, creaturesInLocation); // if this returns a string
    if (fleeMsg && fleeMsg.length > 0) {
      result += ` ${fleeMsg}`;
    }

    result = result.trim();

    // Optionally include fresh player stats for the UI
    if (typeof game.player.getStatsObj === "function") {
      player.stats = game.player.getStatsObj();
      player.inventory = game.player.showInventory?.();
    }

    return {
      result,
      player: {
        stats: game.player.getStatsObj(),
        inventory: game.player.showInventory()
      }
    };
  } catch (error) {
    throw new AppError(`Unable to attack: ${error}`, 400);
  }
};

export default attackCreature;
