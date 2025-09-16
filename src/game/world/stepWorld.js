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

// toggle if you want passive healing
const ENABLE_REGEN = false;

export function stepWorld(tick, rnd) {
  const changes = [];
  const now = Date.now();

  // (A) Reset tick counters
  const S =
    worldState.stats ||
    (worldState.stats = {
      lastLogAt: 0,
      logEveryMs: 10_000,
      emitEveryTicks: 10,
      emaAlpha: 0.2,
      ema: { npcSpawnsPerSec: 0, npcDeathsPerSec: 0, itemSpawnsPerSec: 0 },
      tickCounters: { npcSpawns: 0, npcDeaths: 0, itemSpawns: 0 },
      lastTickAt: 0
    });

  S.tickCounters.npcSpawns = 0;
  S.tickCounters.npcDeaths = 0;
  S.tickCounters.itemSpawns = 0;

  // 1) NPC wandering
  for (const npc of worldState.npcs.values()) {
    if (rnd() < 0.35) {
      const dir = pick(rnd, ["north", "south", "east", "west"]);
      const moved = tryMoveNpc(npc, dir);
      if (moved) {
        const from = moved.from,
          to = moved.to;
        const fromName = roomNameOf(from),
          toName = roomNameOf(to);
        const fromId = roomIdOf(from),
          toId = roomIdOf(to);
        changes.push({
          t: "npcMove",
          id: npc.id,
          fromId,
          toId,
          from: fromName,
          to: toName
        });
        changes.push({
          t: "roomNpcLeave",
          roomId: fromId,
          room: fromName,
          npcId: npc.id,
          npcName: npc.name || npc.kind || npc.id,
          dir
        });
        changes.push({
          t: "roomNpcEnter",
          roomId: toId,
          room: toName,
          npcId: npc.id,
          npcName: npc.name || npc.kind || npc.id,
          dir: oppositeDir(dir)
        });
      }
    }
  }

  // 2) Optional: NPC vs NPC culling to keep numbers dynamic
  npcVsNpcSkirmishes(rnd, changes);

  // 3) Bounded, randomized spawns (NPCs + artifacts)
  boundedSpawns(rnd, changes);

  // 4) Regen/decay (optional)
  if (ENABLE_REGEN) {
    for (const npc of worldState.npcs.values()) {
      const oldHp = npc.stats.health ?? 0;
      npc.stats.health = Math.min(
        (npc.stats.health ?? 0) + 1,
        npc.stats.healthMax ?? 100
      );
      if (npc.stats.health !== oldHp) {
        changes.push({ t: "npcHp", id: npc.id, hp: npc.stats.health });
      }
    }
  }

  // Count this tick's events
  for (const ch of changes) {
    if (ch.t === "spawn" && ch.kind === "creature") S.tickCounters.npcSpawns++;
    if (ch.t === "spawn" && ch.kind === "artifact") S.tickCounters.itemSpawns++;
    if (ch.t === "npcDeath") S.tickCounters.npcDeaths++;
  }

  const dtMs = num(now - num(S.lastTickAt, now - 1000), 1000); // default 1s
  const dtSec = Math.max(0.001, dtMs / 1000); // never 0

  const spawnsPerSec = num(S.tickCounters.npcSpawns) / dtSec;
  const deathsPerSec = num(S.tickCounters.npcDeaths) / dtSec;
  const itemPerSec = num(S.tickCounters.itemSpawns) / dtSec;

  const alpha = num(S.emaAlpha, 0.2);
  S.ema.npcSpawnsPerSec =
    alpha * spawnsPerSec + (1 - alpha) * num(S.ema.npcSpawnsPerSec, 0);
  S.ema.npcDeathsPerSec =
    alpha * deathsPerSec + (1 - alpha) * num(S.ema.npcDeathsPerSec, 0);
  S.ema.itemSpawnsPerSec =
    alpha * itemPerSec + (1 - alpha) * num(S.ema.itemSpawnsPerSec, 0);

  S.lastTickAt = now;

  // ---- Periodic console log
  if (now - S.lastLogAt >= S.logEveryMs) {
    const snap = collectWorldSnapshot();
    logStatsToConsole(snap, S.ema);
    S.lastLogAt = now;
  }

  return changes;
}

