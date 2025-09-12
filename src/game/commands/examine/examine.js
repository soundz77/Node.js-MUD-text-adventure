// commands/examine/examine.js
import gameMessages from "../../gameData/gameMessages.js";

/**
 * Examine anything at the player's location:
 * - artifacts on the ground / in inventory
 * - creatures in the room
 * - other players (if location.players exists)
 * - yourself ("me"/"self")
 *
 * Returns a structured result for the UI, but .message is a readable string.
 */
const examine = (player, targetName) => {
  const loc = player.currentLocation;
  if (!loc) return asMsg("You seem to be nowhere…", { kind: "none" });

  const raw = String(targetName || "").trim();
  if (!raw)
    return asMsg(gameMessages.attackNothing || "Examine what?", {
      kind: "none"
    });

  const name = raw.toLowerCase();

  // self
  if (name === "me" || name === "self" || name === player.name.toLowerCase()) {
    return describeCharacter(player, { you: true });
  }

  const artifacts = Array.isArray(loc.artifacts) ? loc.artifacts : [];
  const creatures = Array.isArray(loc.creatures) ? loc.creatures : [];
  const players = Array.isArray(loc.players) ? loc.players : [];
  const inv = Array.isArray(player.inventory) ? player.inventory : [];

  // search order: loc artifacts → creatures → other players → inventory
  const target =
    findByName(artifacts, name) ??
    findByName(creatures, name) ??
    findByName(
      players.filter((p) => p !== player),
      name
    ) ??
    findByName(inv, name) ??
    null;

  if (!target)
    return asMsg(`Cannot find ${raw} to examine.`, {
      kind: "none",
      query: raw
    });

  if (isArtifact(target)) return describeArtifact(target);
  return describeCharacter(target, { you: false });
};

export default examine;

/* ---------- helpers ---------- */

function asMsg(message, extra = {}) {
  return { message, ...extra };
}

function isArtifact(obj) {
  return (
    obj?.type === "artifact" ||
    obj?.type === "weapon" ||
    obj?.type === "wearable" ||
    obj?.type === "edible"
  );
}

function findByName(list, lower) {
  if (!Array.isArray(list)) return null;
  let f = list.find((x) => x?.name?.toLowerCase?.() === lower);
  if (f) return f;
  f = list.find((x) => x?.name?.toLowerCase?.().startsWith(lower));
  if (f) return f;
  f = list.find((x) => x?.name?.toLowerCase?.().includes(lower));
  return f || null;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function describeArtifact(item) {
  const stats =
    item.stats && typeof item.stats === "object"
      ? {
          attack: num(item.stats.attack),
          defence: num(item.stats.defence),
          strength: num(item.stats.strength),
          health: num(item.stats.health),
          stamina: num(item.stats.stamina)
        }
      : undefined;

  const parts = [];
  if (stats) {
    push(parts, "Atk", stats.attack);
    push(parts, "Def", stats.defence);
    push(parts, "Str", stats.strength);
    push(parts, "HP", stats.health);
    push(parts, "Sta", stats.stamina);
  } else {
    // legacy fallback
    push(parts, "Atk", num(item.attack));
    push(parts, "Def", num(item.defence));
    push(parts, "Str", num(item.strength));
  }

  const cond = num(item.condition);
  const eq = item.equipped === true ? " | Equipped" : "";
  const statStr = parts.length ? ` | ${parts.join(" ")}` : "";
  const condStr = cond != null ? ` | Cond:${cond}` : "";
  const desc = item.description ? `: ${item.description}` : "";

  const message = `You examine the ${item.name}${desc}${statStr}${condStr}${eq}`;

  return {
    kind: "artifact",
    name: item.name,
    description: item.description,
    equipped: item.equipped === true,
    condition: cond,
    stats,
    message
  };
}

function describeCharacter(ch, { you }) {
  // stats-only world
  const s = ch.stats || {};
  const out = {
    kind: you ? "self" : ch.playerClass || ch.classType ? "player" : "creature",
    name: ch.name,
    classType: ch.classType || ch.playerClass,
    stats: {
      health: num(s.health),
      stamina: num(s.stamina),
      strength: num(s.strength),
      defence: num(s.defence),
      attack: num(s.attack),
      level: num(s.level),
      experience: num(s.experience),
      kills: num(s.kills)
    },
    equipped: ch.equippedItems
      ? Object.values(ch.equippedItems)
          .map((i) => i?.name)
          .filter(Boolean)
      : [],
    description: ch.description
  };

  // user-facing message
  const p = [];
  push(p, "HP", out.stats.health);
  push(p, "Sta", out.stats.stamina);
  push(p, "Str", out.stats.strength);
  push(p, "Def", out.stats.defence);
  push(p, "Atk", out.stats.attack);
  push(p, "Lvl", out.stats.level);
  push(p, "XP", out.stats.experience);
  push(p, "Kills", out.stats.kills);

  const who = you ? "yourself" : out.name || "the target";
  const classStr = out.classType ? ` (${out.classType})` : "";
  const desc = out.description ? `\n"${out.description}"` : "";
  const eq = out.equipped?.length
    ? `\nEquipped: ${out.equipped.join(", ")}`
    : "";

  return {
    ...out,
    message: `You examine ${who}${classStr}.\n${p.join(" ")}${desc}${eq}`.trim()
  };
}

function push(arr, label, value) {
  if (Number.isFinite(value)) arr.push(`${label}:${value}`);
}
