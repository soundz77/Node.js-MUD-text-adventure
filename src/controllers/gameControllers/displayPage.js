// controllers/gameControllers/displayPage.js
import { getGame } from "../../game/startGame.js";

const listToText = (v) =>
  Array.isArray(v) ? v.join(", ") : (v ?? "").toString();

export default function displayPage(req, res, next) {
  try {
    const game = getGame();

    // ----- Player bits -----
    const stats = game?.player?.getStatsObj?.() ?? {};
    const inventoryRaw = game?.player?.showInventory?.() ?? [];
    const kills = Number.isFinite(game?.player?.getKills?.())
      ? game.player.getKills()
      : 0;

    const player = {
      name: req.session.playerName || "No name provided",
      class: req.session.playerClass || "No class provided",
      stats: {
        level: Number(stats.level) || 0,
        health: Number(stats.health) || 0,
        stamina: Number(stats.stamina) || 0,
        strength: Number(stats.strength) || 0,
        defence: Number(stats.defence) || 0,
        attack: Number(stats.attack) || 0,
        experience: Number(stats.experience) || 0
      },
      inventory: listToText(inventoryRaw),
      kills
    };

    // ----- Location bits (from current Location instance) -----
    const curLoc = game?.player?.currentLocation;

    const details = curLoc?.getDetails?.();

    if (!curLoc || !details) {
      // Hard fail early with a readable error (prevents silent 500 during EJS render)
      throw new Error(
        "Player has no current location or getDetails() returned null/undefined."
      );
    }

    // Ensure the EJS template gets exactly what it expects
    const location = {
      id: curLoc.id ?? details.id ?? "", // needed by data-room-id
      name: details.name ?? "",
      description: details.description ?? "",
      players: listToText(details.players ?? []), // join arrays for readable text
      exits: listToText(details.exits ?? []),
      creatures: Array.isArray(details.creatures) ? details.creatures : [],
      artifacts: Array.isArray(details.artifacts) ? details.artifacts : [],
      message: details.message ?? ""
    };

    console.log(player, location);
    return res.status(200).render("adventure", { player, location });
  } catch (err) {
    console.error("displayPage error:", err);
    return next(err);
  }
}
