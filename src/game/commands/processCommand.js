import movePlayer from "./go/movePlayer.js";
import lookAround from "./look/lookAround.js";
import attackCreature from "./attack/attackCreature.js";
import updateLocationAndPlayer from "../worldMap/updateLocationAndPlayer.js";
import equip from "./equip/equip.js";
import putArtifact from "./put/putArtifact.js";
import gameMessages from "../gameData/gameMessages.js";

const processCommand = (game, command) => {
  // 0) Normalize input (accept string or {text})
  const raw =
    typeof command === "string" ? command : (command && command.text) || "";
  const input = String(raw).trim();

  // 1) If empty -> emit full snapshot with message and return
  if (!input) {
    const loc = game.getLocationData(game.player.currentLocation, game.player);
    loc.result = gameMessages.unknownCommand;
    game.emitCallback(loc); // emit from canonical player
    return;
  }

  // 2) Parse
  const [verbRaw, ...args] = input.split(/\s+/);
  const action = (verbRaw || "").toLowerCase();
  const params = args.join(" ").trim();

  // 3) Local state buckets (DECLARE BEFORE ANY USE!)
  let location = {}; // ← declare early to avoid TDZ

  // Helper uses the outer `location` (safe now)
  function updateLocationWithLocationData() {
    const locData = game.getLocationData(
      game.player.currentLocation,
      game.player
    );
    location = updateLocationAndPlayer(location, locData);
  }

  const commands = {
    eat: (p) => {
      const item = (p || "").trim();
      location.result = game.player.consumeItem(item);
      updateLocationWithLocationData();
    },
    equip: (p) => {
      const item = (p || "").trim();
      location.result = equip(game, item);
      updateLocationWithLocationData();
    },
    use: (p) => {
      const item = (p || "").trim();
      location.result = game.player.useItem(item);
      updateLocationWithLocationData();
    },
    go: (p) => {
      location.result = movePlayer(game, (p || "").toLowerCase());
      updateLocationWithLocationData();
    },
    look: () => {
      location.result = lookAround(game);
      updateLocationWithLocationData();
    },
    attack: (p) => {
      const res = attackCreature(game, p);
      location.result = res?.message || "attackResult.message missing";
      updateLocationWithLocationData();
    },
    health: () => {
      // human-readable stats line into message area; UI bars update via snapshot
      location.result = game.player.getStats?.() || "";
      updateLocationWithLocationData();
    },
    take: (p) => {
      location.result = game.player.takeArtifact(p);
      updateLocationWithLocationData();
    },
    drop: (p) => {
      const name = (p || "").trim();
      location.result = putArtifact(game.player, name);
      updateLocationWithLocationData();
    },
    inventory: () => {
      // just refresh snapshot; UI shows inventory from emitCallback payload
      updateLocationWithLocationData();
    },
    examine: (p) => {
      const res = game.player.examine(String(p || "").toLowerCase());
      location.result = res?.message || "";
      // optionally attach structured payload
      if (res && typeof res === "object") {
        location.inspect = {
          kind: res.kind,
          name: res.name,
          stats: res.stats,
          description: res.description,
          equipped: res.equipped,
          condition: res.condition
        };
      }
      updateLocationWithLocationData();
    },

    // aliases
    n: () => commands.go("north"),
    s: () => commands.go("south"),
    e: () => commands.go("east"),
    w: () => commands.go("west"),
    u: () => commands.go("up"),
    d: () => commands.go("down"),
    i: () => commands.inventory(),
    l: () => commands.look(),
    h: () => commands.health(),
    x: (p) => commands.examine(p),
    t: (p) => commands.take(p),
    p: (p) => commands.drop(p),
    a: (p) => commands.attack(p),
    q: (p) => commands.equip(p)
  };

  const handler = commands[action];

  try {
    if (handler) {
      handler(params);
    } else {
      location.result = gameMessages.unknownCommand;
      updateLocationWithLocationData();
    }
  } catch (error) {
    location.result = `Error executing command "${action}": ${error.message}`;
    updateLocationWithLocationData();
  }

  // Emit from authoritative state (no draft player objects)
  game.emitCallback(location);
};

export default processCommand;
