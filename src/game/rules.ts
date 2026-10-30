/** Preserved gameplay capacity rules. Never infer these from visual sprite sizes. */
export const carryCap = (g: any, meta: any): number =>
  5 + (meta.up.pack ? 8 : 0) + (g.crafts.pack ? 8 : 0);
export const pileCap = (g: any): number =>
  g.builtPile ? (g.stage >= 4 ? 40 : 12) : 0;

/** Visual tool progression, without changing the saved 'maul' crafting ID:
 * starter branch -> crafted Wood Axe -> permanent Grandpa's Axe.
 */
export const choppingToolTier = (g: any, meta: any): 0 | 1 | 2 =>
  meta.up.axe ? 2 : g.crafts.maul ? 1 : 0;
