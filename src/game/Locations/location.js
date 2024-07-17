class Location {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.exits = {};
    this.creatures = [];
    this.artifacts = [];
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

  // Add
  addCreature(character) {
    this.creatures.push(character);
    // console.log(`Added character: ${character.name} to ${this.name}`);
  }

  addArtifact(artifact) {
    this.artifacts.push(artifact);
    // console.log(`Added artifact: ${artifact.name} to ${this.name}`);
  }

  // Remove
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

  removeCreature(character) {
    const index = this.creatures.indexOf(character);
    if (index > -1) {
      this.creatures.splice(index, 1);
    }
  }
}

export default Location;
