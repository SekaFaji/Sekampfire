import { stationPileBonus } from "./campProgress";
import { AXE_STATS, equippedAxe } from "./equipment50";
/** Preserved gameplay capacity rules. Never infer these from visual sprite sizes. */
export const carryCap = (g: any, meta: any): number =>
  5 + (meta.up.pack ? 8 : 0) + (g.crafts.pack ? 8 : 0);
export const pileCap = (g: any): number =>
  g.builtPile ? (g.stage >= 4 ? 40 : 12) + stationPileBonus(g) : 0;

/** A single actually equipped tool drives BOTH the world sprite and
 * chopping speed. Bonuses from several owned axes never stack together.
 * Old saves without an equip field still use their strongest owned axe.
 */
export const choppingToolTier = (g:any,meta:any):0|1|2 =>
  AXE_STATS[equippedAxe(g,meta)].tier;
export const choppingSeconds = (g:any,meta:any):number =>
  AXE_STATS[equippedAxe(g,meta)].chopSeconds;
