import { Server } from "socket.io";
import sessionMessages from "../utils/logging/messages/sessionMessages.js";

const socketConfig = (server, { game }) => {
  const io = new Server(server, {
    path: "/socket.io", // explicit; must match client
    serveClient: false // Not loading from localhost
  });

  // Give the game a transport-agnostic publisher
  game.setPublisher((event, payload) => io.emit(event, payload));

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log(sessionMessages.success.connect);

    // Handle the "processCommand" event
    socket.on("processCommand", (command) => {
      game.processCommand(command, (message) => {
        // Emit the command result back to the client
        socket.emit("commandResult", message);
      });
    });

    // Handle chat messages
    socket.on("chatMessage", (msg) => {
      io.emit("chatMessage", msg);
    });

    socket.conn.on("error", (err) => console.error("Engine error", err));

    socket.on("disconnect", () => {
      console.log(sessionMessages.success.disconnect);
    });
  });

  return io;
};

export default socketConfig;
