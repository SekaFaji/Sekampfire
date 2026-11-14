import { CX, BUILD_TIME, DAY_LEN, LONG_NIGHT_LEN, NIGHT_LEN, W, H } from "./config";
import { campEstablished } from "./campBoundary";
import { clamp } from "./math";
import { drawTextC } from "./font";
import { px } from "./renderUtils";

/** Small, physical run-only shelter. The door sits between the Fireplace
 * and Log Storage, but a narrow reach radius preserves both interactions.
 * No duplicate camp-stage, Ash-Shop or recipe ownership is introduced. */
export const HUT_DOOR_X = CX + 28;
export const HUT_REACH = 9;
export const HUT_LOG_COST = 25;
export const HUT_WARMTH_DRAIN_FACTOR = 0.35; // 65% less normal Warmth loss
export const HUT_SLEEP_STEP = 0.25; // real simulation, not a time teleport
export const HUT_MAX_SLEEP_STEPS = 256; // covers 46-second Long Night too

export function nearDebrisHut(g: any): boolean {
  return campEstablished(g) && Number.isFinite(g?.player?.x) &&
    Math.abs(g.player.x - HUT_DOOR_X) < HUT_REACH;
}

export function leaveDebrisHut(g: any): void {
  g.hutInside = false;
  g.menu = null;
  g.menuSel = 0;
  g.hutSleepMessage = "";
  g.keys.act = false;
  g.pressE = false;
}

export function interactDebrisHut(g: any): string {
  if (g.ui !== "run" || g.over || g.menu || !nearDebrisHut(g))
    return "STAND AT THE DEBRIS HUT SITE.";
  g.keys.act = false;
  g.pressE = false;
  if (g.hutBuilt) {
    g.hutInside = true;
    g.menu = "hut";
    g.menuSel = 0;
    g.hutSleepMessage = "";
    g.player.x = HUT_DOOR_X;
    g.player.chopT = 0;
    g.player.chopTree = null;
    g.pleft = false;
    g.pright = false;
    g.keys.left = false;
    g.keys.right = false;
    return "ENTERED THE DEBRIS HUT.";
  }
  if (g.hutBuildT >= 0) return "THE DEBRIS HUT IS BEING RAISED.";
  if (g.hutLogs >= HUT_LOG_COST) {
    g.hutBuildT = 0;
    return "RAISING THE DEBRIS HUT. BRANCHES, LEAVES, AND LOGS.";
  }
  const available = Math.max(0, Math.floor(Number(g.player?.wood) || 0));
  if (!available) return "BRING 25 PINE LOGS TO BUILD THE DEBRIS HUT.";
  const amount = Math.min(available, HUT_LOG_COST - g.hutLogs);
  g.player.wood -= amount;
  g.hutLogs += amount;
  return g.hutLogs >= HUT_LOG_COST
    ? "25/25 LOGS. PRESS ACT TO BUILD THE DEBRIS HUT."
    : "DEBRIS HUT: " + g.hutLogs + "/25 LOGS STACKED.";
}

export function advanceDebrisHutBuild(g: any, dt: number): boolean {
  if (g.hutBuilt || !campEstablished(g) || !(g.hutBuildT >= 0)) return false;
  g.hutBuildT = clamp(g.hutBuildT + Math.max(0, Number.isFinite(dt) ? dt : 0), 0, BUILD_TIME);
  if (g.hutBuildT < BUILD_TIME) return false;
  g.hutBuildT = -1;
  g.hutLogs = HUT_LOG_COST;
  g.hutBuilt = true;
  return true;
}

export type HutSleepResult = "dawn" | "dead" | "unavailable" | "interrupted";

/** Sleep runs the SAME game update as active play in bounded fixed steps.
 * It cannot grant instant immunity, invent resources, skip the real dawn
 * award, bypass the 7-dawn torch clock or turn off the Long Night. */
