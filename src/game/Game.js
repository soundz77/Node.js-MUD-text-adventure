import AppError from "../../base-template/src/utils/errors/AppError.js";
import Player from "./Characters/player.js";
import generateLocations from "./worldMap/generateLocations.js";
import connectLocationsDFS from "./worldMap/connectLocationsDFS.js";
import populateLocations from "./worldMap/populateLocations.js";
import getLocation from "./worldMap/getLocation.js";
import { gameData, locationDescriptions } from "./gameData/gameData.js";
import {
  worldState,
  startWorldLoop,
  setWorldPublisher
} from "../game/world/runner.js";
import runCommand from "./commands/runCommand.js";

class Game {
  constructor() {
    this.locations = new Map();
    this.player = new Player("");
    this.isGameOver = false;

    this._publish = null;
    this._queued = null;
    this.broadcast = this.broadcast.bind(this);
  }
  broadcast(event, payload) {
    // ensure the queue exists
    if (!Array.isArray(this._queued)) this._queued = [];

    if (this._publish) {
      try {
        this._publish(event, payload);
        return;
      } catch (e) {
        // fall back to queue if publisher throws
        this._queued.push([event, payload]);
        return;
      }
    }
    this._queued.push([event, payload]);
  }

  setPublisher(fn) {
    this._publish = fn;
    const q = Array.isArray(this._queued) ? this._queued : [];
    this._queued = [];
    for (const [ev, pl] of q) {
      try {
        fn(ev, pl);
      } catch {
        /* swallow */
      }
    }
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

      populateLocations(
        connectedLocations,
        counts.creatures,
        counts.artifacts,
        odds.creatureInLocation,
        odds.creatureHasArtifact,
        odds.artifactInLocation
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

      worldState.locationsMap = this.locations;

      console.log(
        `Created world map. Locations: ${counts.locations}, ` +
          `Creatures: ${counts.creatures}, Artifacts: ${counts.artifacts}. ` +
          `Odds: creatureInLocation: ${odds.creatureInLocation}, ` +
          `creatureHasArtifact: ${odds.creatureHasArtifact}, ` +
          `artifactInLocation: ${odds.artifactInLocation}. ` +
          `Start: ${startLocationName}`
      );
    } catch (error) {
      console.error("Error during setup:", error);
      throw new AppError(`Failed to set up the game. ${error}`, 400);
    }
  }

  start() {
    try {
      this.setup();

      setWorldPublisher((event, payload) => this.broadcast(event, payload));

      // Start the world loop
      startWorldLoop();

      // Push initial snapshot
      const payload = this.buildUpdatePayload(this.player.currentLocation);
      this.broadcast("update", payload);
    } catch (error) {
      console.error("Error starting the game:", error);
      throw new AppError(`Failed to start the game. ${error}`, 400);
    }
  }

  buildUpdatePayload(location) {
    if (!location) throw new AppError("location is undefined.", 400);

    const d = location.getDetails?.() || {
      description: location.description,
      exits: location.exits,
      changes: location.changes || ""
    };

    const creaturesStr =
      location.showCreatures?.() ??
      (location.creatures || []).map((c) => c.name).join(", ");
    const artifactsStr =
      location.showArtifacts?.() ??
      (location.artifacts || []).map((a) => a.name).join(", ");
    const players = location.showPlayers?.() || ["Just you"];

    return {
      location: {
        description: d.description,
        exits: Array.isArray(d.exits) ? d.exits.join(", ") : d.exits,
        creatures: creaturesStr,
        artifacts: artifactsStr,
        players,
        result: "",
        changes: location.changes || ""
      },
      player: {
        stats: this.player.getStatsObj(),
        classType:
          this.player.classType ||
          this.player.playerClass ||
          "Missing player class",
        inventory: this.player.showInventory?.() ?? this.player.inventory
      }
    };
  }

  processCommand(command) {
    try {
      // mutate game state according to the command
      const { message, location } = runCommand(this, command);

      // after state change, broadcast the current snapshot
      const payload = this.buildUpdatePayload(this.player.currentLocation);
      payload.result = message; // Include the result of the action
      payload.location = location; // Include structured location
      this.broadcast("update", payload);

      // return a message for the *requesting socket* to show
      return { ok: true, message };
    } catch (error) {
      console.error("Error processing command:", error);
      return { ok: false, message: `Failed to process command. ${error}` };
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
}

export default Game;
