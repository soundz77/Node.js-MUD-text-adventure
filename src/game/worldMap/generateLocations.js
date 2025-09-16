import AppError from "../../../base-template/src/utils/errors/AppError.js";
import { createLocationFromBlueprint } from "../gameData/factories.js";
/**
 * Generate multiple locations from a pool of titles/descriptions
 * (optional: round-robin assignment instead of random)
 */
export function generateLocations(
  count,
  titles = [],
  fallbackDesc = "Not set yet"
) {
  try {
    if (!Array.isArray(titles) || titles.length === 0) {
      throw new Error("Wrong type: expected a non-empty array");
    }

    const blueprints = Array.from({ length: count }, (_, i) => {
      const title = titles[i % titles.length]; // deterministic
      return {
        title,
        description: fallbackDesc
      };
    });

    return blueprints.map(createLocationFromBlueprint);
  } catch (error) {
    throw new AppError(`Error generating locations. ${error}`, 400);
  }
}

export default generateLocations;
