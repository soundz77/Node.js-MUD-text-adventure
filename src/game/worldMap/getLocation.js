const getLocation = (locationsMap, id) => {
  return locationsMap.get(id) || null;
};

export default getLocation;
