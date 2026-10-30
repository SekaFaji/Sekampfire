/** Fit the logical 320×180 landscape canvas inside a measured safe area.
 * No stretching: mouse/touch mapping still uses the canvas bounding rect.
 */
export function fitViewport(
  availableWidth: number, availableHeight: number,
  maxWindowedWidth = Number.POSITIVE_INFINITY
): { width: number; height: number } {
  const width = Math.max(1, Number.isFinite(availableWidth) ? availableWidth : 1);
  const height = Math.max(1, Number.isFinite(availableHeight) ? availableHeight : 1);
  const fitWidth = Math.min(width, height * 16 / 9, maxWindowedWidth);
  return {
    width: Math.max(1, Math.floor(fitWidth)),
    height: Math.max(1, Math.floor(fitWidth * 9 / 16)),
  };
}
