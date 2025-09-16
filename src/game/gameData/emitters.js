// Emitters used by Game + world runner.
// Wire-level event names.
export const WIRE_EVENTS = {
  PLAYER_MESSAGE: "player:message",
  ROOM_MESSAGE: "room:message",
  WORLD_CHAT: "world:chat"
};

export function createEmitters(io) {
  // Single invariant: sockets join "room:<id>" and we always emit to that.
  const roomKey = (id) => `room:${id}`;

  // ---- Private to a single player (command result, stats/inventory updates)
  function toPlayer(socketId, payload) {
    if (!socketId) return;
    io.to(socketId).emit(WIRE_EVENTS.PLAYER_MESSAGE, payload);
  }

  // ---- Broadcast to everyone in a room
  // Payload should be one of:
  // - { type: "chat", roomId, fromName?, text, ts? }
  // - { type: "event", roomId, text, ts? }
  // - { type: "state", roomId, location: { players?, creatures?, artifacts? }, ts? }
  function toRoom(roomId, payload) {
    if (roomId == null) return;
    io.to(roomKey(roomId)).emit(
      WIRE_EVENTS.ROOM_MESSAGE,
      normalizeRoomPayload(roomId, payload)
    );
  }

  // ---- Optional global/world chat (admin/general)
  // { fromName?, text, ts? }
  function toWorld(payload) {
    io.emit(WIRE_EVENTS.WORLD_CHAT, normalizeWorldPayload(payload));
  }

  return {
    events: WIRE_EVENTS,
    toPlayer,
    toRoom,
    toWorld
  };
}

// --- Helpers: keep payloads predictable without forcing callers to remember keys.
function normalizeRoomPayload(roomId, payload) {
  const base = { roomId, ts: Date.now() };

  // Accept older shapes and coerce them.
  if (!payload || typeof payload !== "object") {
    // string/undefined → event line
    return { ...base, type: "event", text: String(payload ?? "") };
  }

  // Allow `event: "narration"` to map to "event"
  const rawType = payload.type ?? payload.event ?? "event";
  const type = rawType === "narration" ? "event" : rawType;

  // Text can be under `text` or older `message`
  const text = payload.text ?? payload.message;

  // For state updates, allow just { location: { ... } }
  if (type === "state") {
    const location = payload.location ?? {};
    return { ...base, type, location };
  }

  // For chat/event lines
  return {
    ...base,
    type,
    text: text ?? "",
    fromName: payload.fromName
  };
}

function normalizeWorldPayload(payload) {
  const base = { ts: Date.now() };
  if (!payload || typeof payload !== "object") {
    return { ...base, fromName: "Server", text: String(payload ?? "") };
  }
  return {
    ...base,
    fromName: payload.fromName ?? "Server",
    text: payload.text ?? payload.message ?? ""
  };
}
