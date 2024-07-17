const retaliation = (game, target) => {
  const result = target.attackTarget(game.player); // Return the message and damage
  return result; // = { message: String, damage: Number }
};

export default retaliation;