export function sleepUntilDawn(g: any, advance: (dt: number) => void): HutSleepResult {
  if (!g.hutBuilt || !g.hutInside || g.menu !== "hut" ||
      g.ui !== "run" || g.over || !g.isNight) return "unavailable";
  g.pressE = false;
  g.keys.act = false;
  g.keys.left = false;
  g.keys.right = false;
  g.pleft = false;
  g.pright = false;
  for (let i = 0; i < HUT_MAX_SLEEP_STEPS && g.isNight &&
       g.ui === "run" && !g.over && g.menu === "hut"; i++) {
    const total = DAY_LEN + (g.longNightActive ? LONG_NIGHT_LEN : NIGHT_LEN);
    const remain = Math.max(0, total - g.time);
    // Including the exact boundary triggers existing sunrise and Ash rules.
    advance(Math.min(HUT_SLEEP_STEP, Math.max(remain, 0.000001)));
  }
  if (g.over || g.ui === "dead") {
    g.hutInside = false;
    g.menu = null;
    return "dead";
  }
  if (g.ui !== "run" || g.menu !== "hut") {
    g.hutInside = false; // campaign finish or Long Night victory
    return "interrupted";
  }
  return !g.isNight ? "dawn" : "interrupted";
}

export function debrisHutRows(g: any, sleep: () => HutSleepResult): any[] {
  return [{
    label: "SLEEP UNTIL DAWN",
    right: g.isNight ? "REST" : "NIGHT ONLY",
    enabled: g.isNight && g.ui === "run" && !g.over,
    onDown: () => {
      if (!g.isNight) {
        g.hutSleepMessage = "WAIT FOR NIGHTFALL TO SLEEP.";
        return;
      }
      const result = sleep();
      if (result === "dawn") g.hutSleepMessage = "DAWN. YOU SURVIVED THE NIGHT.";
      else if (result === "interrupted" && g.ui === "run")
        g.hutSleepMessage = "SLEEP INTERRUPTED.";
    }
  },{
    label: "EXIT HUT", right: "", enabled: true, onDown: () => leaveDebrisHut(g)
  }];
}

/** World-space, 320x180 native-pixel shelter tucked behind the campfire.
 * The floor stays visible and the small entrance faces the foreground. */
export function drawDebrisHutExterior(ctx: any, g: any): void {
  if (g.ui !== "run" || !campEstablished(g)) return;
  const x = HUT_DOOR_X;
  if (!g.hutBuilt) {
    // A real, distinct building site behind the small campfire.
    px(ctx, x - 15, 142, 30, 2, "#715236");
    px(ctx, x - 13, 135, 2, 11, "#9a7650");
    px(ctx, x + 11, 135, 2, 11, "#9a7650");
    px(ctx, x - 13, 135, 26, 1, "#dfba7b");
    const progress = Math.min(HUT_LOG_COST, Math.max(0, Number(g.hutLogs) || 0));
    for (let i = 0; i < Math.ceil(progress / 5); i++) {
      px(ctx, x - 12 + i * 5, 139 - (i % 2), 5, 3, "#805535");
      px(ctx, x - 11 + i * 5, 139 - (i % 2), 3, 1, "#c0935c");
    }
    if (g.hutBuildT >= 0) {
      px(ctx, x - 17, 124, 34, 10, "#5f6640");
      px(ctx, x - 11, 121, 22, 3, "#987d4a");
      px(ctx, x - 12, 116, 24 * clamp(g.hutBuildT / BUILD_TIME, 0, 1), 2, "#f3cc82");
    }
    return;
  }
  // Low, asymmetrical A-frame of debris, moss, leaves and rough branches.
  px(ctx, x - 19, 143, 38, 4, "#493a2b");
  for (let i = 0; i < 16; i++) {
    const width = 38 - i * 2;
    px(ctx, x - width / 2, 142 - i * 2, width, 3,
      i % 3 === 0 ? "#4e663f" : i % 2 ? "#5c6944" : "#77704a");
  }
  for (let i = 0; i < 8; i++) {
    const xx = x - 16 + i * 4;
    px(ctx, xx, 134 - Math.floor((8 - Math.abs(i - 3.5) * 2)), 3, 2,
      i % 2 ? "#a17b45" : "#8b6c3e");
  }
  // Dark, person-sized opening and a dirt threshold; intentionally cramped.
  px(ctx, x - 5, 130, 10, 16, "#302b28");
  px(ctx, x - 4, 133, 8, 12, "#151d20");
  px(ctx, x - 3, 144, 7, 2, "#977047");
  px(ctx, x - 21, 145, 44, 2, "#4a4933");
}

