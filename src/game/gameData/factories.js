// Blueprint → class instance helpers (reuse everywhere)

import Artifact from "../Artifacts/artifact.js";
import Weapon from "../Artifacts/weapon.js";
import Wearable from "../Artifacts/wearable.js";
import Edible from "../Artifacts/edible.js";
import Creature from "../Characters/creature.js";
import Location from "../Locations/location.js";
import createId from "../../utils/createId.js";

const num = (v, d = 0) => (v == null || v === "" ? d : Number(v));

export function createArtifactFromBlueprint(bp) {
  const mods = bp.mods || {};
  const eff = bp.effects || {};
  const common = { condition: num(bp.condition, 100) };

  let a;
  switch (bp.kind) {
    case "weapon":
      a = new Weapon(bp.name, bp.description, {
        ...common,
        attack: num(mods.attack, 0),
        defence: num(mods.defence, 0),
        strength: num(mods.strength, 0)
      });
      break;
    case "wearable":
      a = new Wearable(bp.name, bp.description, {
        ...common,
        defence: num(mods.defence, 0),
        attack: num(mods.attack, 0),
        strength: num(mods.strength, 0)
      });
      break;
    case "edible":
      a = new Edible(bp.name, bp.description, {
        health: num(eff.health, 0),
        stamina: num(eff.stamina, 0),
        attack: num(eff.attack, 0),
        defence: num(eff.defence, 0),
        strength: num(eff.strength, 0)
      });
      break;
    default:
      a = new Artifact(bp.name, bp.description, {
        ...common,
        stats: {
          attack: num(mods.attack, 0),
          defence: num(mods.defence, 0),
          strength: num(mods.strength, 0),
          health: num(eff.health, 0),
          stamina: num(eff.stamina, 0)
        }
      });
  }
  a.id = createId.make("art");
  return a;
}

/** Blueprint -> Creature instance (stats already handled by Creature/Character) */
export function createCreatureFromBlueprint(bp) {
  const s = bp.stats || {};

  const c = new Creature(
    bp.name,
    s.health ?? 0,
    s.stamina ?? 0,
    s.strength ?? 0,
    s.defence ?? 0,
    s.attack ?? 0,
    null, // currentLocation (set when placed)
    [], // inventory
    0, // experience (use bp.baseXP if you want a starting value)
    bp.level ?? 1,
    bp.class ?? ""
  );

  // helpful metadata
  c.blueprintId = bp.id;
  if (bp.baseXP != null) c.baseXP = bp.baseXP;

  // Assign an ID
  c.id = createId.make("npc");

  return c;
}

/**
 * Create a Location instance from a blueprint.
 * Order of precedence for ID:
 *  - explicit id in JSON
 *  - slug → deterministic hash
 *  - fallback random
 */
export function createLocationFromBlueprint(bp) {
  const id =
    bp.id ??
    (bp.slug ? createId.fromSlug("loc", bp.slug) : createId.make("loc"));

  const loc = new Location(
    id,
    String(bp.title ?? "Untitled Location"),
    String(bp.description ?? "Not set yet")
  );

  loc.slug = bp.slug ?? null;
  loc.tags = Array.isArray(bp.tags) ? [...bp.tags] : [];
  loc.exits = bp.exits ?? {}; // { n:"forest_edge", s:null, ... }

  return loc;
}
