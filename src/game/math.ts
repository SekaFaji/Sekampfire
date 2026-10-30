/** Pure math utilities shared by game systems. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
