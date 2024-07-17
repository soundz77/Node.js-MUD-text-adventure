import { Server } from "socket.io";
import game from "../game/startGame.js";
import sessionMessages from "../utils/logging/messages/sessionMessages.js";

let io;

const socketConfig = (server) => {
  io = new Server(server);

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

    socket.on("disconnect", () => {
      console.log(sessionMessages.success.disconnect);
    });
  });

  io.engine.on("connection_error", (err) => {
    console.log(err.req); // the request object
    console.log(err.code); // the error code, for example 1
    console.log(err.message); // the error message, for example "Session ID unknown"
    console.log(err.context); // some additional error context
  });
};

export { socketConfig, io };
