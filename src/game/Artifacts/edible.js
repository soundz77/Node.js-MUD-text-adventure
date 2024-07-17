import Artifact from "./artifact.js";

class Edible extends Artifact {
  constructor(name, description, healthEffect = 0, staminaEffect = 0) {
    super(name, description);
    this.type = "edible";
    this.healthEffect = healthEffect; // Positive or negative effect on health
    this.staminaEffect = staminaEffect; // Positive or negative effect on stamina
  }

  // Method to apply the effects of the edible artifact on the player
  consume(player) {
    player.health += this.healthEffect;
    player.stamina += this.staminaEffect;
    return `You consumed ${this.name}. Health: ${
      this.healthEffect > 0 ? "+" : ""
    }${this.healthEffect}, Stamina: ${this.staminaEffect > 0 ? "+" : ""}${
      this.staminaEffect
    }`;
  }
}

export default Edible;
