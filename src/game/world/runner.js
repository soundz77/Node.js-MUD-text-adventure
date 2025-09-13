// game/world/runner.js
import { mulberry32, hash32 } from "./rng.js";
import { stepWorld } from "./stepWorld.js";

// Hold world-global mutable state here (or a class)
export const worldState = {
  tickMs: 3000,
  tickIndex: 0,
  seed: 0xa17c32f1, // store in DB/config

  // references to locations/NPCs/players you already have:
  locationsMap: null, // populated by Game.setup()
  npcs: new Map(),
  lastBroadcasts: new Map(), // for diffing

  // ---- SPAWN CONFIG (caps, budgets, cooldowns)
  spawn: {
    npc: {
      maxGlobal: 10, // hard global ceiling
      maxPerRoom: 5, // hard per-room ceiling
      spawnBudgetPerTick: 4, // never spawn more than this per tick
      roomCooldownMs: 12_000, // per-room spawn cooldown
      respawnMinMs: 20_000, // killed creatures reappear no earlier than this
      respawnMaxMs: 60_000, // ...and no later than this
      lastSpawnAtByRoom: new Map(), // roomName -> timestamp
      respawnQueue: [] // [{when, roomName}]
    },
    item: {
      maxGlobal: 200,
      maxPerRoom: 4,
      spawnBudgetPerTick: 3,
      roomCooldownMs: 20_000,
      lastSpawnAtByRoom: new Map()
    }
  },

  // ---- STATS (top-level; used by stepWorld)
  stats: {
    lastLogAt: 0,
    logEveryMs: 10_000, // print to console every 10s
    emitEveryTicks: 10, // also emit into changes every N ticks

    // rolling rates (EMA) per second
    emaAlpha: 0.2,
    ema: {
      npcSpawnsPerSec: 0,
      npcDeathsPerSec: 0,
      itemSpawnsPerSec: 0
    },

    // counters for this tick window
    tickCounters: {
      npcSpawns: 0,
      npcDeaths: 0,
      itemSpawns: 0
    },

    // last tick timestamp
    lastTickAt: 0
  }
};

let intervalHandle = null;
let startTimeout = null;

// transport-agnostic publisher (set by Game)
let publish = null;

/** Let the Game (or anyone) provide a network-agnostic publisher */
export function setWorldPublisher(fn) {
  publish = typeof fn === "function" ? fn : null;
}

/** Start the continuous world loop (idempotent). */
export function startWorldLoop() {
  if (intervalHandle || startTimeout) return;

  const now = Date.now();
  const offset = worldState.tickMs - (now % worldState.tickMs);

  startTimeout = setTimeout(() => {
    startTimeout = null;
    intervalHandle = setInterval(tickOnceSafe, worldState.tickMs);
    intervalHandle?.unref?.();
    tickOnceSafe();
    console.log(
      `World loop started @ ${new Date().toISOString()} (tickMs=${
        worldState.tickMs
      })`
    );
  }, offset);

  startTimeout?.unref?.();
}

/** Stop the world loop (graceful shutdown). */
export function stopWorldLoop() {
  if (startTimeout) {
    clearTimeout(startTimeout);
    startTimeout = null;
  }
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  console.log("[world] loop stopped");
}

function tickOnceSafe() {
  try {
    tickOnce();
  } catch (err) {
    console.error("[world] tick error:", err);
    // keep running; a single bad tick shouldn't kill the loop
  }
}

function tickOnce() {
  const t = ++worldState.tickIndex;
  const rnd = deriveTickRng(t);

  const changes = stepWorld(t, rnd) || []; // compact list of diffs
  // console.log(changes);
  // broadcastChanges(changes); // <- enable if clients are to get updates
}

function deriveTickRng(tick) {
  const seed = worldState.seed ^ hash32(`tick:${tick}`);
  return mulberry32(seed);
}

function broadcastChanges(changes) {
  if (!changes?.length) return;
  publish?.("world:changes", { tick: worldState.tickIndex, changes });
}

/** Optional: change tick interval on the fly (restarts loop) */
export function setTickMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return;
  worldState.tickMs = n;
  if (intervalHandle || startTimeout) {
    stopWorldLoop();
    startWorldLoop();
  }
}
