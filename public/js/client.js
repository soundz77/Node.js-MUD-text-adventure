/* public/js/client.js */
(function () {
  // --- Guard: Socket.IO must be present (CSP-friendly external script) ---
  if (typeof io !== "function") {
    console.error(
      "Socket.IO client missing. Include https://cdn.socket.io first."
    );
    return;
  }

  const socket = io({ path: "/socket.io", transports: ["websocket"] });

  // --- Page context from EJS ---
  const playerName = (document.body.dataset.playerName || "").trim();
  const roomIdAttr = document.body.dataset.roomId;
  const roomId =
    roomIdAttr != null && roomIdAttr !== "" ? Number(roomIdAttr) : null;

  // --- Debug helpers ---
  const DEBUG = true;
  const ts = () => new Date().toISOString().split("T")[1].replace("Z", "");
  const logEmit = (ev, data) =>
    DEBUG && console.debug(`%c[${ts()} SOCKET→] ${ev}`, "color:#0a7", data);
  const logRecv = (ev, data) =>
    DEBUG && console.debug(`%c[${ts()} SOCKET←] ${ev}`, "color:#07a", data);

  // --- DOM cache (match your EJS IDs exactly) ---
  const els = {
    // headline + command form
    commandForm: document.getElementById("commandForm"),
    commandInput: document.getElementById("command"),
    headline: document.getElementById("message"),

    // left column location panel
    name: document.getElementById("name"),
    description: document.getElementById("description"),
    players: document.getElementById("players"),
    exits: document.getElementById("exits"),
    creatures: document.getElementById("creatures"),
    artifacts: document.getElementById("artifacts"),

    // room events (left column)
    roomEvents: document.getElementById("roomEvents"),

    // room chat (right column panel)
    chatForm: document.getElementById("chatForm"),
    chatInput: document.getElementById("chatInput"),
    roomChat: document.getElementById("roomChat"),

    // optional world chat (add these elements in EJS if/when you want it)
    worldForm: document.getElementById("worldForm"),
    worldInput: document.getElementById("worldInput"),
    worldUl: document.getElementById("worldChat"),

    // stats + inventory
    level: document.getElementById("level"),
    kills: document.getElementById("kills"),
    inv: document.getElementById("inventory"),

    bars: {
      health: {
        span: document.getElementById("health"),
        bar: document.getElementById("healthBar")
      },
      stamina: {
        span: document.getElementById("stamina"),
        bar: document.getElementById("staminaBar")
      },
      strength: {
        span: document.getElementById("strength"),
        bar: document.getElementById("strengthBar")
      },
      defence: {
        span: document.getElementById("defence"),
        bar: document.getElementById("defenceBar")
      },
      attack: {
        span: document.getElementById("attack"),
        bar: document.getElementById("attackBar")
      },
      experience: {
        span: document.getElementById("experience"),
        bar: document.getElementById("experienceBar")
      }
    }
  };

  // --- Small helpers ---
  const listify = (arr) => (Array.isArray(arr) ? arr.join(", ") : arr ?? "");
  const clamp01 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  };
  function setBar(which, value) {
    const el = els.bars[which];
    if (!el) return;
    const v = clamp01(value);
    if (el.span) el.span.textContent = v;
    if (el.bar) el.bar.style.width = v + "%";
  }
  function setInputsEnabled(on) {
    if (els.commandInput) els.commandInput.disabled = !on;
    if (els.chatInput) els.chatInput.disabled = !on;
    if (els.worldInput) els.worldInput.disabled = !on;
  }
  function addRoomEvent(text) {
    if (!text || !els.roomEvents) return;
    const li = document.createElement("li");
    li.textContent = text;
    els.roomEvents.appendChild(li);
    els.roomEvents.scrollTop = els.roomEvents.scrollHeight;
  }
  function addRoomChat(line) {
    if (!line || !els.roomChat) return;
    const li = document.createElement("li");
    li.textContent = `[${ts()}] ${line}`;
    els.roomChat.appendChild(li);
    while (els.roomChat.children.length > 200)
      els.roomChat.removeChild(els.roomChat.firstChild);
    els.roomChat.scrollTop = els.roomChat.scrollHeight;
  }
  function addWorldChat(line) {
    if (!line || !els.worldUl) return;
    const li = document.createElement("li");
    li.textContent = `[${ts()}] ${line}`;
    els.worldUl.appendChild(li);
    while (els.worldUl.children.length > 200)
      els.worldUl.removeChild(els.worldUl.firstChild);
    els.worldUl.scrollTop = els.worldUl.scrollHeight;
  }

  // --- Renderers: accept full or partial payloads safely ---
  function renderLocationPartial(location) {
    if (!location) return;

    if ("name" in location && els.name) {
      els.name.textContent = `You are here: ` + String(location.name);
    }
    if ("description" in location && els.description) {
      els.description.textContent = `Details: ` + String(location.description);
    }
    if ("exits" in location && els.exits) {
      els.exits.textContent = `Exits: ` + listify(location.exits);
    }
    if ("players" in location && els.players) {
      els.players.textContent = `Players: ` + listify(location.players);
    }
    if ("creatures" in location && els.creatures) {
      els.creatures.textContent = `Creatures: ` + listify(location.creatures);
    }
    if ("artifacts" in location && els.artifacts) {
      els.artifacts.textContent = `Artifacts:  ` + listify(location.artifacts);
    }
  }

  function renderPlayerPartial(player) {
    if (!player) return;
    // Stats
    if (player.stats) {
      const S = player.stats;
      if ("level" in S && els.level) els.level.textContent = S.level;
      if ("kills" in S && els.kills) els.kills.textContent = S.kills;
      if ("health" in S) setBar("health", S.health);
      if ("stamina" in S) setBar("stamina", S.stamina);
      if ("strength" in S) setBar("strength", S.strength);
      if ("defence" in S) setBar("defence", S.defence);
      if ("attack" in S) setBar("attack", S.attack);
      if ("experience" in S) setBar("experience", S.experience);
    }
    // Inventory
    if ("inventory" in player && els.inv) {
      els.inv.textContent = "Your inventory: " + listify(player.inventory);
    }
  }

  // Initialize bars from data-initial once
  (function bootstrapBarsOnce() {
    const map = {
      health: "healthBar",
      stamina: "staminaBar",
      strength: "strengthBar",
      defence: "defenceBar",
      attack: "attackBar",
      experience: "experienceBar"
    };
    for (const [key, id] of Object.entries(map)) {
      const el = document.getElementById(id);
      const v = el?.dataset?.initial;
      if (v != null) setBar(key, v);
    }
  })();

  // --- Socket lifecycle ---
  socket.on("connect", () => {
    setInputsEnabled(true);
    if (roomId != null) {
      logEmit("room:join", { roomId });
      socket.emit("room:join", { roomId });
    }
  });

  socket.io.on("reconnect", () => {
    if (roomId != null) socket.emit("room:join", { roomId });
  });

  socket.on("disconnect", (r) => {
    console.warn("Disconnected:", r);
    setInputsEnabled(false);
  });

  // --- Listeners (single binding each) ---
  socket.off?.("player:message");
  socket.on("player:message", (msg) => {
    logRecv("player:message", msg);
    if (msg && "message" in msg && els.headline) {
      els.headline.textContent = String(msg.message ?? "");
    }
    if (msg && msg.location) renderLocationPartial(msg.location);
    if (msg && msg.player) renderPlayerPartial(msg.player);
  });

  socket.off?.("room:message");
  socket.on("room:message", (msg) => {
    logRecv("room:message", msg);

    // normalize older shapes (text vs message, narration vs event)
    const type = msg?.type === "narration" ? "event" : msg?.type || "";
    const text = msg?.text ?? msg?.message ?? "";

    if (type === "chat") {
      addRoomChat(`${msg.fromName ?? "Player"}: ${text}`);
      return;
    }
    if (type === "event") {
      addRoomEvent(text);
      return;
    }
    if (type === "state") {
      if (msg.location) renderLocationPartial(msg.location);
      return;
    }
    // Unknown type: ignore but log for debugging
    console.debug("[room:message] unhandled type:", type, "payload:", msg);
  });

  socket.off?.("world:chat");
  socket.on("world:chat", (msg) => {
    logRecv("world:chat", msg);
    addWorldChat(`${msg?.fromName ?? "Server"}: ${msg?.text ?? ""}`);
  });

  // --- Emits: commands & room chat ---
  els.commandForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const command = els.commandInput?.value.trim();
    if (!command) return;
    logEmit("room:command", { roomId, command });
    socket.emit("room:command", { roomId, command });
    if (els.headline) els.headline.textContent = "> " + command;
    els.commandInput.value = "";
  });

  els.chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = els.chatInput?.value.trim();
    if (!text) return;
    logEmit("room:chat:send", { roomId, text });
    socket.emit("room:chat:send", {
      roomId,
      text,
      fromName: playerName || "Player"
    });
    els.chatInput.value = "";
  });

  els.worldForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = els.worldInput?.value.trim();
    if (!text) return;
    logEmit("world:chat:send", { text });
    socket.emit("world:chat:send", {
      text,
      fromName: playerName || "Player"
    });
    els.worldInput.value = "";
  });

  // --- Mobile niceties ---
  for (const id of ["command", "chatInput", "worldInput"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.setAttribute("autocapitalize", "off");
    el.setAttribute("autocorrect", "off");
    el.setAttribute("spellcheck", "false");
    el.setAttribute("inputmode", "text");
  }
})();
