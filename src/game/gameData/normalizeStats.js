// utils/normalizeStats.js
/**
 * Ensure obj.stats exists and stays in sync with top-level fields.
 * @param {object} obj - instance (Creature, Player, etc.)
 * @param {Record<string, any>} defaults - default values per stat
 * @param {Record<string,string>} [mapping] - statsKey -> topLevelKey (if names differ)
 */
export function normalizeStats(obj, defaults, mapping = {}) {
  // create stats bag if absent
  if (!obj.stats || typeof obj.stats !== "object") obj.stats = {};

  for (const [statKey, defVal] of Object.entries(defaults)) {
    // top-level property name (may differ)
    const topKey = mapping[statKey] ?? statKey;

    // seed initial values from whichever exists
    const initial =
      obj.stats[statKey] !== undefined
        ? obj.stats[statKey]
        : obj[topKey] !== undefined
        ? obj[topKey]
        : defVal;

    // define reactive bridge: stats[statKey] <-> obj[topKey]
    Object.defineProperty(obj.stats, statKey, {
      get() {
        return obj[topKey];
      },
      set(v) {
        obj[topKey] = v;
      },
      enumerable: true,
      configurable: true
    });

    // define top-level if missing, keep it writable
    if (!Object.getOwnPropertyDescriptor(obj, topKey)) {
      Object.defineProperty(obj, topKey, {
        value: initial,
        writable: true,
        enumerable: true,
        configurable: true
      });
    } else {
      obj[topKey] = initial;
    }
  }

  return obj;
}
