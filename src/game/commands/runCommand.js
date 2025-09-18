// commands/runCommand.js
import movePlayer from "./go/movePlayer.js";
import lookAround from "./look/lookAround.js";
import attackCreature from "./attack/attackCreature.js";
import updateLocationAndPlayer from "../worldMap/updateLocationAndPlayer.js";
import equip from "./equip/equip.js";
import dropArtifact from "./put/putArtifact.js";
import gameMessages from "../gameData/gameMessages.js";

/*
location.result = result of an action by current player
location.message = auto updates, NPCs, other players etc
*/

const runCommand = (game, command) => {
  const raw =
    typeof command === "string" ? command : (command && command.text) || "";
  const input = String(raw).trim();

  let location = {};

  function refreshLocationFromCurrent() {
    const locDetails = game.player.currentLocation.getDetails();
    location = updateLocationAndPlayer(location, locDetails);
  }

  if (!input) {
    const locDetails = game.player.currentLocation.getDetails();
    const loc = updateLocationAndPlayer({}, locDetails);
    return {
      message: gameMessages.unknownCommand,
      location: loc
    };
  }

  const [verbRaw, ...args] = input.split(/\s+/);
  const action = (verbRaw || "").toLowerCase();
  const params = args.join(" ").trim();

  const commands = {
    eat: (p) => {
      const item = (p || "").trim();
      location.result = game.player.consumeItem(item);
      refreshLocationFromCurrent();
    },
    equip: (p) => {
      const item = (p || "").trim();
      location.result = equip(game, item);
      refreshLocationFromCurrent();
    },
    use: (p) => {
      const item = (p || "").trim();
      location.result = game.player.useItem(item);
      refreshLocationFromCurrent();
    },
    go: (p) => {
      location.result = movePlayer(game, (p || "").toLowerCase());
      refreshLocationFromCurrent();
    },
    look: () => {
      location.result = lookAround(game);
      refreshLocationFromCurrent();
    },
    attack: (p) => {
      const res = attackCreature(game, p);
      location.result = res?.result || "attackResult.message missing";
      refreshLocationFromCurrent();
    },
    health: () => {
      location.result = game.player.getStats();
      refreshLocationFromCurrent();
    },
    take: (p) => {
      location.result = game.player.takeArtifact(p);
      refreshLocationFromCurrent();
    },
    drop: (p) => {
      const name = (p || "").trim();
      location.result = putArtifact(game.player, name);
      refreshLocationFromCurrent();
    },
    inventory: () => {
      refreshLocationFromCurrent();
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
      refreshLocationFromCurrent();
    },

    // aliases...
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

  try {
    if (commands[action]) {
      commands[action](params);
    } else {
      location.result = gameMessages.unknownCommand;
      refreshLocationFromCurrent();
    }
  } catch (error) {
    location.result = `Error executing command "${action}": ${error.message}`;
    refreshLocationFromCurrent();
  }

  return {
    message: location.result ?? "",
    location // <- already normalized
  };
};

export default runCommand;
