// world/stepWorld.js
import { worldState } from "./runner.js";
import {
  gameData,
  creatureBlueprints,
  artifactBlueprints
} from "../gameData/gameData.js";
import {
  createCreatureFromBlueprint,
  createArtifactFromBlueprint
} from "../gameData/factories.js";

// --- simple ID generator (per-process). Replace with a DB/UUID if you prefer.
let _id = 1;
const nextId = (prefix) => `${prefix}-${_id++}`;

export function stepWorld(tick, rnd) {
  const changes = [];

  // 1) NPC wandering
  for (const npc of worldState.npcs.values()) {
    if (rnd() < 0.35) {
      const dir = pick(rnd, ["north", "south", "east", "west"]);
      const moved = tryMoveNpc(npc, dir);
      if (moved) {
        changes.push({ t: "npcMove", id: npc.id, to: npc.location.name });
      }
    }
  }

  // 2) Periodic spawns (light rates each tick; tune the multipliers)
  for (const loc of worldState.locationsMap.values()) {
    if (rnd() < gameData.odds.creatureInLocation * 0.05) {
      const c = spawnRandomCreatureAt(loc, rnd);
      if (c)
        changes.push({ t: "spawn", kind: "creature", id: c.id, at: loc.name });
    }
    if (rnd() < gameData.odds.artifactInLocation * 0.03) {
      const a = spawnRandomArtifactAt(loc, rnd);
      if (a)
        changes.push({ t: "spawn", kind: "artifact", id: a.id, at: loc.name });
    }
  }

  // 3) Regen/decay
  for (const npc of worldState.npcs.values()) {
    const oldHp = npc.stats.health;
    npc.stats.health = Math.min(
      npc.stats.health + 1,
      npc.stats.healthMax ?? 100
    );
    if (npc.stats.health !== oldHp) {
      changes.push({ t: "npcHp", id: npc.id, hp: npc.stats.health });
    }
  }

  return changes;
}

// --- helpers -------------------------------------------------------------

function pick(rnd, arr) {
  return arr[(arr.length * rnd()) | 0];
}

/** Spawn a creature instance at a location and register it in worldState.npcs */
function spawnRandomCreatureAt(location, rnd) {
  if (!creatureBlueprints.length) return null;
  const bp = pick(rnd, creatureBlueprints);
  const creature = createCreatureFromBlueprint(bp);
  // ensure unique ID + placement
  creature.id = creature.id ?? nextId("cre");
  creature.location = location;
  if (typeof location.addCreature === "function") {
    location.addCreature(creature);
  } else {
    location.creatures = location.creatures || [];
    location.creatures.push(creature);
  }
  worldState.npcs.set(creature.id, creature);

  // Optional: give an inventory item with some probability
  if (rnd() < gameData.odds.creatureHasArtifact) {
    const aBp = pick(rnd, artifactBlueprints);
    const art = createArtifactFromBlueprint(aBp);
    art.id = art.id ?? nextId("art");
    if (typeof creature.addArtifact === "function") creature.addArtifact(art);
    else {
      creature.inventory = creature.inventory || [];
      creature.inventory.push(art);
    }
  }
  return creature;
}

/** Place an artifact instance into a location */
function spawnRandomArtifactAt(location, rnd) {
  if (!artifactBlueprints.length) return null;
  const bp = pick(rnd, artifactBlueprints);
  const artifact = createArtifactFromBlueprint(bp);
  artifact.id = artifact.id ?? nextId("art");
  if (typeof location.addArtifact === "function") {
    location.addArtifact(artifact);
  } else {
    location.artifacts = location.artifacts || [];
    location.artifacts.push(artifact);
  }
  return artifact;
}

/** Attempt to move an NPC in a direction, updating location lists; returns true if moved */
function tryMoveNpc(npc, dir) {
  const here = npc.location;
  if (!here || !here.exits) return false;

  // exits can be strings (neighbor name/id) or references
  const neighborKey = here.exits[dir];
  if (!neighborKey) return false;

  const there =
    typeof neighborKey === "string"
      ? worldState.locationsMap.get(neighborKey) || findByName(neighborKey)
      : neighborKey;

  if (!there) return false;

  // Remove from current location
  if (here.creatures) {
    const idx = here.creatures.indexOf(npc);
    if (idx >= 0) here.creatures.splice(idx, 1);
  }

  // Add to new location
  if (typeof there.addCreature === "function") {
    there.addCreature(npc);
  } else {
    there.creatures = there.creatures || [];
    there.creatures.push(npc);
  }

  npc.location = there;
  return true;
}

function findByName(name) {
  // fallback if locationsMap is keyed differently
  for (const loc of worldState.locationsMap.values()) {
    if (loc.name === name) return loc;
  }
  return null;
}
