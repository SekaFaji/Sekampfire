import { STAGES } from "./config";
import { AUDIO } from "./audio";
import { CAMP_STATIONS, stationLevel, stationCost, stationAvailable, stationCraftCost, canCompleteCabin, purchaseStation } from "./campProgress";
import { campEstablished, EXPANSION_COST } from "./campBoundary";
import { grantRunAsh } from "./campaign44";
import { MUSEUM_COST, museumCount } from "./museum";
import { saveMeta } from "./save";
import { addStatusMessage } from "./statusMessages";

/** Build plans, permanent museum construction and run-only station tiers.
 * Keep two-tap confirmations and payment checks in these authoritative row
 * actions, not in Canvas input/render paths. The real-world interaction
 * checks remain in game.ts; neither saved schemas nor costs are changed. */
export function stationUpgradeRow(g: any, id: "hearth" | "bench" | "pile") {
  const info = CAMP_STATIONS[id], level = stationLevel(g, id);
  const fenced = campEstablished(g);
  const available = fenced && stationAvailable(g, id);
  const maxed = level >= 2, cost = stationCost(g, id);
  const total = g.player.wood + g.stored;
  const confirming = g.buildConfirm === id && available && !maxed && total >= cost;
  return {
    label: info.label + " LV" + level + (maxed ? " MAX" : " -> LV" + (level + 1)),
    right: maxed ? "MAX" : !fenced ? "BUILD FENCE" : !available ? "BUILD FIRST" : confirming ? "CONFIRM?" : cost + " WOOD",
    desc: maxed ? "FULLY UPGRADED" : !fenced ? "BUILD BOTH CAMP POSTS FIRST" : !available ? "BUILD THIS STATION FIRST"
      : confirming ? "TAP AGAIN TO UPGRADE" : info.benefits[level],
    h: 15, enabled: available && !maxed && total >= cost,
    onDown: () => {
      if (!fenced) { g.buildConfirm = null; addStatusMessage(g, "BUILD BOTH CAMP POSTS FIRST."); return; }
      if (!available) { g.buildConfirm = null; addStatusMessage(g, "BUILD THE " + info.label + " FIRST."); return; }
      if (maxed) { g.buildConfirm = null; addStatusMessage(g, info.label + " IS MAX LEVEL."); return; }
      if (g.player.wood + g.stored < cost) { g.buildConfirm = null; addStatusMessage(g, "NOT ENOUGH WOOD."); return; }
      if (g.buildConfirm !== id) { g.buildConfirm = id; return; }
      g.buildConfirm = null;
      if (!purchaseStation(g, id)) { addStatusMessage(g, "NOT ENOUGH WOOD."); return; }
      grantRunAsh(g,"stations",2);
      AUDIO.effect("build");
      addStatusMessage(g, info.label + " NOW LEVEL " + stationLevel(g, id) + ".");
    }
  };
}

export function doBuildAction(g: any, meta: any) {
  if (!campEstablished(g)) { addStatusMessage(g,"BUILD BOTH CAMP POSTS FIRST."); return; }
  if (g.stage >= 6) { g.menu = null; return; }
  if (g.stage === 5 && g.guideLevel < 4) { addStatusMessage(g, "FINISH GROOTYS FIRST FOUR MISSIONS BEFORE THE CABIN."); return; }
  if (g.stage === 5 && !canCompleteCabin(g)) { addStatusMessage(g, "UPGRADE FIREPLACE, WORKBENCH & LOG STORAGE TO LV1 FIRST."); return; }
  const cost = Math.round(STAGES[g.stage].cost * (meta.up.blue ? 0.8 : 1));
  if (g.player.wood + g.stored < cost) { addStatusMessage(g, "Not enough wood."); return; }
  const fromCarried = Math.min(g.player.wood, cost);
  g.player.wood -= fromCarried;
  g.stored -= cost - fromCarried;
  g.stage++;
  grantRunAsh(g,"structures",4);
  AUDIO.effect("build");
  g.menu = null;
  g.keys.act = false;
  addStatusMessage(g, STAGES[g.stage - 1].name + " built.");
  if (g.stage === 4) addStatusMessage(g, "The shed is up. The wood pile holds 40 now.");
  if (g.stage === 6) {
    g.longNightPending = true;
    addStatusMessage(g, "The cabin is complete. Something howls in the distance.");
    addStatusMessage(g, "THE LONG NIGHT comes at nightfall. Stock up on wood.");
  }
}