// -------------------- helpers & systems --------------------

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function pick(rnd, arr) {
  return arr[(arr.length * rnd()) | 0];
}

function nowMs() {
  return Date.now();
}
function roomNameOf(loc) {
  return loc?.name ?? "(unnamed)";
}
function roomIdOf(loc) {
  return loc?.id ?? null;
}
function oppositeDir(dir) {
  return (
    { north: "south", south: "north", east: "west", west: "east" }[dir] ?? dir
  );
}

function shuffledRooms(rnd) {
  const rooms = Array.from(worldState.locationsMap.values());
  for (let i = rooms.length - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    [rooms[i], rooms[j]] = [rooms[j], rooms[i]];
  }
  return rooms;
}

function countCreaturesWorld() {
  return worldState.npcs.size;
}
function countCreaturesRoom(loc) {
  return loc?.creatures?.length ?? 0;
}
function countArtifactsWorld() {
  let n = 0;
  for (const loc of worldState.locationsMap.values())
    n += loc?.artifacts?.length ?? 0;
  return n;
}
function countArtifactsRoom(loc) {
  return loc?.artifacts?.length ?? 0;
}

function canSpawnInRoom(categoryCfg, countInRoomFn, loc, t) {
  const rn = roomNameOf(loc);
  const last = categoryCfg.lastSpawnAtByRoom.get(rn) ?? 0;
  return (
    t - last >= categoryCfg.roomCooldownMs &&
    countInRoomFn(loc) < categoryCfg.maxPerRoom
  );
}
function markRoomSpawned(categoryCfg, loc, t) {
  categoryCfg.lastSpawnAtByRoom.set(roomNameOf(loc), t);
}

function jitter(rnd, minMs, maxMs) {
  const a = Math.min(minMs, maxMs),
    b = Math.max(minMs, maxMs);
  return Math.floor(a + (b - a) * rnd());
}

// schedule a killed NPC to come back later (slow + random)
export function scheduleNpcRespawn(roomName, rnd) {
  const cfg = worldState.spawn.npc;

  // cap the queue at, say, 2× the global NPC cap
  const MAX_Q = cfg.maxGlobal * 2;
  if (cfg.respawnQueue.length >= MAX_Q) {
    // drop the oldest job to make space
    cfg.respawnQueue.shift();
  }

  const delay = jitter(rnd, cfg.respawnMinMs, cfg.respawnMaxMs);
  cfg.respawnQueue.push({
    when: Date.now() + delay,
    roomName
  });
}

function popDueRespawns(queue, t, budget) {
  const out = [];
  let i = 0;
  while (i < queue.length && out.length < budget) {
    if (queue[i].when <= t) out.push(queue.splice(i, 1)[0]);
    else i++;
  }
  return out;
}

