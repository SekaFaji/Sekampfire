// ============ constants ============
const W = 320, H = 180, GROUND = 128, PLAYER_Y = 152;
// Lift only the world rendering to leave room for decorative foreground water.
const SCENE_LIFT = 20, WATER_Y = 142;
const WORLD_W = 1600, CX = WORLD_W / 2;
const DAY_LEN = 42, NIGHT_LEN = 32, LONG_NIGHT_LEN = 46;
const META_KEY = "sekampfire-meta-v1";
const LEGACY_KEYS = ["sekaire-meta-v1", "emberwood-meta-v2"];
const SHED_X = CX - 72;
const BENCH_X = CX - 50;
const PILE_X = CX + 44;
const SITE_COST = 15;
const BUILD_TIME = 7; // seconds of hammering before a site finishes

const STAGES = [
  { name: "Wood Ring", cost: 8, desc: "A ring of stacked logs blocks the wind. The fire burns slower in gusts." },
  { name: "Log Bench", cost: 12, desc: "A place to rest. Warmth returns faster near the fire." },
  { name: "Lean-to", cost: 20, desc: "A roof over the fire. Rain no longer dampens it." },
  { name: "Woodshed", cost: 30, desc: "A proper shed. The wood pile by the fire holds 40." },
  { name: "Cabin Walls", cost: 45, desc: "Walls block the cold near camp. Warmth drains much less." },
  { name: "Cabin and Hearth", cost: 65, desc: "A true home. Completing it summons the Long Night." },
];

// run-scoped crafts bought at the workbench with wood
const CRAFTS = [
  { id: "pack", name: "Timber Pack", cost: 6, desc: "CARRY 8 MORE WOOD" },
  { id: "boots", name: "Warm Boots", cost: 4, desc: "WALK FASTER THROUGH SNOW" },
  { id: "maul", name: "Wood Axe", cost: 5, desc: "CHOP FASTER" },
  { id: "refl", name: "Fire Reflector", cost: 8, desc: "THE FIRE BURNS SLOWER" },
];

const UPGRADES = [
  { id: "blood", name: "Warm Blood", costs: [12, 26, 45], max: 3, desc: "COLD DRAINS YOU LESS EACH LEVEL" },
  { id: "flint", name: "Old Flint", costs: [14], max: 1, desc: "START EVERY RUN WITH THE FIRE LIT" },
  { id: "pack", name: "Big Backpack", costs: [16], max: 1, desc: "CARRY 8 MORE WOOD" },
  { id: "axe", name: "Grandpas Axe", costs: [20], max: 1, desc: "CHOP ALMOST TWICE AS FAST" },
  { id: "blue", name: "Blueprints", costs: [22], max: 1, desc: "ALL BUILDING COSTS 20 PERCENT LESS" },
  { id: "scarf", name: "Everwarm Scarf", costs: [30], max: 1, desc: "TORCHES LAST 50S INSTEAD OF 30S" },
  { id: "dog", name: "Good Dog", costs: [40], max: 1, desc: "A GOOD DOG FETCHES STICKS FOR YOU" },
];

const WEATHER_TEXT: Record<string, string> = {
  clear: "CLEAR",
  wind: "WINDY",
  fog: "FOG",
  rain: "RAIN",
  coldsnap: "COLD SNAP",
  blizzard: "BLIZZARD",
};

export { W, H, GROUND, PLAYER_Y, SCENE_LIFT, WATER_Y, WORLD_W, CX, DAY_LEN, NIGHT_LEN, LONG_NIGHT_LEN, META_KEY, LEGACY_KEYS, SHED_X, BENCH_X, PILE_X, SITE_COST, BUILD_TIME, STAGES, CRAFTS, UPGRADES, WEATHER_TEXT };
