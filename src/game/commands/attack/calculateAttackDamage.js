import AppError from ".././../../../base-template/src/utils/errors/AppError.js";
import gameMessages from "../../gameData/gameMessages.js";

const calculateAttackDamage = (
  playerAttack,
  targetDefence,
  critChance = 0.1, // MISSING: config
  critMultiplier = 2 // MISSING: config
) => {
  try {
    // Check whether required parameters have been provided
    if (!playerAttack || !targetDefence || !critChance || !critMultiplier) {
      throw new AppError(
        "Required parameters not provided to calculateAttackDamage",
        400
      );
    }

    // Ensure all parameters are numbers
    const notANum = [
      playerAttack,
      targetDefence,
      critChance,
      critMultiplier,
    ].filter((param) => typeof param !== "number");

    if (notANum.length > 0) {
      throw new AppError(
        `Incorrect datatype provided as a parameter to calculateAttackDamage.`,
        400
      );
    }

    let message = "";

    // Generate a random multiplier between 0.8 and 1.2
    const randomMultiplier = Math.random() * 0.4 + 0.8;

    // Check for a critical hit
    const isCriticalHit = Math.random() < critChance;

    // Calculate the initial damage
    let damage = playerAttack * randomMultiplier;

    // Apply critical hit multiplier if applicable
    if (isCriticalHit) {
      damage *= critMultiplier;
      message += gameMessages.criticalHit;
    }

    // Calculate the final attack damage
    const attackDamage = Math.max(0, Math.round(damage - targetDefence));
    return { message, attackDamage };
  } catch (error) {
    throw new AppError(`Unable to calculate attack damage ${error}`, 400);
  }
};

export default calculateAttackDamage;
