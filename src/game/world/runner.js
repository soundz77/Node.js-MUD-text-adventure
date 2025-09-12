// game/world/runner.js
import { io } from "../../config/socketConfig.js";
import { mulberry32, hash32 } from "./rng.js";
import { stepWorld } from "./stepWorld.js";

// Hold world-global mutable state here (or a class)
export const worldState = {
  tickMs: 1000,
  tickIndex: 0,
  seed: 0xa17c32f1, // store in DB/config
  // references to locations/NPCs/players you already have:
  locationsMap: null, // populated by Game.setup()
  npcs: new Map(),
  lastBroadcasts: new Map() // for diffing
};

let intervalHandle = null;
let startTimeout = null;

/**
 * Start the continuous world loop (idempotent).
 * Aligns the first tick to the next tickMs boundary, like your original.
 */
export function startWorldLoop() {
  if (intervalHandle || startTimeout) return; // idempotent

  const now = Date.now();
  const offset = worldState.tickMs - (now % worldState.tickMs);

  startTimeout = setTimeout(() => {
    startTimeout = null;
    intervalHandle = setInterval(tickOnceSafe, worldState.tickMs);
    // optional: let other closers terminate the process without waiting on this timer
    intervalHandle.unref?.();
    tickOnceSafe(); // run immediately at first boundary
    console.log(
      `[world] loop started @ ${new Date().toISOString()} (tickMs=${
        worldState.tickMs
      })`
    );
  }, offset);

  startTimeout.unref?.();
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

  const changes = stepWorld(t, rnd) || []; // returns a compact list of diffs
  broadcastChanges(changes); // only if anyone connected
  maybePersist(t, changes); // small, idempotent writes
}

function deriveTickRng(tick) {
  const seed = worldState.seed ^ hash32(`tick:${tick}`);
  return mulberry32(seed);
}

function broadcastChanges(changes) {
  if (!changes?.length) return;
  // Guard if io isn’t ready yet (e.g., during startup/shutdown)
  if (!io || !io.to) return;
  io.to("world").emit("world:changes", { tick: worldState.tickIndex, changes });
}

function maybePersist(tick, changes) {
  // Persist minimal things you can’t recompute:
  //   - NPC positions, new spawns, deaths, dropped items, weather state
  // Batch writes; every 10 ticks is often enough.
  // Example (pseudo):
  // if (tick % 10 === 0 && changes.length) persistChanges(tick, changes).catch(console.error);
}
