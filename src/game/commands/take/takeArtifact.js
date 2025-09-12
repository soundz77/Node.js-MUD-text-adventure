import gameMessages from "../../gameData/gameMessages.js";

const takeArtifact = (player, artifactName) => {
  if (!artifactName || typeof artifactName !== "string") {
    return gameMessages.noArtifactSpecified || "What do you want to take?";
  }

  const nameNormalized = artifactName.toLowerCase();

  if (!player.currentLocation?.removeArtifact) {
    return "You cannot take artifacts here.";
  }

  // Try to remove artifact from current location
  const artifact = player.currentLocation.removeArtifact(nameNormalized);

  if (artifact) {
    player.inventory.push(artifact);
    return `${gameMessages.taken || "Picked up"} ${artifact.name}.`;
  }

  return gameMessages.unknownArtifact || `There is no ${artifactName} here.`;
};

export default takeArtifact;
