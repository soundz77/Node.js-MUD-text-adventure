import { Server } from "socket.io";
import sessionMessages from "../utils/logging/messages/sessionMessages.js";
import { createEmitters } from "../../src/game/gameData/emitters.js";

const socketConfig = (server, { game }) => {
  const io = new Server(server, {
    path: "/socket.io", // explicit; must match client
    serveClient: false // Not loading from localhost
  });

  const emitters = createEmitters(io);

  // Option 1: give Game the full emitters object
  game.setEmitters(emitters);

  io.on("connection", (socket) => {
    console.log(sessionMessages.success.connect);

    socket.on("processCommand", (command) => {
      // Modern path: rely on broadcast payload containing message+location
      const { ok, message, location } = game.processCommand(command, {
        socket
      });

      // Optional: also send a per-player message event
      emitters.toPlayer(socket, { message, location });
    });

    socket.on("chatMessage", (msg) => emitters.toAll({ type: "chat", msg }));

    socket.conn.on("error", (err) => console.error("Engine error", err));
    socket.on("disconnect", () =>
      console.log(sessionMessages.success.disconnect)
    );
  });

  // return io;
};
export default socketConfig;
