import { clamp } from "./math";
import { px, lerpHex, lightenHex } from "./renderUtils";

/** World-space evergreen sprites (not scaled-up tiny placeholders).
 *
 * Each pine, spire fir and broad spruce has its own layered silhouette,
 * exposed branching, bark, undersides and season-aware tips. The trunk
 * and base remain anchored to the exact gameplay tree position (x, y).
 * No random calls or world mutations occur while drawing.
 */
export function drawTree(ctx: any, tr: any, t: number, windAmt: number, colors: any) {
  const x = Math.round(tr.x), y = Math.round(tr.y);
  const tier = clamp(Math.floor(tr.tier || 0), 0, 2);
  const variant = ((Math.floor(tr.variant || 0) % 3) + 3) % 3;
  const seed = Math.abs(Math.floor(tr.id || 1));
  const height = [35, 47, 59][tier] + (variant === 1 ? 5 : variant === 2 ? 2 : 0);
  const halfBase = [9, 13, 17][tier] + (variant === 2 ? 3 : variant === 1 ? -2 : 0);
  const crownTop = y - height;
  const crownBottom = y - 9;
  const winter = colors.name === "winter";

  // Sturdy trunk with dark contour, warm interior and irregular bark.
  const trunkW = 3 + tier;
  const trunkTop = y - Math.round(height * 0.74);
  px(ctx, x - Math.floor(trunkW / 2) - 1, trunkTop, trunkW + 2, y - trunkTop, "#382c24");
  px(ctx, x - Math.floor(trunkW / 2), trunkTop, trunkW, y - trunkTop, colors.trunk);
  px(ctx, x - Math.floor(trunkW / 2), trunkTop + 1, 1, y - trunkTop - 1,
    lerpHex(colors.trunk, "#d1a06d", 0.28));
  px(ctx, x + Math.floor(trunkW / 2), trunkTop + 3, 1, y - trunkTop - 3,
    lerpHex(colors.trunk, "#1e2729", 0.4));
  for (let i = 0; i < 3 + tier; i++) {
    const yy = y - 4 - i * (3 + tier);
    if (yy > trunkTop + 1) px(ctx, x + (i % 2 ? -1 : 0), yy, 1, 2, "#4f3929");
  }
  // Root shoulders: do not extend below the original tree-foot y coordinate.
  px(ctx, x - Math.floor(trunkW / 2) - 2, y - 2, 3, 2, "#4d3829");
  px(ctx, x + Math.floor(trunkW / 2), y - 2, 3, 2, "#523c2c");
  px(ctx, x - 1, y - 1, 2, 1, "#876344");

  // Individual branches reach beyond the trunk; foliage doesn't look like
  // flat stripes pasted over one triangular column.
  const layerCount = variant === 1 ? 6 : 5;
  const step = (crownBottom - crownTop - 4) / (layerCount - 1);
  const shadow = lerpHex(colors.treeDark, "#162e29", 0.25);
  const mid = lerpHex(colors.treeDark, colors.treeLight, variant === 1 ? 0.48 : 0.38);
  const light = lerpHex(colors.treeDark, colors.treeLight, 0.76);
  const tip = lightenHex(colors.treeLight, winter ? 0.07 : 0.13);
  const snowShade = lerpHex(colors.cap, colors.treeDark, 0.16);
  const lean = Math.round(
    Math.sin(t * (0.91 + tier * 0.09) + seed * 1.9) *
    (0.55 + clamp(windAmt, 0, 1) * 1.2) +
    Math.sin(t * 32 + seed) * clamp(tr.hitT || 0, 0, 1) * 2
  );

  // Uppermost shoot is a distinct point, not an oversized blurry triangle.
  px(ctx, x + lean, crownTop - 1, 1, 4, winter ? colors.cap : light);

  for (let layer = 0; layer < layerCount; layer++) {
    const frac = (layer + 1) / layerCount;
    const branchHalf = Math.round(halfBase * (0.26 + 0.74 * frac));
    const rootY = Math.round(crownTop + layer * step);
    const boughHeight = variant === 1 ? 7 : variant === 2 ? 9 : 8;
    const side = ((seed + layer) % 3) - 1;
    const displacement = Math.round(lean * (1 - layer / (layerCount * 1.35)));
    const center = x + displacement + side;
    const taper = variant === 1 ? 0.66 : variant === 2 ? 0.95 : 0.82;

    // Exposed, darker interior branch joins the trunk to shaded outer tips.
    if (layer > 0) {
      px(ctx, center - branchHalf + 2, rootY + 3, branchHalf * 2 - 4, 1, "#54412f");
      px(ctx, center - 1, rootY + 2, 2, 3, "#6e4b31");
    }

    for (let row = 0; row < boughHeight; row++) {
      const f = row / (boughHeight - 1);
      const branchReach = Math.round(branchHalf *
        Math.min(1, (0.24 + f * taper) + (row % 3 === 1 ? 0.07 : 0)));
      const leftNotch = (seed + layer + row) % 5 === 0 ? 2 : 0;
      const rightNotch = (seed + 2 * layer + row) % 6 === 0 ? 1 : 0;
      const left = center - branchReach + leftNotch;
      const right = center + branchReach - rightNotch;
      const width = right - left + 1;
      if (width <= 0) continue;
      const yy = rootY + row;
      px(ctx, left, yy, width, 1, row >= boughHeight - 2 ? shadow : mid);
      // A lightly shaded plane on top of each branch and a dark underside.
      if (row > 0 && row < boughHeight - 1) {
        const leftSide = left + 1;
        const litWidth = Math.max(1, Math.round(width * 0.46));
        px(ctx, leftSide, yy, Math.min(litWidth, width - 1), 1,
          row % 3 === 0 ? light : colors.treeLight);
      }
      // Sparse needles separated into clusters; deterministic at every frame.
      if ((seed + layer * 7 + row * 11) % 4 === 0 && width > 7) {
        px(ctx, right - 3, yy, 2, 1, tip);
      }
    }

    // Scalloped ends read as drooping needles rather than straight bars.
    if (branchHalf >= 6) {
      const droop = variant === 2 ? 3 : 2;
      px(ctx, center - branchHalf + 1, rootY + boughHeight - 1, 2, droop, shadow);
      px(ctx, center + branchHalf - 2, rootY + boughHeight - 1, 2, droop, shadow);
    }

    // Snow accumulates only during winter, on the physically upper ledges;
    // autumn, spring and summer keep clean foliage rather than white dots.
    if (winter) {
      const capW = Math.max(3, Math.round(branchHalf * (variant === 1 ? 0.9 : 1.3)));
      px(ctx, center - Math.floor(capW / 2), rootY + 1, capW, 2, colors.cap);
      px(ctx, center - Math.floor(capW / 2) + 1, rootY + 3, Math.max(2, capW - 3), 1, snowShade);
      if (branchHalf > 7) {
        px(ctx, center - branchHalf + 1, rootY + boughHeight - 3, 4, 1, colors.cap);
        px(ctx, center + branchHalf - 4, rootY + boughHeight - 4, 3, 1, snowShade);
      }
    } else {
      // A few warm/cool light breaks between the overlapping boughs.
      px(ctx, center - 1, rootY + 1, 2, 1, tip);
      if (branchHalf > 8) px(ctx, center + branchHalf - 5, rootY + 4, 2, 1, light);
    }
  }
}

export function drawFallingTree(ctx: any, ft: any, t: number, colors: any) {
  const progress = clamp(ft.t / 0.55, 0, 1);
  const angle = (ft.dir || 1) * 1.55 * progress * progress;
  ctx.save();
  ctx.translate(Math.round(ft.x), Math.round(ft.y));
  ctx.rotate(angle);
  ctx.translate(-Math.round(ft.x), -Math.round(ft.y));
  drawTree(ctx, ft, t, 0, colors);
  ctx.restore();
}
