import { Server } from "socket.io";
import sessionMessages from "../utils/logging/messages/sessionMessages.js";
import { createEmitters } from "../../src/game/gameData/emitters.js";
import {
  setRoomPublisher,
  setRoomOccupancyChecker
} from "../../src/game/world/runner.js";

const roomKey = (id) => `room:${id}`;

const socketConfig = (server, { game }) => {
  const io = new Server(server, {
    path: "/socket.io",
    serveClient: false
  });

  // ---- Emitters facade
  const emitters = createEmitters(io);
  game.setEmitters(emitters);

  // ---- World/runner → sockets (normalize to the single room channel)
  // Accept legacy names like "room:narration" or "room:state" and map to { type, ...payload }.
  setRoomPublisher((roomId, eventOrType, payload) => {
    if (roomId == null) return;
    let type = String(eventOrType || "").trim();
    if (type.startsWith("room:")) type = type.slice(5); // "room:narration" -> "narration"
    if (type === "narration") type = "event";
    if (!type) type = payload?.type || "event";
    emitters.toRoom(roomId, { type, ...payload });
  });

  // For AI/NPC ticks that only emit if someone is there
  setRoomOccupancyChecker((roomId) => {
    const r = io.sockets.adapter.rooms.get(roomKey(roomId));
    return !!(r && r.size > 0);
  });

  // Helper to move a socket between rooms
  function moveSocketBetweenRooms(socket, fromId, toId) {
    if (!socket) return;
    if (fromId != null) socket.leave(roomKey(fromId));
    if (toId != null) socket.join(roomKey(toId));
  }

  // Optional: invert arrival text
  function inverseDirection(dir) {
    const m = {
      north: "south",
      south: "north",
      east: "west",
      west: "east",
      up: "down",
      down: "up"
    };
    return m[String(dir || "").toLowerCase()] || dir;
  }

  io.on("connection", (socket) => {
    console.log(sessionMessages.success.connect);

    // Attach this socket to your (current) single-player instance
    game.player.socketId = socket.id;

    // Join the player's current room on connect
    const startId = game.player.currentLocation?.id;
    if (startId != null) socket.join(roomKey(startId));

    // Game → sockets: movement hook
    // Your game should call this when the player moves.
    game.onPlayerMoved = (player, fromId, toId, direction) => {
      const s = io.sockets.sockets.get(player.socketId);
      moveSocketBetweenRooms(s, fromId, toId);

      // Private acknowledgement
      emitters.toPlayer(player.socketId, { message: `You move ${direction}.` });

      // Room-visible narration (names optional if you don’t have them yet)
      const who = player?.name || "Someone";
      if (fromId != null)
        emitters.toRoom(fromId, {
          type: "event",
          text: `${who} leaves ${direction}.`
        });
      if (toId != null)
        emitters.toRoom(toId, {
          type: "event",
          text: `${who} arrives from the ${inverseDirection(direction)}.`
        });
    };

    // --- Room lifecycle (client tells us their room on load/reconnect) ---
    socket.on("room:join", ({ roomId } = {}) => {
      if (roomId == null) return;
      for (const r of socket.rooms) if (r !== socket.id) socket.leave(r);
      socket.join(roomKey(roomId));
    });

    // --- Commands (private reply; room updates are broadcast by game/world) ---
    socket.on("room:command", ({ roomId, command } = {}) => {
      if (!command) return;
      try {
        const { ok, message, location, player } = game.processCommand(command, {
          socketId: socket.id,
          roomId
        });
        // Always reply privately with the latest snapshot for this player
        emitters.toPlayer(socket.id, { message, location, player });
        // Any room-visible narration/state should be emitted by your game/world via:
        //   game.broadcast("event"/"state"/"narration", { roomId, ... })
      } catch (err) {
        console.error("room:command error:", err);
        emitters.toPlayer(socket.id, {
          message: "An error occurred processing that command."
        });
      }
    });

    // --- Room chat (open chat for all players in the room) ---
    socket.on("room:chat:send", ({ roomId, text, fromName } = {}) => {
      if (!roomId || !text) return;
      emitters.toRoom(roomId, { type: "chat", text, fromName });
    });

    // --- World chat (optional/global) ---
    socket.on("world:chat:send", ({ text, fromName } = {}) => {
      if (!text) return;
      emitters.toWorld({ text, fromName });
    });

    // --- Housekeeping ---
    socket.conn.on("error", (err) =>
      console.error("Socket engine error:", err)
    );
    socket.on("disconnect", () => {
      console.log(sessionMessages.success.disconnect);
    });
  });

  return io;
};

export default socketConfig;