// --- bounded randomized spawns for NPCs and artifacts
function boundedSpawns(rnd, changes) {
  const t = nowMs();

  // ---- NPCs: process due respawns, then random room pass
  {
    const C = worldState.spawn.npc;
    let budget = C.spawnBudgetPerTick;

    if (countCreaturesWorld() < C.maxGlobal && budget > 0) {
      // a) due respawns
      const due = popDueRespawns(C.respawnQueue, t, budget);
      for (const job of due) {
        const loc =
          worldState.locationsMap.get(job.roomName) || findByName(job.roomName);
        if (!loc) continue;
        if (!canSpawnInRoom(C, countCreaturesRoom, loc, t)) continue;

        const c = spawnRandomCreatureAt(loc, rnd);
        if (c) {
          markRoomSpawned(C, loc, t);
          changes.push({
            t: "spawn",
            kind: "creature",
            id: c.id,
            roomId: roomIdOf(loc),
            at: roomNameOf(loc),
            npcName: c.name
          });
          budget--;
          if (budget <= 0 || countCreaturesWorld() >= C.maxGlobal) break;
        }
      }

      // b) randomized room pass (probabilistic gate → unpredictable)
      if (budget > 0 && countCreaturesWorld() < C.maxGlobal) {
        const rooms = shuffledRooms(rnd);
        for (const loc of rooms) {
          if (budget <= 0 || countCreaturesWorld() >= C.maxGlobal) break;
          if (!canSpawnInRoom(C, countCreaturesRoom, loc, t)) continue;

          if (rnd() < 0.5) {
            // randomness keeps it huntable
            const c = spawnRandomCreatureAt(loc, rnd);
            if (c) {
              markRoomSpawned(C, loc, t);
              changes.push({
                t: "spawn",
                kind: "creature",
                id: c.id,
                roomId: roomIdOf(loc),
                at: roomNameOf(loc),
                npcName: c.name
              });
              budget--;
            }
          }
        }
      }
    }
  }

  // ---- Artifacts: similar bounds, no respawn queue by default
  {
    const C = worldState.spawn.item;
    let budget = C.spawnBudgetPerTick;

    if (countArtifactsWorld() < C.maxGlobal && budget > 0) {
      const rooms = shuffledRooms(rnd);
      for (const loc of rooms) {
        if (budget <= 0) break;
        if (countArtifactsWorld() >= C.maxGlobal) break;

        const tNow = nowMs();
        if (!canSpawnInRoom(C, countArtifactsRoom, loc, tNow)) continue;

        if (rnd() < 0.35) {
          // keep it sporadic
          const a = spawnRandomArtifactAt(loc, rnd);
          if (a) {
            markRoomSpawned(C, loc, tNow);
            changes.push({
              t: "spawn",
              kind: "artifact",
              id: a.id,
              at: roomNameOf(loc),
              artifactName: a.name
            });
            budget--;
          }
        }
      }
    }
  }
}

// --- your skirmish system (unchanged except using helpers)
function npcVsNpcSkirmishes(rnd, changes) {
  const rooms = shuffledRooms(rnd);
  for (const loc of rooms) {
    const list = loc?.creatures;

    if (!Array.isArray(list) || list.length < 2) continue;

    if (rnd() < 0.25) {
      const i = (rnd() * list.length) | 0;
      let j = (rnd() * list.length) | 0;
      if (j === i) j = (j + 1) % list.length;

      const A = list[i],
        B = list[j];
      if (!A || !B) continue;

      const dmgA = 1 + ((rnd() * 4) | 0);
      const dmgB = 1 + ((rnd() * 4) | 0);

      A.stats.health = Math.max(0, (A.stats.health ?? 10) - dmgB);
      B.stats.health = Math.max(0, (B.stats.health ?? 10) - dmgA);

      changes.push({
        t: "npcSkirmish",
        aId: A.id,
        bId: B.id,
        aName: A.name,
        bName: B.name,
        roomId: roomIdOf(loc),
        room: roomNameOf(loc),
        dmgA,
        dmgB
      });

      if (A.stats.health <= 0) {
        removeNpc(A, loc);
        changes.push({
          t: "npcDeath",
          name: A.name,
          id: A.id,
          roomId: roomIdOf(loc),
          room: roomNameOf(loc)
        });

        // This should use ID - and respawn in random location!
        scheduleNpcRespawn(roomNameOf(loc), rnd);
      }
      if (B.stats.health <= 0) {
        removeNpc(B, loc);
        changes.push({
          t: "npcDeath",
          id: B.id,
          name: B.name,
          roomId: roomIdOf(loc),
          room: roomNameOf(loc)
        });
        // This should use ID - and respawn in random location!
        scheduleNpcRespawn(roomNameOf(loc), rnd);
      }
    }
  }
}

function removeNpc(npc, loc) {
  if (Array.isArray(loc?.creatures)) {
    const k = loc.creatures.indexOf(npc);
    if (k >= 0) loc.creatures.splice(k, 1);
  }
  worldState.npcs.delete(npc.id);
}

