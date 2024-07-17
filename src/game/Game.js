import AppError from "../../base-template/src/utils/errors/AppError.js";
import Player from "./Characters/player.js";
import generateLocations from "./worldMap/generateLocations.js";
import connectLocationsDFS from "./worldMap/connectLocationsDFS.js";
import populateLocations from "./worldMap/populateLocations.js";
import getLocation from "./worldMap/getLocation.js";
import processCommand from "./commands/processCommand.js";
import { io } from "../config/socketConfig.js";
import gameData from "./gameData/game1.js";

class Game {
  constructor() {
    this.locations = new Map();
    this.player = new Player("");
    this.isGameOver = false;
  }

  setup() {
    try {
      // Config - change settings in gameData
      const {
        numberOfLocations,
        numberOfCreatures,
        numberOfArtifacts,
        chanceCreatureInLocation,
        chanceCreatureHasArtifact,
        startLocation,
      } = gameData;

      // Generate all of the locations
      const locations = generateLocations(numberOfLocations);
      locations.forEach((location) =>
        this.locations.set(location.name, location)
      );
      // Link the locations together
      const connectedlocations = connectLocationsDFS(locations);
      // Add creatures and artifacts to the locations
      populateLocations(
        connectedlocations,
        numberOfCreatures,
        numberOfArtifacts,
        chanceCreatureInLocation,
        chanceCreatureHasArtifact
      );

      // Set starting location
      const startingLocation = getLocation(this.locations, startLocation);

      if (!startingLocation) {
        throw new AppError(
          `Starting location "${startLocation}" is undefined.`,
          400
        );
      }

      // Place player in the starting location
      this.player.moveTo(startingLocation);

      console.log(
        `Created world map. Added ${numberOfLocations} locations, ${numberOfCreatures} monsters and ${numberOfArtifacts} artifacts. The chance of a monster being in a location has been set to ${chanceCreatureInLocation}, and the chance of a monster having an artifact to ${chanceCreatureHasArtifact}. Start location is ${startLocation}`
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
      if (!location) {
        throw new AppError("location is undefined.", 400);
      }
      const locationDetails = location.getDetails();
      return {
        description: locationDetails.description,
        exits: locationDetails.exits,
        creatures: location.showCreatures(),
        artifacts: location.showArtifacts(),
        result: "",
      };
    } catch (error) {
      console.error("Error getting location data:", error);
      throw new AppError(`Failed to get location data.${error}`, 400);
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

  emitCallback(location, player) {
    try {
      io.emit("update", { location, player });
    } catch (error) {
      throw new AppError(`Failed to emit callback. ${error}`, 400);
    }
  }
}

export default Game;
