import { META_KEY, LEGACY_KEYS, UPGRADES } from "./config";
import { stationIds } from "./campProgress";
import { clamp } from "./math";

function saveMeta(m: any) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) { } }
function safeCount(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}
function loadMeta(): any {
  try {
    let s: any = localStorage.getItem(META_KEY);
    if (!s) for (const lk of LEGACY_KEYS) { s = localStorage.getItem(lk); if (s) break; }
    if (s) {
      const m = JSON.parse(s);
      if (m && typeof m === "object" && !Array.isArray(m)) {
        const up: any = {};
        for (const u of UPGRADES) up[u.id] = Math.min(u.max, safeCount(m.up && m.up[u.id]));
        return { ash: safeCount(m.ash), totalAsh: safeCount(m.totalAsh),
          best: safeCount(m.best), runs: safeCount(m.runs),
          wonEver: !!m.wonEver, up };
      }
    }
  } catch (e) { /* Corrupted local saves should never prevent the game starting. */ }
  return { ash: 0, totalAsh: 0, best: 0, runs: 0, wonEver: false, up: {} };
}


// ============ Safe local run checkpoint ============
// Permanent ash and upgrades remain in their existing key. This checkpoint
// only stores a pending, unfinished run; it never banks earned ash.
const RUN_KEY = "sekampfire-run-v1";
const RUN_SAVE_VERSION = 1;
const WEATHER_IDS = ["clear", "wind", "fog", "rain", "coldsnap", "blizzard"];
const finiteRange = (v: any, lo: number, hi: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;
function clearRunSnapshot() {
  try { localStorage.removeItem(RUN_KEY); } catch (_e) {}
}
function captureRunSnapshot(g: any): any {
  if (g.ui !== "run" || g.over) return null;
  const keys = ["time","night","isNight","weather","aurora","nightSkyEvent","fuel","fireLit","everLit",
    "firestarter","stage","longNightPending","longNightActive","endlessMode","endlessN",
    "ashEarned","won","victoryPending","depth","builtBench","builtPile","benchLogs","pileLogs",
    "benchBuildT","pileBuildT","stored","treeId","scenerySeed","campUpgrades"];
  const state: any = {};
  for (const key of keys) state[key] = g[key];
  // Keep the existing v1 checkpoint key/version. Persist only validated tier
  // numbers; old checkpoints simply load all station levels as zero.
  state.campUpgrades = Object.fromEntries(stationIds.map(id => [
    id, Math.min(2, Math.max(0, Math.floor(Number(g.campUpgrades?.[id]) || 0)))
  ]));
  state.player = { x: g.player.x, dir: g.player.dir, wood: g.player.wood,
    warmth: g.player.warmth, torchT: g.player.torchT };
  state.trees = g.trees.map((t: any) => ({
    x:t.x,y:t.y,id:t.id,tier:t.tier,variant:t.variant,hp:t.hp
  }));
  state.pickups = g.pickups.map((p: any) => ({x:p.x,y:p.y,w:p.w}));
  state.falling = g.falling.map((t: any) => ({
    x:t.x,y:t.y,id:t.id,tier:t.tier,variant:t.variant,wood:t.wood,
    t:t.t,dir:t.dir
  }));
  state.crafts = { ...g.crafts };
  return { version: RUN_SAVE_VERSION, state };
}
function saveRunSnapshot(g: any) {
  const snap = captureRunSnapshot(g);
  if (!snap) return;
  try { localStorage.setItem(RUN_KEY, JSON.stringify(snap)); } catch (_e) {}
}
function loadRunSnapshot(): any {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw || raw.length > 240000) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== RUN_SAVE_VERSION || !data.state) return null;
    const v = data.state;
    if (!v.player || !Array.isArray(v.trees) || !Array.isArray(v.pickups)) return null;
    if (v.trees.length > 150 || v.pickups.length > 200) return null;
    if (v.falling !== undefined && (!Array.isArray(v.falling) || v.falling.length > 150)) return null;
    if (!Number.isFinite(v.player.x) || !Number.isFinite(v.time)) return null;
    return v;
  } catch (_e) { return null; }
}

export { loadMeta, saveMeta, clearRunSnapshot, captureRunSnapshot, saveRunSnapshot, loadRunSnapshot, finiteRange, WEATHER_IDS };
