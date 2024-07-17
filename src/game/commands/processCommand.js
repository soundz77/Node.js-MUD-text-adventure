import movePlayer from "./go/movePlayer.js";
import lookAround from "./look/lookAround.js";
import attackCreature from "./attack/attackCreature.js";
import updateLocationAndPlayer from "../worldMap/updateLocationAndPlayer.js";
import equip from "./equip/equip.js";
import putArtifact from "./put/putArtifact.js";
import gameMessages from "../gameData/gameMessages.js";

const processCommand = (game, command) => {
  if (!command) return "";

  let player = {
    stats: game.player.showPlayerStats(),
  };
  let location = {};

  const commands = {
    eat: (params) => {
      const itemName = params.trim();
      location.result = game.player.consumeItem(itemName);
      player = {
        ...player,
        stats: game.player.showPlayerStats(),
        inventory: game.player.showInventory(),
      };
    },
    equip: (params) => {
      const itemName = params.trim(); // Ensure params is a string and trimmed
      location.result = equip(game, itemName);
      player = {
        ...player,
        stats: game.player.showPlayerStats(),
        inventory: game.player.showInventory(),
      };
    },
    use: (params) => {
      const itemName = params.trim(); // Ensure params is a string and trimmed
      location.result = game.player.useItem(itemName);
      player = {
        ...player,
        stats: game.player.showPlayerStats(),
        inventory: game.player.showInventory(),
      };
    },
    go: (params) => {
      location.result = movePlayer(game, params.toLowerCase());
      updateLocationWithLocationData();
    },
    look: () => {
      location.result = lookAround(game);
      updateLocationWithLocationData();
    },

    attack: (params) => {
      const attackResult = attackCreature(game, params); // rtns  { message, player }
      updateLocationWithLocationData();
      location.result = attackResult.message || "attackResult.message missing";
      // update player stats
      if (attackResult.player?.stats?.health) {
        player.stats.health = attackResult.player.stats.health;
      }
    },

    health: () => {
      location.result = game.player.getStats();
      updateLocationWithLocationData();
    },
    take: (params) => {
      location.result = game.player.takeArtifact(params);
      updateLocationWithLocationData();
      player.inventory = game.player.showInventory();
    },
    drop: (params) => {
      const artifactName = params.trim(); // Ensure params is a string and trimmed
      location.result = putArtifact(game.player, artifactName);
      updateLocationWithLocationData();
      player.inventory = game.player.showInventory();
    },
    inventory: () => {
      player.inventory = game.player.showInventory();
    },
    examine: (params) => {
      location.result = game.player.examine(params.toLowerCase());
    },
    // Movements
    n: () => commands.go("north"),
    s: () => commands.go("south"),
    e: () => commands.go("east"),
    w: () => commands.go("west"),
    u: () => commands.go("up"),
    d: () => commands.go("down"),
    // Play-based commands
    i: () => commands.inventory(),
    l: () => commands.look(),
    h: () => commands.health(),
    x: (params) => commands.examine(params),
    t: (params) => commands.take(params),
    p: (params) => commands.put(params),
    a: (params) => commands.attack(params),
    q: (params) => commands.equip(params),
  };

  const [action, ...paramsArray] = command.split(" ");
  const params = paramsArray.join(" "); // Join params array into a single string
  const commandFunction = commands[action];

  if (commandFunction) {
    try {
      commandFunction(params);
    } catch (error) {
      location.result = `Error executing command "${action}": ${error.message}`;
    }
  } else {
    location.result = gameMessages.unknownCommand;
    updateLocationWithLocationData();
  }
  game.emitCallback(location, player);

  function updateLocationWithLocationData() {
    const LocationData = game.getLocationData(game.player.currentLocation);
    location = updateLocationAndPlayer(location, LocationData);
  }
};

export default processCommand;
