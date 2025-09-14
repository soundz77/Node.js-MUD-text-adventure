const updateLocationAndPlayer = (location, locationData) => {
  return {
    ...location,
    description: locationData.description,
    exits: locationData.exits,
    creatures: locationData.creatures,
    artifacts: locationData.artifacts
  };
};

export default updateLocationAndPlayer;
