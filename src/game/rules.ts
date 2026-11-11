import { stationPileBonus } from "./campProgress";
import { AXE_STATS, equippedAxe } from "./equipment50";
/** Permanent Big Backpack now adds +5 kg per Ash level (max five).
 * The crafted Timber Pack remains a separate run-only +8 kg. This single
 * formula powers pickups, pet transfers, storage, HUD and inventory. */
export const MAX_CARRY_KG = 38;
export const carryCap = (g: any, meta: any): number => {
  const raw = Number(meta?.up?.pack);
  const level = Number.isFinite(raw) ? Math.min(5, Math.max(0, Math.floor(raw))) : 0;
  return 5 + level * 5 + (g?.crafts?.pack ? 8 : 0);
};
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
