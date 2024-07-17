import AppError from "../../../../base-template/src/utils/errors/AppError.js";
import calculateAttackDamage from "./calculateAttackDamage.js";
import retaliation from "./retaliation.js";
import flee from "./flee.js";
import gameData from "../../gameData/game1.js";
import gameMessages from "../../gameData/gameMessages.js";

const attackCreature = (game, creatureName) => {
  try {
    let message = "";
    let player = {};

    if (!creatureName) {
      message = gameMessages.attackNothing;
      return { message, player };
    }

    const creaturesInLocation = game.player.currentLocation.creatures;
    const target = creaturesInLocation.find(
      (monster) => monster.name.toLowerCase() === creatureName.toLowerCase()
    );

    if (!target) {
      message = gameMessages.noSuchCreatureFound;
      return { message, player };
    }

    // Check if target.health is initialized
    if (target?.health === undefined) {
      throw new AppError(`Creature health is undefined or not initialized`);
    }

    // Player attacks the creature
    const playerAttack = game.player.attack;
    const targetDefence = target.defence;
    const { critChance, critMultiplier } = gameData; // import attack config

    if (!playerAttack || !targetDefence || !critChance || !critMultiplier) {
      throw new AppError(
        `playerAttack, targetDefence, critChance or critMultiplier is undefined or not initialized ${playerAttack}, ${targetDefence}, ${critChance} ${critMultiplier}`,
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

    if (!totalDamage) {
      throw new AppError(`totalDamage not return ${totalDamage}`, 400);
    }
    message += totalDamage.message;
    message += `You attacked ${creatureName} for ${totalDamage.attackDamage} damage. `;

    // Reduce target health
    target.health -= totalDamage.attackDamage;

    // target has been killed
    if (!target.isAlive()) {
      message += `${target.name} has been defeated! `;
      creaturesInLocation.splice(creaturesInLocation.indexOf(target), 1); // remove creature from current location

      message += gameMessages.inventoryDropped;

      // drop target inventory
      if (target.hasInventoryItems()) {
        const creatureInventory = target.getInventory();
        target.dropInventory(game.player.currentLocation); // drop inventory into current location
        message += creatureInventory;
      } else {
        message += gameMessages.emptyInventory;
      }

      // Increment kill count and gain XP
      game.player.killCount++;
      const xp = target.killValue;
      const leveledUp = game.player.gainExperience(xp);
      if (leveledUp?.length > 0) {
        message += leveledUp;
      }
      // target is still alive
    } else {
      // Chance for the creature to retaliate
      const retaliated = retaliation(game, target); // { message: String, damage: Number }
      message += retaliated.message;

      // Check if the player survived the retaliation
      if (!game.player.isAlive()) {
        message += gameMessages.playerDefeated;
        game.player.dropInventory(game.player.currentLocation); // drop inventory into current location

        // add kill
        target.addKill(1);
        game.isGameOver = true; // End the game - not implemented!!!!
      }
    }

    // Handle creatures fleeing
    const creaturesFled = flee(game, creaturesInLocation); // rtn {message}
    if (creaturesFled.length > 0) {
      message += creaturesFled;
    }
    message = message.trim();

    return { message, player };
  } catch (error) {
    throw new AppError(`Unable to attack: ${error}`, 400);
  }
};

export default attackCreature;
