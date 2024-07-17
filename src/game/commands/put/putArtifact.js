const putArtifact = (player, artifactName) => {
  const index = player.inventory.findIndex(
    (artifact) => artifact.name.toLowerCase() === artifactName.toLowerCase()
  );

  if (index === -1) {
    return `Artifact not found in inventory: ${artifactName}`;
  }

  const [removedArtifact] = player.inventory.splice(index, 1);
  player.currentLocation.addArtifact(removedArtifact);
  return `Dropped ${removedArtifact.name}`;
};

export default putArtifact;
