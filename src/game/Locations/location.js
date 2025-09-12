class Location {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.exits = {};
    this.creatures = this.creatures || [];
    this.artifacts = this.artifacts || [];
    this.players = this.players || [];
  }

  // Set
  setExit(direction, location) {
    this.exits[direction.toLowerCase()] = location;
  }

  // Get
  getExit(direction) {
    const exit = this.exits[direction.toLowerCase()];
    return exit;
  }

  getDescription() {
    return this.description;
  }

  getDetails() {
    return {
      description: this.getDescription(),
      exits: Object.keys(this.exits).join(", ").trim(),
      artifacts: this.showArtifacts(),
      creatures: this.showCreatures(),
      players: this.showPlayers()
    };
  }

  // Show
  showArtifacts() {
    if (this.artifacts.length === 0) return "";
    return `${this.artifacts.map((artifact) => artifact.name).join(", ")}`;
  }

  showCreatures() {
    if (this.creatures.length === 0) return "";
    return `${this.creatures.map((character) => character.name).join(", ")}`;
  }

  showPlayers() {
    if (this.players.length === 0) return "";
    return `${this.players.map((artifact) => artifact.name).join(", ")}`;
  }

  // Add
  addCreature(character) {
    this.creatures.push(character);
    // console.log(`Added character: ${character.name} to ${this.name}`);
  }

  addArtifact(artifact) {
    this.artifacts.push(artifact);
    // console.log(`Added artifact: ${artifact.name} to ${this.name}`);
  }

  addPlayer(player) {
    this.players = this.players || [];
    if ((this, this.players.includes(player))) this.players.push(player);
  }

  // Remove
  removePlayer(player) {
    if (!Array.isArray(this.players)) return;
    const i = this.players.indexOf(player);
    if (i >= 0) this.players.splice(i, 1);
  }

  removeArtifact(artifactName) {
    const index = this.artifacts.findIndex(
      (artifact) => artifact.name.toLowerCase() === artifactName.toLowerCase()
    );
    if (index !== -1) {
      const [removedArtifact] = this.artifacts.splice(index, 1);
      return removedArtifact;
    }
    return null;
  }
}

export default Location;
