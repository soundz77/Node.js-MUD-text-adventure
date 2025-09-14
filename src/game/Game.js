import AppError from "../../base-template/src/utils/errors/AppError.js";
import Player from "./Characters/player.js";
import generateLocations from "./worldMap/generateLocations.js";
import connectLocationsDFS from "./worldMap/connectLocationsDFS.js";
import populateLocations from "./worldMap/populateLocations.js";
import getLocation from "./worldMap/getLocation.js";
import { gameData, locationTitles } from "./gameData/gameData.js";
import {
  worldState,
  startWorldLoop,
  setWorldPublisher
} from "../game/world/runner.js";
import runCommand from "./commands/runCommand.js";

class Game {
  constructor() {
    this.locations = new Map(); // create an empty map
    this.player = new Player("");
    this.isGameOver = false;

    this.emitters = null; // set later
    this._queued = [];
    this.broadcast = this.broadcast.bind(this);
  }

  setEmitters(emitters) {
    this.emitters = emitters;
    // flush anything queued before emitters existed
    if (this._queued.length) {
      for (const [event, payload] of this._queued)
        this._doBroadcast(event, payload);
      this._queued.length = 0;
    }
  }

  // internal: map logical events to wire events and emit
  _doBroadcast(event, payload) {
    if (!this.emitters) {
      this._queued.push([event, payload]);
      return;
    }

    const { events } = this.emitters;
    switch (event) {
      case "update":
        this.emitters.toAll(payload); // world:update
        break;
      case "error":
        this.emitters.toAll({ ...payload, type: "error" }); // or add emitters.toError(...)
        break;
      default:
        // fall back: send as player message to everyone, or add a generic emitters.emit(event,...)
        this.emitters.toAll({ event, ...payload });
    }
  }

  broadcast(event, payload) {
    this._doBroadcast(event, payload);
  }

  setup() {
    try {
      const { counts, odds, startLocationId } = gameData;

      // 1) Generate locations (pass descriptions)
      const locs = generateLocations(counts.locations, locationTitles);

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

      locs.forEach((loc) => {
        this.locations.set(Number(loc.id), loc);
        this.locations.set(loc.name, loc);
      }); // Populate the map with the map data

      console.log(locs);

      // 4) Start location
      const startingLocation = getLocation(this.locations, startLocationId);
      if (!startingLocation) {
        throw new AppError(
          `Starting location '${startLocationId}' is undefined/unknown.`,
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
          `Start: ${startLocationId}`
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

      // Push initial snapshot
      const payload = this.buildUpdatePayload(this.player.currentLocation);
      console.log(payload);
      this.broadcast("update", payload);

      // Start the world loop
      startWorldLoop();
    } catch (error) {
      console.error("Error starting the game:", error);
      throw new AppError(`Failed to start the game. ${error}`, 400);
    }
  }

  buildUpdatePayload(location) {
    if (!location) throw new AppError("location is undefined.", 400);

    const loc = location.getDetails();
    const stats = this.player.getStatsObj();
    const inventory = this.player.showInventory();
    const details = this.player.getPlayerDetails();

    return {
      location: loc,
      player: {
        name: details.playerName,
        class: details.playerClass,
        experience: details.playerExperience,
        inventory,
        stats
      } // message is sent to room
    };
  }

  processCommand(command) {
    try {
      // mutate game state according to the command
      const { message, location } = runCommand(this, command);

      // after state change, broadcast the current snapshot
      const payload = this.buildUpdatePayload(this.player.currentLocation);
      console.log(payload);
      this.broadcast("update", payload);

      return { ok: true, message, location };
    } catch (error) {
      console.error("Error processing command:", error);
      return { ok: false, message: `Failed to process command. ${error}` };
    }
  }

  getLocationData(location) {
    try {
      if (!location) throw new AppError("Location is undefined.", 400);

      const d = location.getDetails();

      return d;
    } catch (error) {
      throw new AppError(`Failed to get location data. ${error}`, 400);
    }
  }
}

export default Game;
