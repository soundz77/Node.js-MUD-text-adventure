import gameMessages from "../../gameData/gameMessages.js";

const takeArtifact = (player, artifactName) => {
  if (!artifactName) return `What do you want to take?`;

  // remove artifact from remove
  const artifact = player.currentLocation.removeArtifact(artifactName);
  if (artifact) {
    // add to player's inventory
    player.inventory.push(artifact);
    return `Picked up ${artifact.name}`;
  }
  return gameMessages.unknownArtifact;
};

export default takeArtifact;
