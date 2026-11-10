import { CX } from "./config";
import { campEstablished } from "./campBoundary";
import { px } from "./renderUtils";

/** Patch 43: first campaign-level foundation. The older five run-local
 * guide groups remain intact until campaign completion/Ash rules are migrated.
 * These first three groups are the proposed First Settlement milestones. */
export const FIRST_SETTLEMENT = {
  level: 1,
  title: "THE FIRST SETTLEMENT",
  milestones: [
    { id: "establish", title: "ESTABLISH & EXPLORE", guideIndex: 0 },
    { id: "storage", title: "LOG STORAGE", guideIndex: 1 },
    { id: "workbench", title: "THE WORKBENCH", guideIndex: 2 },
  ],
} as const;

/** Fixed, short and reachable nighttime scouting destination, beyond the
 * original eastern camp fence but well inside the existing 1600px world. */
export const SCOUT_GROVE_X = CX + 164;
export const SCOUT_GROVE_RADIUS = 15;
export const HOME_RETURN_RADIUS = 22;

export function firstSettlementProgress(g: any) {
  const index = Number.isFinite(g.guideLevel) ? Math.floor(g.guideLevel) : 0;
  const milestone = FIRST_SETTLEMENT.milestones.find(m => m.guideIndex === index) || null;
  return {
    level: FIRST_SETTLEMENT.level,
    levelTitle: FIRST_SETTLEMENT.title,
    milestone,
    milestoneNumber: milestone ? milestone.guideIndex + 1 : null,
    totalMilestones: FIRST_SETTLEMENT.milestones.length,
    // Guide indices 3-4 still contain the existing cabin/Long Night lessons.
    // They are not silently counted as new campaign levels or milestones.
    legacyCampChallenges: index >= 3 && index < 5,
  };
}

/** Only a real NIGHT visit counts. After reaching the grove, the player
 * must return to the campfire. A missed night is retryable next night,
 * without losing camp progress or requiring combat/new items. */
export function trackNightScout(g: any, notify: (message: string) => void): void {
  if (g.ui !== "run" || g.over || g.guideLevel !== 0 ||
      !g.isNight || g.night < 1 || !g.everLit ||
      (g.guideStokes || 0) < 1 || !campEstablished(g)) return;
  if (!g.scoutVisited && Math.abs(g.player.x - SCOUT_GROVE_X) <= SCOUT_GROVE_RADIUS) {
    g.scoutVisited = true;
    notify("GROOTY: YOU FOUND THE PINE GROVE! RETURN TO THE CAMPFIRE.");
  }
  if (g.scoutVisited && !g.scoutReturned &&
      Math.abs(g.player.x - CX) <= HOME_RETURN_RADIUS) {
    g.scoutReturned = true;
    notify("GROOTY: HOME AGAIN! KEEP WARM UNTIL DAWN.");
  }
}

/** A small, permanent world landmark rather than an invisible coordinate.
 * No interaction zone: visiting it is measured from the real player position. */
export function drawScoutGrove(ctx: any, g: any): void {
  if (g.ui !== "run" || g.guideLevel !== 0) return;
  const x = SCOUT_GROVE_X;
  px(ctx,x-11,150,24,2,"rgba(22,36,31,0.38)");
  px(ctx,x-3,130,6,19,"#5b3e2b");
  px(ctx,x-2,131,4,16,"#997247");
  px(ctx,x-9,128,18,8,"#543f2d");
  px(ctx,x-8,129,16,6,"#b48b54");
  px(ctx,x-6,131,12,1,"#e0bd79");
  px(ctx,x-4,133,8,1,"#785638");
  px(ctx,x+6,144,4,4,"#526c45");
  px(ctx,x+7,141,2,4,"#87a86b");
}
