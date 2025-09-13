/* public/js/client.js */

(function () {
  const socket = io({ path: "/socket.io", transports: ["websocket"] });
  let seq = 1;

  const playerName = (document.body.dataset.playerName || "").trim();

  // DOM cache
  const els = {
    form: document.getElementById("command-form"),
    cmd: document.getElementById("command"),
    msgList: document.getElementById("message-list"),
    location: document.getElementById("location"),
    exits: document.getElementById("locationExits"),
    creatures: document.getElementById("creatures"),
    artifacts: document.getElementById("artifacts"),
    players: document.getElementById("players"),
    kills: document.getElementById("kills"),
    level: document.getElementById("level"),
    inv: document.getElementById("inventory-list"),
    bars: {
      health: {
        span: document.getElementById("health"),
        bar: document.getElementById("health-bar")
      },
      stamina: {
        span: document.getElementById("stamina"),
        bar: document.getElementById("stamina-bar")
      },
      strength: {
        span: document.getElementById("strength"),
        bar: document.getElementById("strength-bar")
      },
      defence: {
        span: document.getElementById("defence"),
        bar: document.getElementById("defence-bar")
      },
      attack: {
        span: document.getElementById("attack"),
        bar: document.getElementById("attack-bar")
      },
      experience: {
        span: document.getElementById("experience"),
        bar: document.getElementById("experience-bar")
      }
    },
    chat: {
      form: document.getElementById("chat-form"),
      input: document.getElementById("message"),
      ul: document.getElementById("world-messages")
    }
  };

  // Logging (optional)
  const logEmit = (ev, data) => console.debug("[SOCKET→]", ev, data);
  const logRecv = (ev, data) => console.debug("[SOCKET←]", ev, data);

  socket.on("connect", () => console.log("Connected:", socket.id));
  socket.on("disconnect", (r) => console.warn("Disconnected:", r));

  // COMMANDS
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = els.cmd.value.trim();
    if (!text) return;
    const id = seq++;
    const payload = { id, text };
    els.msgList.textContent = "> " + text;
    logEmit("processCommand", payload);
    socket.emit("processCommand", payload);
    els.cmd.value = "";
  });

  // WORLD CHAT
  els.chat.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = els.chat.input.value.trim();
    if (!text) return;
    const msg = `${playerName}: ${text}`;
    logEmit("chatMessage", msg);
    socket.emit("chatMessage", msg);
    els.chat.input.value = "";
  });

  // Incoming
  const queue = [];

  socket.on("world:update", (payload) => {
    logRecv("world:update", payload);
    queue.push(payload);
  });

  socket.on("player:message", (data) => {
    logRecv("player:message", data);
    queue.push({ message: data?.message, location: data?.location });
  });

  socket.on("chatMessage", (msg) => {
    logRecv("chatMessage", msg);
    queue.push({ _chat: msg });
  });

  // Helpers
  function clamp01(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  }
  function setBar(which, value) {
    const el = els.bars[which];
    if (!el) return;
    const v = clamp01(value);
    el.span.textContent = v;
    el.bar.style.width = v + "%";
  }
  const listify = (arr) => (Array.isArray(arr) ? arr.join(", ") : arr ?? "");

  function apply(payload) {
    // World chat
    if (payload._chat != null) {
      const li = document.createElement("li");
      li.textContent = payload._chat;
      els.chat.ul.appendChild(li);
      while (els.chat.ul.children.length > 200) {
        els.chat.ul.removeChild(els.chat.ul.firstChild);
      }
      return;
    }

    const { player, location } = payload || {};

    // Show message (root-level preferred)
    if (payload && payload.message != null) {
      els.msgList.textContent = payload.message;
    }

    function bootstrapBars() {
      const map = {
        health: "health-bar",
        stamina: "stamina-bar",
        strength: "strength-bar",
        defence: "defence-bar",
        attack: "attack-bar",
        experience: "experience-bar"
      };
      for (const [key, id] of Object.entries(map)) {
        const el = document.getElementById(id);
        const v = el?.dataset?.initial;
        if (v != null) setBar(key, v);
      }
    }
    // call once at startup
    bootstrapBars();

    // Location
    if (location) {
      if (location.result != null && payload.message == null) {
        els.msgList.textContent = location.result;
      }
      if (location.message != null && payload.message == null) {
        els.msgList.textContent = location.message;
      }
      if (location.description != null) {
        els.location.textContent = location.description;
      }
      if (location.exits != null) {
        els.exits.textContent = "Exits: " + listify(location.exits);
      }
      els.creatures.textContent =
        location.creatures && location.creatures.length
          ? "Monsters: " + listify(location.creatures)
          : "";
      els.artifacts.textContent =
        location.artifacts && location.artifacts.length
          ? "Artifacts: " + listify(location.artifacts)
          : "";

      if (Array.isArray(location.players) && els.players) {
        const names = location.players.map((n) => {
          const s = String(n);
          return s.toLowerCase() === playerName.toLowerCase() ? "you" : s;
        });
        els.players.textContent = "Players: " + (names.join(", ") || "you");
      }
    }

    // Player (stats)
    if (player && player.stats) {
      const S = player.stats;
      if ("health" in S) setBar("health", S.health);
      if ("stamina" in S) setBar("stamina", S.stamina);
      if ("strength" in S) setBar("strength", S.strength);
      if ("defence" in S) setBar("defence", S.defence);
      if ("attack" in S) setBar("attack", S.attack);
      if ("experience" in S) setBar("experience", S.experience);
      if ("kills" in S && els.kills) els.kills.textContent = S.kills;
      if ("level" in S && els.level) els.level.textContent = S.level;
    }

    // Inventory
    if (player && "inventory" in player && player.inventory != null) {
      els.inv.innerHTML = "Your inventory: " + listify(player.inventory);
    }
  }

  function frame() {
    if (queue.length) {
      const items = queue.splice(0, queue.length);
      for (const p of items) apply(p);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Mobile input niceties
  const cmd = document.getElementById("command");
  if (cmd) {
    cmd.setAttribute("autocapitalize", "off");
    cmd.setAttribute("autocorrect", "off");
    cmd.setAttribute("spellcheck", "false");
    cmd.setAttribute("inputmode", "text");
  }
})();
