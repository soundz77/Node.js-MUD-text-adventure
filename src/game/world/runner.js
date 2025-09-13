// game/world/runner.js
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
  broadcastChanges(changes);
  maybePersist(t, changes);
}

function deriveTickRng(tick) {
  const seed = worldState.seed ^ hash32(`tick:${tick}`);
  return mulberry32(seed);
}

function broadcastChanges(changes) {
  if (!changes?.length) return;
  // publish is injected by Game; no rooms here, socket layer decides how to route
  publish?.("world:changes", { tick: worldState.tickIndex, changes });
}

function maybePersist(_tick, _changes) {
  // TODO: persist minimal state every N ticks if needed
  // e.g., if (_tick % 10 === 0 && _changes.length) await persistChanges(...)
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
