import AppError from "../../base-template/src/utils/errors/AppError.js";
import Player from "./Characters/player.js";
import generateLocations from "./worldMap/generateLocations.js";
import connectLocationsDFS from "./worldMap/connectLocationsDFS.js";
import populateLocations from "./worldMap/populateLocations.js";
import getLocation from "./worldMap/getLocation.js";
import processCommand from "./commands/processCommand.js";
import { io } from "../config/socketConfig.js";
import { gameData, locationDescriptions } from "./gameData/gameData.js";
import { worldState } from "../game/world/runner.js";

class Game {
  constructor() {
    this.locations = new Map();
    this.player = new Player("");
    this.isGameOver = false;
  }

  setup() {
    try {
      const { counts, odds, startLocationName } = gameData;

      // 1) Generate locations (pass descriptions)
      const locs = generateLocations(counts.locations, locationDescriptions);
      locs.forEach((loc) => this.locations.set(loc.name, loc));

      // 2) Connect locations
      const connectedLocations = connectLocationsDFS(locs);

      // 3) Populate with creatures & artifacts
      // Signature we established earlier:
      // populateLocations(locationsIn, numCreatures, numArtifacts,
      //                   pCreatureInLocation, pCreatureHasArtifact = 0, pArtifactInLocation = 1)
      populateLocations(
        connectedLocations,
        counts.creatures,
        counts.artifacts,
        odds.creatureInLocation,
        odds.creatureHasArtifact,
        odds.artifactInLocation // ← optional;
      );

      // 4) Start location
      const startingLocation = getLocation(this.locations, startLocationName);
      if (!startingLocation) {
        throw new AppError(
          `Starting location "${startLocationName}" is undefined.`,
          400
        );
      }

      // 5) Place player
      this.player.moveTo(startingLocation);

      // 6) Set up the world loop

      worldState.locationsMap = this.locations; // <— give the runner your world
      // worldState.tickMs = 1000;
      // worldState.seed  = 0xA17C32F1;

      console.log(
        `Created world map. Locations=${counts.locations}, ` +
          `Creatures=${counts.creatures}, Artifacts=${counts.artifacts}. ` +
          `Odds: creatureInLocation=${odds.creatureInLocation}, ` +
          `creatureHasArtifact=${odds.creatureHasArtifact}, ` +
          `artifactInLocation=${odds.artifactInLocation}. ` +
          `Start=${startLocationName}`
      );
    } catch (error) {
      console.error("Error during setup:", error);
      throw new AppError(`Failed to set up the game. ${error}`, 400);
    }
  }

  start() {
    try {
      this.setup();
      this.getLocationData(this.player.currentLocation);
    } catch (error) {
      console.error("Error starting the game:", error);
      throw new AppError(`Failed to start the game. ${error}`, 400);
    }
  }
  getLocationData(location) {
    try {
      if (!location) throw new AppError("location is undefined.", 400);

      const d = location.getDetails?.() || {
        description: location.description,
        exits: location.exits,
        changes: location.changes || ""
      };

      // creatures/artifacts as strings (matches your current payload)
      const creaturesStr =
        location.showCreatures?.() ??
        (location.creatures || []).map((c) => c.name).join(", ");
      const artifactsStr =
        location.showArtifacts?.() ??
        (location.artifacts || []).map((a) => a.name).join(", ");
      const players = location.showPlayers?.() || ["Just you"];

      return {
        description: d.description,
        exits: Array.isArray(d.exits) ? d.exits.join(", ") : d.exits,
        creatures: creaturesStr,
        artifacts: artifactsStr,
        players,
        result: ""
      };
    } catch (error) {
      throw new AppError(`Failed to get location data. ${error}`, 400);
    }
  }

  processCommand(command) {
    try {
      processCommand(this, command);
    } catch (error) {
      console.error("Error processing command:", error);
      throw new AppError(`Failed to process command. ${error}`, 400);
    }
  }

  // Always emit a consistent payload: stats object + inventory string

  emitCallback(location) {
    try {
      const p = this.player; // authoritative instance
      const payload = {
        location,
        player: {
          stats: p.getStatsObj(), // guaranteed function
          classType: p.classType || p.playerClass || "Missing player class",
          inventory: p.showInventory?.() ?? p.inventory,
          changes: location.changes || "No changes"
        }
      };
      // dev log
      console.log("[emit update]", JSON.stringify(payload, null, 2));
      io.emit("update", payload);
    } catch (error) {
      throw new AppError(`Failed to emit callback. ${error}`, 400);
    }
  }
}

export default Game;
