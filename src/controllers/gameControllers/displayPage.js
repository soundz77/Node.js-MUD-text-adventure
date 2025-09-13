// routes/displayPage.js
import game from "../../game/startGame.js";

export default function displayPage(req, res) {
  const loc = game.getLocationData(game.player.currentLocation);
  const player = {
    name: req.session.playerName,
    class: req.session.playerClass,
    stats: game.player.getStatsObj(),
    inventory: game.player.showInventory(),
    kills: game.player.getKills(),
    changes: loc.changes || ""
  };
  res.status(200).render("adventure", {
    player,
    location: { ...loc, result: "" },
    loc
  });
}
