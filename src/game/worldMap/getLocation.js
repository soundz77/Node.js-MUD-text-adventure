const getLocation = (locationsMap, name) => {
  return locationsMap.get(name) || null;
};

export default getLocation;
