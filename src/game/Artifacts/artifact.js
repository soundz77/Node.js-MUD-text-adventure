class Artifact {
  constructor(name, description, condition) {
    this.name = name;
    this.description = description;
    this.condition = condition;
    this.value = 10; // not supported yet (use to sell artifacts)
  }

  getFullDetails() {
    return `${this.name}: ${this.description}, Condition: ${this.condition}`;
  }

  getBasicDetails() {
    return `${this.name}`;
  }
}

export default Artifact;