/** Tight sheltered interior. Two genuine touch controls share the exact
 * action rows used by keyboard selection; no separate reward-only screen. */
export function drawDebrisHutInterior(ctx: any, g: any, rows: any[]): void {
  px(ctx, 0, 0, W, H, "#141a1b");
  px(ctx, 8, 8, 304, 164, "#292c26");
  px(ctx, 12, 12, 296, 154, "#393b2e");
  px(ctx, 17, 24, 286, 116, "#4b4532");
  // Uneven layers of branches and pine litter make the space feel enclosed.
  for (let i = 0; i < 30; i++) {
    px(ctx, 16 + i * 10, 16 + (i % 5), 5, 17, i % 3 ? "#5a4933" : "#80613c");
    px(ctx, 16 + i * 10, 126 + (i % 4), 6, 9, i % 2 ? "#68593b" : "#807448");
  }
  for (let i = 0; i < 10; i++) {
    const inset = i * 9;
    px(ctx, 17 + inset, 30 + i * 8, 11, 3, i % 2 ? "#a08954" : "#625137");
    px(ctx, 292 - inset, 30 + i * 8, 11, 3, i % 2 ? "#a08954" : "#625137");
  }
  // A small daylight crack on the rear wall; rain cannot enter the shelter.
  px(ctx, 223, 50, 15, 19, "#292f2c");
  px(ctx, 226, 52, 8, 13, g.isNight ? "#556575" : "#9baca2");
  px(ctx, 227, 51, 2, 14, "#574831");
  // Packed-bough sleeping nest, with the character curled into it.
  px(ctx, 77, 97, 155, 29, "#292b25");
  for (let i = 0; i < 24; i++) {
    px(ctx, 79 + i * 6, 97 + (i % 4) * 5, 9, 2, i % 2 ? "#64704a" : "#8a8455");
  }
  px(ctx, 112, 105, 78, 14, "#665340");
  px(ctx, 115, 103, 74, 10, "#9c7851");
  px(ctx, 110, 103, 20, 17, "#75513a"); // bent knees
  px(ctx, 126, 97, 18, 17, "#cbb08a"); // resting face
  px(ctx, 130, 95, 16, 5, "#6b513c");
  px(ctx, 143, 106, 33, 12, "#738076"); // wool blanket
  px(ctx, 148, 106, 24, 2, "#97a398");
  px(ctx, 134, 108, 2, 1, "#37291f"); // closed eye
  drawTextC(ctx, "DEBRIS HUT - LV1", 160, 14, "#f0dba7");
  drawTextC(ctx, "BRANCHES, LEAVES AND A LITTLE SPACE TO REST", 160, 36, "#dfc59c");
  drawTextC(ctx, "65 PCT LESS WARMTH LOSS - NO NEW HEAT", 160, 47, "#d4cfb7");
  drawTextC(ctx, "WARMTH " + Math.round(g.player.warmth) +
    "  COLD " + Math.round(g.cold) + "  WET " + Math.round(g.dampness), 160, 133, "#e7d39f");
  const actions = [
    {x:44,y:146,w:162,h:19},
    {x:214,y:146,w:65,h:19}
  ];
  rows.forEach((row, i) => {
    const r = actions[i];
    if (!r) return;
    const enabled = row.enabled !== false;
    px(ctx,r.x,r.y,r.w,r.h,enabled?"#66523b":"#3e4547");
    px(ctx,r.x,r.y,r.w,1,g.menuSel===i?"#f6d995":"#a88d62");
    px(ctx,r.x,r.y,1,r.h,g.menuSel===i?"#f6d995":"#a88d62");
    px(ctx,r.x,r.y+r.h-1,r.w,1,"#382c24");
    drawTextC(ctx,enabled?row.label:i===0?"NIGHT ONLY":row.label,
      r.x+r.w/2,r.y+7,enabled?"#ffe5ab":"#9ca8ab");
    g.zones.push({...r,onDown:enabled?row.onDown:undefined});
  });
  if (g.hutSleepMessage) drawTextC(ctx,g.hutSleepMessage,160,171,"#e2cc9d");
}
