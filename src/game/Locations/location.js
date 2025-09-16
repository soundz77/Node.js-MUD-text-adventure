class Location {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.exits = {};
    this.creatures = [];
    this.artifacts = [];
    this.players = [];
  }

  // Set
  setExit(direction, location) {
    this.exits[direction.toLowerCase()] = location;
    return this;
  }

  // Get
  getExit(direction) {
    return this.exits[direction.toLowerCase()];
  }

  getDescription() {
    return this.description;
  }

  getDetails() {
    return {
      id: this.id,
      name: this.name,
      description: this.getDescription() || "Test: No description",
      exits: Object.keys(this.exits).join(", ").trim() || ["Test: No exists"],
      artifacts: this.showArtifacts() || ["Test: No artifacts"],
      creatures: this.showCreatures() || ["Test: No creatures"],
      players: this.showPlayers() || ["Test: No players"]
      // message and result sent by emitter
    };
  }

  // Show
  showArtifacts() {
    if (this.artifacts.length === 0) return "No artifacts";
    return this.artifacts.map((a) => a.name ?? String(a)).join(", ");
  }

  showCreatures() {
    if (this.creatures.length === 0) return "No creatures";
    const c = this.creatures.map((c) => c.name ?? String(c)).join(", ");
    return c;
  }

  // Still returns if player names are empty
  showPlayers() {
    if (this.players.length === 0) return "No one else";
    return this.players.map((p) => p.name ?? String(p)).join(", ");
  }

  // Helpers
  hasPlayer(player) {
    // dedupe by id if present, else by object identity
    if (player && typeof player === "object" && "id" in player) {
      return this.players.some(
        (p) => p && typeof p === "object" && p.id === player.id
      );
    }
    return this.players.includes(player);
  }

  // Add
  addCreature(character) {
    this.creatures.push(character);
    return this;
  }

  addArtifact(artifact) {
    this.artifacts.push(artifact);
    return this;
  }

  addPlayer(player) {
    if (!player) return this;
    if (!this.hasPlayer(player)) {
      this.players.push(player);
    }
    return this;
  }

  // Remove
  removePlayer(player) {
    if (!Array.isArray(this.players)) return this;
    let idx = -1;
    if (player && typeof player === "object" && "id" in player) {
      idx = this.players.findIndex(
        (p) => p && typeof p === "object" && p.id === player.id
      );
    } else {
      idx = this.players.indexOf(player);
    }
    if (idx >= 0) this.players.splice(idx, 1);
    return this;
  }

  removeArtifact(artifactName) {
    const i = this.artifacts.findIndex(
      (a) => (a.name ?? "").toLowerCase() === String(artifactName).toLowerCase()
    );
    if (i !== -1) {
      const [removed] = this.artifacts.splice(i, 1);
      return removed;
    }
    return null;
  }
}

export default Location;