export function buildRows(g: any, meta: any) {
  const rows: any[] = [];
  const total = () => g.player.wood + g.stored;
  if (g.stage < 6) {
    const cost = Math.round(STAGES[g.stage].cost * (meta.up.blue ? 0.8 : 1));
    const needsStations = g.stage === 5 && !canCompleteCabin(g);
    const needsGuide = g.stage === 5 && g.guideLevel < 4;
    const needsFence = !campEstablished(g);
    rows.push({
      label: STAGES[g.stage].name.toUpperCase(),
      right: needsFence ? "BUILD FENCE" : needsGuide ? "FINISH M1-4" : needsStations ? "3 STATIONS LV1" : g.buildConfirm === "stage" ? "CONFIRM?" : cost + " WOOD",
      desc: needsFence ? "PLACE ONE LOG AT EACH CAMP BOUNDARY" : needsGuide ? "COMPLETE GROOTYS FIRST FOUR MISSIONS" : needsStations ? "HEARTH, BENCH AND STORAGE LV1 FIRST" :
        g.buildConfirm === "stage" ? "TAP AGAIN TO BUILD" : STAGES[g.stage].desc.toUpperCase(),
      h: 15, enabled: !needsFence && !needsGuide && !needsStations && total() >= cost,
      onDown: () => {
        if (needsFence) { g.buildConfirm = null; addStatusMessage(g, "BUILD BOTH CAMP POSTS FIRST."); return; }
        if (needsGuide) { g.buildConfirm = null; addStatusMessage(g, "FINISH GROOTYS FIRST FOUR MISSIONS."); return; }
        if (needsStations) { g.buildConfirm = null; addStatusMessage(g, "UPGRADE FIREPLACE, WORKBENCH & LOG STORAGE TO LV1 FIRST."); return; }
        if (total() < cost) { g.buildConfirm = null; addStatusMessage(g, "NOT ENOUGH WOOD."); return; }
        if (g.buildConfirm !== "stage") { g.buildConfirm = "stage"; return; }
        g.buildConfirm = null;
        doBuildAction(g, meta);
      },
    });
  }
  if (campEstablished(g) && g.campExpansion < 1) {
    rows.push({
      label: "EASTERN CAMP EXPANSION",
      right: EXPANSION_COST + " WOOD",
      desc: "PLACE FIVE LOGS AT THE EAST FENCE MARKER",
      h: 15, enabled: total() >= EXPANSION_COST,
      onDown: () => addStatusMessage(g,"WALK TO THE EAST FENCE MARKER AND PRESS ACT."),
    });
  }
  // One-time permanent structure: once purchased it appears in every later
  // run and the unique log collection lives in persistent meta, not run wood.
  const museumLocked = !meta.museumBuilt && g.campExpansion < 1;
  rows.push({
    label:meta.museumBuilt ? "VISIT LOG MUSEUM" : "BUILD LOG MUSEUM",
    right:meta.museumBuilt ? museumCount(meta)+"/4 FOUND"
      : museumLocked ? "EXPAND CAMP" : g.buildConfirm==="museum" ? "CONFIRM?" : MUSEUM_COST+" WOOD",
    desc:meta.museumBuilt ? "PERMANENT COLLECTION - TAP TO VIEW" :
      museumLocked ? "CLAIM EASTERN LAND BEFORE BUILDING HERE" :
      g.buildConfirm==="museum" ? "TAP AGAIN TO BUILD PERMANENT MUSEUM"
      : "KEEP SPECIAL LOGS THROUGH ALL RUNS",
    h:15,enabled:!!meta.museumBuilt || (!museumLocked && total()>=MUSEUM_COST),
    onDown:()=>{
      if(meta.museumBuilt){g.buildConfirm=null;g.menu="museum";return;}
      if(museumLocked){g.buildConfirm=null;addStatusMessage(g,"EXPAND CAMP EAST TO UNLOCK THE MUSEUM SITE.");return;}
      if(total()<MUSEUM_COST){g.buildConfirm=null;addStatusMessage(g,"NOT ENOUGH WOOD.");return;}
      if(g.buildConfirm!=="museum"){g.buildConfirm="museum";return;}
      g.buildConfirm=null;
      const fromCarried=Math.min(g.player.wood,MUSEUM_COST);
      g.player.wood-=fromCarried;
      g.stored-=MUSEUM_COST-fromCarried;
      meta.museumBuilt=true;
      g.museumBuilt=true;
      saveMeta(meta);
      AUDIO.effect("build");
      addStatusMessage(g,"LOG MUSEUM BUILT FOREVER! VIEW YOUR COLLECTION.");
    }
  });
  return rows;
}