/** Spawn a creature instance at a location and register it in worldState.npcs */
function spawnRandomCreatureAt(location, rnd) {
  if (!creatureBlueprints.length) return null;
  const bp = pick(rnd, creatureBlueprints);
  const creature = createCreatureFromBlueprint(bp);
  creature.id = creature.id ?? nextId("cre");
  creature.location = location;

  if (typeof location.addCreature === "function") {
    location.addCreature(creature);
  } else {
    location.creatures = location.creatures || [];
    location.creatures.push(creature);
  }
  worldState.npcs.set(creature.id, creature);

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

/** Attempt to move an NPC; returns {from,to} if moved, else null */
function tryMoveNpc(npc, dir) {
  const here = npc.location;
  if (!here || !here.exits) return null;

  const neighborKey = here.exits[dir];
  if (!neighborKey) return null;

  const there =
    typeof neighborKey === "number"
      ? worldState.locationsMap.get(neighborKey)
      : typeof neighborKey === "string"
      ? worldState.locationsMap.get(neighborKey) || findByName(neighborKey)
      : neighborKey;

  if (!there) return null;

  if (here.creatures) {
    const idx = here.creatures.indexOf(npc);
    if (idx >= 0) here.creatures.splice(idx, 1);
  }

  if (typeof there.addCreature === "function") {
    there.addCreature(npc);
  } else {
    there.creatures = there.creatures || [];
    there.creatures.push(npc);
  }

  npc.location = there;
  return { from: here, to: there };
}

function findByName(name) {
  for (const loc of worldState.locationsMap.values()) {
    if (loc.name === name) return loc;
  }
  return null;
}

function collectWorldSnapshot() {
  // counts
  const npcCount = worldState.npcs.size;

  // artifacts: sum per room
  let artifactCount = 0;
  let minPerRoom = Infinity,
    maxPerRoom = 0,
    sumPerRoom = 0,
    rooms = 0;
  let topRooms = []; // [{name, n}]
  for (const loc of worldState.locationsMap.values()) {
    const n = loc?.creatures?.length ?? 0;
    const a = loc?.artifacts?.length ?? 0;
    artifactCount += a;
    rooms++;
    minPerRoom = Math.min(minPerRoom, n);
    maxPerRoom = Math.max(maxPerRoom, n);
    sumPerRoom += n;

    if (n > 0) topRooms.push({ name: loc.name ?? "(unnamed)", n });
  }
  const avgPerRoom = rooms ? sumPerRoom / rooms : 0;

  // sort top rooms by crowding
  topRooms.sort((a, b) => b.n - a.n);
  topRooms = topRooms.slice(0, 5);

  // caps
  const caps = {
    npcGlobal: worldState.spawn?.npc?.maxGlobal ?? null,
    npcPerRoom: worldState.spawn?.npc?.maxPerRoom ?? null,
    itemGlobal: worldState.spawn?.item?.maxGlobal ?? null,
    itemPerRoom: worldState.spawn?.item?.maxPerRoom ?? null
  };

  // queues / cooldown meta
  const respawnQueued = worldState.spawn?.npc?.respawnQueue?.length ?? 0;

  return {
    npcCount,
    artifactCount,
    caps,
    perRoom: {
      min: Number.isFinite(minPerRoom) ? minPerRoom : 0,
      avg: Number(avgPerRoom.toFixed(2)),
      max: maxPerRoom,
      topRooms
    },
    respawnQueued
  };
}

function logStatsToConsole(snap, ema) {
  console.log(
    `[WORLD] NPC ${snap.npcCount}/${snap.caps.npcGlobal}  ` +
      `Items ${snap.artifactCount}/${snap.caps.itemGlobal}  ` +
      `PerRoom min/avg/max ${snap.perRoom.min}/${snap.perRoom.avg}/${snap.perRoom.max}  ` +
      `RespawnQ ${snap.respawnQueued}  ` +
      `rates: spawn ${ema.npcSpawnsPerSec.toFixed(2)}/s, ` +
      `death ${ema.npcDeathsPerSec.toFixed(2)}/s, ` +
      `item ${ema.itemSpawnsPerSec.toFixed(2)}/s`
  );
}
