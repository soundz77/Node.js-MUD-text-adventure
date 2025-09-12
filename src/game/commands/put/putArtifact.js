import gameMessages from "../../gameData/gameMessages.js";

const putArtifact = (player, artifactName) => {
  if (!artifactName || typeof artifactName !== "string") {
    return (
      gameMessages.noArtifactSpecified ||
      "You must specify an artifact to drop."
    );
  }

  const normalized = artifactName.toLowerCase();
  const index = player.inventory.findIndex(
    (artifact) => artifact.name?.toLowerCase() === normalized
  );

  if (index === -1) {
    return `${
      gameMessages.noSuchArtifact || "No such artifact"
    }: ${artifactName}`;
  }

  const [removedArtifact] = player.inventory.splice(index, 1);

  if (player.currentLocation?.addArtifact) {
    player.currentLocation.addArtifact(removedArtifact);
    return `${gameMessages.dropped || "Dropped"} ${removedArtifact.name}.`;
  }

  // fallback if no valid location
  return `You dropped ${removedArtifact.name}, but it vanished into the void...`;
};

export default putArtifact;
