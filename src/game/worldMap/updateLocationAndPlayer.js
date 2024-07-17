const updateLocationAndPlayer = (location, locationData) => {
  location.description = locationData.description;
  location.exits = locationData.exits;
  location.creatures = locationData.creatures;
  location.artifacts = locationData.artifacts;
  return location;
};

export default updateLocationAndPlayer;
