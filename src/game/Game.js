import AppError from "../../base-template/src/utils/errors/AppError.js";
import Player from "./Characters/player.js";
import connectLocationsDFS from "./worldMap/connectLocationsDFS.js";
import populateLocations from "./worldMap/populateLocations.js";
import { gameData } from "./gameData/gameData.js";
import { worldState, startWorldLoop } from "../game/world/runner.js";
import runCommand from "./commands/runCommand.js";
import { createLocationFromBlueprint } from "./gameData/factories.js";
import { locationDescriptions } from "./gameData/locationDescriptions.js";

const locationBySlug = new Map();

function indexLocationsBySlug(locs) {
  locationBySlug.clear();
  for (const l of locs) {
    if (l.slug) locationBySlug.set(l.slug, l.id);
  }
}

class Game {
  constructor() {
    this.locations = new Map();
    this.player = new Player("");
    this.isGameOver = false;

    // Socket emitters facade (set later by socketConfig)
    this.emitters = null;
    this._queued = [];

    // Optional hook the socket layer can set (used to move socket rooms + announce)
    this.onPlayerMoved = null;
  }

  // ---- Emitter plumbing
  setEmitters(emitters) {
    this.emitters = emitters;
    if (this._queued.length) {
      for (const fn of this._queued) fn();
      this._queued.length = 0;
    }
  }
  _withEmitters(fn) {
    if (this.emitters) fn();
    else this._queued.push(fn);
  }
  setup() {
    // 1) Build from blueprints
    const locs = locationDescriptions.map(createLocationFromBlueprint);

    // 2) Index slugs
    indexLocationsBySlug(locs);

    // 3) Connect locations (works on array of Location instances)
    const connectedLocations = connectLocationsDFS(locs);

    // 4) Populate with creatures & artifacts
    const { counts, odds } = gameData;
    populateLocations(
      connectedLocations,
      counts.creatures,
      counts.artifacts,
      odds.creatureInLocation
      // odds.creatureHasArtifact,
      // odds.artifactInLocation
    );

    // 5) Build id → Location map (strings, not Number())
    this.locations.clear();
    for (const loc of connectedLocations) {
      this.locations.set(loc.id, loc);
    }

    // 6) Place player at starting location
    const startId = locationBySlug.get("start");
    if (!startId) {
      throw new AppError(`Starting location slug 'start' not found.`, 400);
    }
    const startLoc = this.locations.get(startId);
    if (!startLoc) {
      throw new AppError(
        `Start location '${startId}' not in locations map.`,
        400
      );
    }

    // Add an  API to player:
    // this.player.moveToLocation(startLoc);
    // Temp: set directly if your model expects it:
    this.player.currentLocation = startLoc;
    // Add player to room (when available)
    startLoc.addPlayer?.(this.player);

    // 7) Expose to world runner
    worldState.locationsMap = this.locations;
  }

  start() {
    try {
      this.setup();
      // Kick the world loop; room publishing to sockets is already wired in socketConfig
      startWorldLoop();
    } catch (err) {
      console.error("Error starting the game:", err);
      throw new AppError(`Failed to start the game. ${err}`, 400);
    }
  }

  // ---- Snapshots

  // Private reply to the acting player
  _playerSnapshot({ message } = {}) {
    const loc = this.player.currentLocation?.getDetails?.();
    const stats = this.player.getStatsObj?.();
    const inventory = this.player.showInventory?.();
    const details = this.player.getPlayerDetails?.();

    return {
      ...(message != null ? { message: String(message) } : {}),
      location: loc
        ? {
            name: loc.name,
            description: loc.description,
            exits: loc.exits,
            players: loc.players,
            creatures: loc.creatures,
            artifacts: loc.artifacts
          }
        : undefined,
      player: details
        ? {
            name: details.playerName,
            class: details.playerClass,
            experience: details.playerExperience,
            inventory,
            stats
          }
        : undefined
    };
  }

  // Minimal room-state payload (only fields we care to refresh in the DOM)
  _roomStateFor(locationObj) {
    if (!locationObj?.getDetails) return null;
    const d = locationObj.getDetails();
    return {
      location: {
        // Only include the lists that affect the DOM
        players: d.players,
        creatures: d.creatures,
        artifacts: d.artifacts
      }
    };
  }

  // Push a room "state" broadcast with partial snapshot for DOM updates
  _publishRoomState(roomId, locationObj) {
    const state = this._roomStateFor(locationObj);
    if (!state) return;
    this._withEmitters(() => {
      this.emitters.toRoom(roomId, { type: "state", roomId, ...state });
    });
  }

  // Convenience: broadcast a readable line to room
  _publishRoomEvent(roomId, text) {
    if (!text) return;
    this._withEmitters(() => {
      this.emitters.toRoom(roomId, {
        type: "event",
        roomId,
        text,
        ts: Date.now()
      });
    });
  }

  // ---- Movement (update model, move socket via hook, announce, refresh DOM)
  movePlayer(direction) {
    const fromLoc = this.player.currentLocation;
    const fromId = fromLoc?.id;

    // Let your Player/location objects handle actual movement rules
    const moved = this.player.move(direction); // assume you have this (or adapt to your API)
    const toLoc = this.player.currentLocation;
    const toId = toLoc?.id;

    if (!moved || fromId === toId) {
      return {
        ok: false,
        message: "You can't go that way.",
        location: fromLoc?.getDetails?.()
      };
    }

    // Let socket layer move the socket between rooms + emit readable lines
    this.onPlayerMoved?.(this.player, fromId, toId, direction);

    // After the model changed, refresh DOM lists in both rooms
    if (fromId != null) this._publishRoomState(fromId, fromLoc);
    if (toId != null) this._publishRoomState(toId, toLoc);

    return {
      ok: true,
      message: `You move ${direction}.`,
      location: toLoc?.getDetails?.()
    };
  }

  // ---- Commands

  /**
   * Process a text command from a player.
   * Always returns a private payload for the caller.
   * Also emits room-visible changes via "event" and "state" when needed.
   */
  processCommand(command, { socketId, roomId } = {}) {
    try {
      const beforeLoc = this.player.currentLocation;
      const beforeRoomId = beforeLoc?.id;

      // Delegate to your existing command system
      const result = runCommand(this, command);
      // result may mutate the world, move the player, etc.
      // We normalize the private reply for the acting player:
      const message = result?.message ?? "";
      const location = this.player.currentLocation?.getDetails?.();

      // If the command changed visible room state in-place (e.g., kill/pickup),
      // push a "state" update so other clients refresh lists.
      // Simple heuristic: always publish current room state after commands.
      const curLoc = this.player.currentLocation;
      const curRoomId = curLoc?.id;

      // If player moved via command (your runCommand may already do that),
      // refresh both rooms; otherwise refresh current room.
      if (
        beforeRoomId != null &&
        curRoomId != null &&
        beforeRoomId !== curRoomId
      ) {
        // Movement path: let socket layer announce (onPlayerMoved), we handle states:
        if (beforeLoc) this._publishRoomState(beforeRoomId, beforeLoc);
        if (curLoc) this._publishRoomState(curRoomId, curLoc);
      } else if (curRoomId != null) {
        // Non-movement but visible changes (pickup, kill, spawn, etc.)
        this._publishRoomState(curRoomId, curLoc);
      }

      // Private reply to acting player
      const payload = this._playerSnapshot({ message });
      return { ok: true, ...payload };
    } catch (error) {
      console.error("Error processing command:", error);
      return {
        ok: false,
        message: `Failed to process command. ${
          error instanceof Error ? error.message : String(error)
        }`
      };
    }
  }
}

export default Game;
