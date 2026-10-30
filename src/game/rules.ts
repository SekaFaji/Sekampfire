/** Preserved gameplay capacity rules. Never infer these from visual sprite sizes. */
export const carryCap = (g: any, meta: any): number =>
  5 + (meta.up.pack ? 8 : 0) + (g.crafts.pack ? 8 : 0);
export const pileCap = (g: any): number =>
  g.builtPile ? (g.stage >= 4 ? 40 : 12) : 0;
