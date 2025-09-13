import movePlayer from "./go/movePlayer.js";
import lookAround from "./look/lookAround.js";
import attackCreature from "./attack/attackCreature.js";
import updateLocationAndPlayer from "../worldMap/updateLocationAndPlayer.js";
import equip from "./equip/equip.js";
import putArtifact from "./put/putArtifact.js";
import gameMessages from "../gameData/gameMessages.js";

const runCommand = (game, command) => {
  // 0) Normalize input (accept string or {text})
  const raw =
    typeof command === "string" ? command : (command && command.text) || "";
  const input = String(raw).trim();

  let location = {};

  function updateLocationWithLocationData() {
    const locData = game.getLocationData(
      game.player.currentLocation,
      game.player
    );
    location = updateLocationAndPlayer(location, locData);
  }

  // 1) If empty -> emit full snapshot with message and return
  if (!input) {
    const loc = game.getLocationData(game.player.currentLocation);
    loc.result = gameMessages.unknownCommand;
    return { message: loc.result, location: loc };
  }

  // 2) Parse
  const [verbRaw, ...args] = input.split(/\s+/);
  const action = (verbRaw || "").toLowerCase();
  const params = args.join(" ").trim();

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
      updateLocationWithLocationData();
    },
    examine: (p) => {
      const res = game.player.examine(String(p || "").toLowerCase());
      location.result = res?.message || "";
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

  return { message: location.result ?? "", location };
};

export default runCommand;
