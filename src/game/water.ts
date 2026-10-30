/** Decorative tidal wash at the water edge. Changes only Canvas pixels,
 * never gameplay terrain, reflection source coordinates or collisions.
 */
export function shorelineWaveOffset(time: number, worldX: number, wind = 1): number {
  const phase = Math.sin(time * 0.95 + worldX * 0.045) * 0.9
    + Math.sin(time * 1.37 - worldX * 0.075) * 0.55;
  return Math.max(-2, Math.min(2, Math.round(phase * wind)));
}
export function shorelineFoam(time: number, worldX: number): number {
  const strength = Math.sin(time * 1.18 + worldX * 0.11)
    + Math.sin(time * 0.63 - worldX * 0.06) * 0.42;
  return Math.max(0, Math.min(1, (strength - 0.45) / 1.1));
}
