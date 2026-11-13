import { WORLD_W, CX, PLAYER_Y, DAY_LEN, LONG_NIGHT_LEN, SITE_COST, BUILD_TIME, CRAFTS } from "./config";
import { MAX_CARRY_KG } from "./rules";
import { installInventory } from "./inventory";
import { genScenery } from "./worldGeneration";
import { finiteRange, WEATHER_IDS } from "./save";
import { HEAT_SOAK_SECONDS } from "./warmth";
import { validatedAshLedger } from "./campaign44";
import { stationIds } from "./campProgress";
import { normalizeEquippedAxe } from "./equipment50";
import { coldTarget } from "./cold";
import { normalizeQuickSlots } from "./quickSlots";
import { localTemperature } from "./thermometer";
import { campEstablished, clearClaimedTrees, keepFencePostsClear } from "./campBoundary";
import { normalizeFenceTorches } from "./fenceTorches47";
import { addStatusMessage } from "./statusMessages";
import { fireFuelCapacity63, FIRE_MAX_LEVEL63 } from "./fireCapacity63";

/** Restore only validated v1 checkpoints. The factory is injected to avoid
 * circular imports with the main engine. Saved fields, fallback values,
 * sequencing and callbacks deliberately match the original in-engine path.
 * Permanent Ash purchases do not retroactively change an existing run. */
