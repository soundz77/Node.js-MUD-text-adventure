// emitters/index.js
export const events = {
  WORLD_UPDATE: "world:update",
  PLAYER_MESSAGE: "player:message",
  ERROR: "error"
};

export function createEmitters(io) {
  return {
    events,
    toAll: (payload) => io.emit(events.WORLD_UPDATE, payload),
    toPlayer: (socket, payload) => socket.emit(events.PLAYER_MESSAGE, payload),
    toRoom: (roomId, payload) =>
      io.to(roomId).emit(events.WORLD_UPDATE, payload)
  };
}
