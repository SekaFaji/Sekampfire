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

/** Gentle broken horizontal distortion. A scanline is shifted as a whole,
 * which keeps animal/player reflection geometry anchored in the source.
 */
export function reflectionOffset(time: number, depth: number, wind = 1): number {
  const long = Math.sin(depth * 0.38 + time * 1.12) * 1.2;
  const short = Math.sin(depth * 0.17 - time * 0.64) * 0.85;
  return Math.round(Math.max(-4, Math.min(4, (long + short) * wind)));
}

/** Reflections break into softer bands further into the water instead of
 * repeating at equal opacity. Deterministic and clamped for low-FX devices.
 */
export function reflectionOpacity(depth: number, height: number, storm = false): number {
  const t = Math.max(0, Math.min(1, depth / Math.max(1, height)));
  const fade = 0.52 - t * 0.32;
  const breakup = 0.92 + Math.sin(depth * 1.4) * 0.08;
  return Math.max(0.12, Math.min(0.54, fade * breakup * (storm ? 0.78 : 1)));
}

/** Small travelling surface glints. Seasonal tints are chosen by the caller;
 * no additional particles or simulation state are allocated.
 */
export function waterGlint(time: number, lane: number, cameraX: number, width: number) {
  const x = ((lane * 79 + Math.round(Math.sin(time * 0.53 + lane) * 15) -
    Math.round(cameraX * 0.14)) % width + width) % width;
  const y = 4 + (lane * 13) % 28 +
    Math.round(Math.sin(time * 0.88 + lane * 1.2));
  const alpha = Math.max(0.03, Math.min(0.17,
    0.08 + Math.sin(time * 1.21 + lane * 2.4) * 0.045));
  return { x, y, alpha, length: 5 + (lane % 4) * 3 };
}