export function hydrateSavedRun(g: any, data: any, meta: any, newEngine: () => any): void {
  if (!data) return;
  // Reset transient objects without dropping bound end-of-run/fullscreen
  // callbacks. These are attached once by the React shell.
  const cb = g.cb, fsToggle = g.fsToggle;
  Object.assign(g, newEngine());
  installInventory(g,null,0);
  g.cb = cb; g.fsToggle = fsToggle;
  g.museumBuilt = !!meta?.museumBuilt;
  const n = (key: string, lo: number, hi: number, fallback: number) =>
    finiteRange(data[key], lo, hi, fallback);
  const flag = (key: string) => data[key] === true;
  const seed = n("scenerySeed", 1, 1e9, 777);
  genScenery(g, seed);
  g.player.x = finiteRange(data.player.x, 10, WORLD_W - 10, CX + 26);
  g.player.dir = data.player.dir === -1 ? -1 : 1;
  g.player.wood = finiteRange(data.player.wood, 0, MAX_CARRY_KG, 0);
  g.player.warmth = finiteRange(data.player.warmth, 1, 100, 100);
  g.heatSoak = n("heatSoak", 0, HEAT_SOAK_SECONDS, 0);
  g.player.torchT = finiteRange(data.player.torchT, 0, 60, 0);
  g.time = n("time", 0, DAY_LEN + LONG_NIGHT_LEN - 0.01, 10);
  g.night = Math.floor(n("night", 0, 100000, 0));
  g.isNight = g.time >= DAY_LEN;
  g.weather = WEATHER_IDS.includes(data.weather) ? data.weather : "clear";
  g.previousWeather = g.weather;
  g.weatherBlend = 1;
  g.dampness = n("dampness", 0, 100, 0);
  // Old v1 checkpoints never stored Cold. Derive the appropriate exposure
  // from their real time/weather/equipment once the run state is restored.
  g.aurora = flag("aurora");
  g.nightSkyEvent = data.nightSkyEvent === "parade" ? "parade" : g.aurora ? "aurora" : "none";
  g.paradeTimer = 0;
  g.fireCapacityTier63 = Math.floor(n("fireCapacityTier63", 0, FIRE_MAX_LEVEL63, 0));
  g.fuel = n("fuel", 0, fireFuelCapacity63(g), 0);
  g.fireLit = flag("fireLit") && g.fuel > 0;
  g.everLit = flag("everLit") || g.fireLit;
  g.firestarter = n("firestarter", 0, 1, 0);
  g.stage = Math.floor(n("stage", 0, 6, 0));
  g.longNightPending = flag("longNightPending");
  g.longNightActive = flag("longNightActive");
  g.endlessMode = flag("endlessMode");
  g.endlessN = Math.floor(n("endlessN", 0, 100000, 0));
  g.ashEarned = n("ashEarned", 0, 10000000, 0);
  g.ashLedger = validatedAshLedger(data.ashLedger);
  // Unmarked v1 checkpoints remain on their original five-group Long Night
  // journey; only new P44 campaign runs enter the new completion flow.
  g.campaignLevel = data.campaignLevel === 1 ? 1 : 0;
  g.campaignRunId = typeof data.campaignRunId === "string" && data.campaignRunId.length < 100
    ? data.campaignRunId : null;
  g.victoryPending = flag("victoryPending");
  g.depth = n("depth", 0, 10000, 0);
  g.builtBench = flag("builtBench");
  g.builtPile = flag("builtPile");
  g.benchLogs = n("benchLogs", 0, SITE_COST, 0);
  g.pileLogs = n("pileLogs", 0, SITE_COST, 0);
  g.benchBuildT = n("benchBuildT", -1, BUILD_TIME, -1);
  g.pileBuildT = n("pileBuildT", -1, BUILD_TIME, -1);
  g.campUpgrades = Object.fromEntries(stationIds.map(id => [
    id, Math.floor(finiteRange(data.campUpgrades?.[id], 0, 2, 0))
  ]));
  // Recorded for this particular run. New purchases cannot retrofit resumed camps.
  g.fenceMastery62 = Math.floor(n("fenceMastery62", 0, 2, 0));
  g.stored = n("stored", 0, 80, 0);
  g.trees = data.trees.slice(0, 150).filter((t: any) =>
    t && typeof t === "object" && Number.isFinite(t.x) && Number.isFinite(t.y)
      && Number.isFinite(t.id)).map((t: any) => ({
    x:finiteRange(t.x,10,WORLD_W-10,20), y:finiteRange(t.y,132,165,145),
    id:Math.floor(finiteRange(t.id,1,1000000,1)),
    tier:Math.floor(finiteRange(t.tier,0,2,0)),
    variant:Math.floor(finiteRange(t.variant,0,2,0)),
    hp:Math.floor(finiteRange(t.hp,1,3,1)), hitT:0
  }));
  g.falling = (Array.isArray(data.falling) ? data.falling : []).slice(0, 150)
    .filter((t: any) => t && Number.isFinite(t.x) && Number.isFinite(t.y)
      && Number.isFinite(t.id)).map((t: any) => ({
      x:finiteRange(t.x,0,WORLD_W,0),y:finiteRange(t.y,132,165,145),
      id:Math.floor(finiteRange(t.id,1,1000000,1)),
      tier:Math.floor(finiteRange(t.tier,0,2,0)),
      variant:Math.floor(finiteRange(t.variant,0,2,0)),
      wood:Math.floor(finiteRange(t.wood,1,3,1)),
      t:finiteRange(t.t,0,0.55,0),
      dir:t.dir === -1 ? -1 : 1,hitT:0
    }));
  g.treeId = Math.max(Math.floor(n("treeId", 1, 1000001, 1)),
    ...g.trees.map((t: any) => t.id + 1),
    ...g.falling.map((t: any) => t.id + 1));
  g.pickups = data.pickups.slice(0, 200).filter((p: any) => p &&
    Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.w))
    .map((p: any) => ({
      x:finiteRange(p.x,0,WORLD_W,0),
      y:finiteRange(p.y,130,170,145),
      w:Math.floor(finiteRange(p.w,1,12,1))
    }));
  g.crafts = {};
  for (const c of CRAFTS) if (data.crafts && data.crafts[c.id] === true) g.crafts[c.id] = true;
  g.equippedAxe = normalizeEquippedAxe(data.equippedAxe,g,meta);
  // Import sanitized canonical Pine Logs from new runs, or upgrade older
  // wood-only checkpoints without modifying their version-one save key.
  installInventory(g,data.inventory,finiteRange(data.player.wood,0,MAX_CARRY_KG,0));
  g.cold = n("cold", 0, 100, coldTarget(g, meta));
  g.quickSlots = normalizeQuickSlots(data.quickSlots);
  // The instrument is display-only. Its reading is derived from the
  // restored world weather/season, not from player insulation or Cold.
  g.thermometerTemp = localTemperature(g);
  // New optional fields keep old version-one checkpoints compatible.
  const legacyGuideLevel = g.stage >= 5 ? 4 : g.stage >= 2 ? 3
    : g.builtBench && g.crafts.pack ? 2 : g.builtPile ? 1 : 0;
  g.guideLevel = Math.floor(finiteRange(data.guideLevel,0,5,legacyGuideLevel));
  g.levelCompletePending = g.campaignLevel === 1 && flag("levelCompletePending") && g.guideLevel >= 3;
  g.guideChops = Math.floor(finiteRange(data.guideChops,0,100000,g.night>0?1:0));
  g.guideStokes = Math.floor(finiteRange(data.guideStokes,0,100000,g.night>0?1:0));
  g.guideStoredTen = data.guideStoredTen===true || g.stored>=10;
  // Old runs already past the first mission group remain completed. Optional
  // boolean fields extend v1 without invalidating existing checkpoints.
  g.guideTalked = flag("guideTalked") || g.guideLevel > 0;
  g.scoutVisited = flag("scoutVisited") || g.guideLevel > 0;
  g.scoutReturned = flag("scoutReturned") || g.guideLevel > 0;
  // Missing fields indicate a pre-#31 checkpoint. Completed structures or
  // past tutorial levels are grandfathered, avoiding an impossible build gate.
  const legacyFence = g.stage > 0 || g.builtBench || g.builtPile || g.guideLevel > 0;
  g.fenceLeft = data.fenceLeft === undefined ? legacyFence : data.fenceLeft === true;
  g.fenceRight = data.fenceRight === undefined ? legacyFence : data.fenceRight === true;
  g.campExpansion = Math.floor(finiteRange(data.campExpansion,0,1,0));
  if (g.campExpansion && !campEstablished(g)) g.campExpansion = 0;
  g.fenceTorches = campEstablished(g)
    ? normalizeFenceTorches(data.fenceTorches,g.campExpansion>=1)
    : normalizeFenceTorches(null);
  clearClaimedTrees(g);
  keepFencePostsClear(g);
  if (data.dog && typeof data.dog === "object" && Number.isFinite(data.dog.x)) {
    g.dog = {
      x:finiteRange(data.dog.x,10,WORLD_W-10,g.player.x),y:PLAYER_Y,
      dir:data.dog.dir === -1 ? -1 : 1,
      wood:Math.floor(finiteRange(data.dog.wood,0,2,0)),
      phase:"idle",gait:0,motion:0
    };
  }
  g.ui = g.victoryPending ? "win" : g.levelCompletePending ? "levelComplete" : "run";
  if (g.victoryPending) g.lastResult = {kind:"won",nights:g.night,ash:Math.floor(g.ashEarned)};
  g.won = flag("won") || g.victoryPending;
  g.menu = null;
  g.resumeData = null;
  g.keys = {};
  g.pointers = {};
  g.pleft = false; g.pright = false;
  addStatusMessage(g, "Run restored. The fire is waiting.");
}



