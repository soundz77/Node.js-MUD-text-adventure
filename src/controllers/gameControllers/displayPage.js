import game from "../../game/startGame.js";

// Render the main page of the game

const displayPage = (req, res) => {
  // Define location-related data
  const currentLocation = game.player.currentLocation;
  const { description, exits, creatures, artifacts } =
    game.getLocationData(currentLocation);

  // Colate necessary location-related data
  const location = {
    description,
    creatures,
    artifacts,
    exits,
    result: game.processCommand(req.body.command),
  };

  // Collate necessary player-related data
  const player = {
    name: req.session.playerName,
    class: req.session.playerClass,
    stats: game.player.getStatsObj(),
    inventory: game.player.showInventory(),
    kills: game.player.getKills(),
  };

  // Render the ejs template
  res.status(200).render("adventure", { player, location });
};

export default displayPage;
