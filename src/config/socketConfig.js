// config/socketConfig.js
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
    path: "/socket.io", // must match client
    serveClient: false
  });

  // Emitter facade (your existing abstraction)
  const emitters = createEmitters(io);
  game.setEmitters(emitters);

  // Wire world → socket room publishing
  setRoomPublisher((roomId, event, payload) => {
    if (roomId == null) return;
    io.to(roomKey(roomId)).emit(event, payload);
  });

  setRoomOccupancyChecker((roomId) => {
    const r = io.sockets.adapter.rooms.get(roomKey(roomId));
    return !!(r && r.size > 0);
  });

  // Helper to (re)join a player's socket to a room
  function moveSocketBetweenRooms(socket, fromId, toId) {
    if (!socket) return;
    if (fromId != null) socket.leave(roomKey(fromId));
    if (toId != null) socket.join(roomKey(toId));
  }

  io.on("connection", (socket) => {
    console.log(sessionMessages.success.connect);

    // Attach socket to your single-player instance (adjust later if multi-player)
    game.player.socketId = socket.id;

    // Join current room on connect
    const startId = game.player.currentLocation?.id;
    if (startId != null) socket.join(roomKey(startId));

    // Movement hook (called by movePlayer)
    game.onPlayerMoved = (player, fromId, toId, direction) => {
      const s = io.sockets.sockets.get(player.socketId);
      moveSocketBetweenRooms(s, fromId, toId);
      // Optional immediate feedback (your client also shows command results)
      s?.emit("player:message", { message: `You move ${direction}.` });
    };

    // Commands from client
    socket.on("processCommand", (command) => {
      try {
        const { ok, message, location } = game.processCommand(command, {
          socket
        });
        // Always send a player-targeted message (your client consumes message+location)
        emitters.toPlayer(socket, { message, location });
        // If you want to suppress sending on failure, uncomment:
        // if (ok) emitters.toPlayer(socket, { message, location });
      } catch (err) {
        console.error("processCommand error:", err);
        emitters.toPlayer(socket, {
          message: "An error occurred processing that command."
        });
      }
    });

    // World chat (broadcast)
    socket.on("chatMessage", (msg) => {
      emitters.toAll({ type: "chat", msg });
    });

    socket.conn.on("error", (err) =>
      console.error("Socket engine error:", err)
    );
    socket.on("disconnect", () => {
      console.log(sessionMessages.success.disconnect);
      // Optional: leave current room explicitly (socket.io does this automatically)
      // const curId = game.player.currentLocation?.id;
      // if (curId != null) socket.leave(roomKey(curId));
    });
  });

  return io; // return it so callers can use io if needed
};

export default socketConfig;
