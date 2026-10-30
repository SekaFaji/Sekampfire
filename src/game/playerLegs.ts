import { px } from "./renderUtils";

/** Side-view foot placements. The direction is part of the *pose*, not just
 * the walking offset: reversing movement also reverses toes, heel shadow and
 * the leading leg. No gameplay coordinates or collision boxes are affected.
 */
export function sideFootPoses(x: number, y: number, dir: number, phase: number, walking: boolean) {
  const facing = dir < 0 ? -1 : 1;
  return ([false, true] as const).map(front => {
    const stride = walking ? Math.sin(phase + (front ? 0 : Math.PI)) : 0;
    const heelX = Math.round(x + facing * (front ? 1 : -2) +
      facing * Math.round(stride * 2.3));
    const lift = walking ? Math.round(Math.max(0, stride) * 2) : 0;
    return { front, facing, heelX, footY: Math.round(y - 3 - lift), lift, stride };
  });
}

/** Pixelated side silhouette with directional toes, independent ankles and
 * near/far leg colours. The original front-facing idle feet stay untouched.
 */
export function drawSideLegs(ctx: any, x: number, y: number,
                             dir: number, phase: number, walking: boolean, boots: boolean) {
  const poses = sideFootPoses(x, y, dir, phase, walking);
  ctx.fillStyle = "rgba(20,20,40,0.28)";
  ctx.fillRect(Math.round(x - 6), Math.round(y - 1), 12, 2);

  for (const foot of poses) {
    const { front, facing, heelX, footY } = foot;
    const trouser = front ? "#414350" : "#353744";
    const leather = boots
      ? (front ? "#624b35" : "#4b382e")
      : (front ? "#545056" : "#42404a");
    const toe = boots ? (front ? "#946d46" : "#74563c")
      : (front ? "#757078" : "#58545d");
    const sole = boots ? "#251f1d" : "#302e36";

    // The trouser emerges behind the coat; a low ankle stays attached to it.
    px(ctx, heelX - 1, footY - 4, 3, 5, trouser);
    px(ctx, heelX - 2, footY, 4, 3, leather);
    // The forward-pointing toe makes the facing obvious at 320x180.
    const toeX = facing > 0 ? heelX + 1 : heelX - 4;
    px(ctx, toeX, footY + 1, 4, 2, leather);
    px(ctx, facing > 0 ? toeX + 2 : toeX, footY + 1, 2, 1, toe);
    if (boots) {
      // Leather cuff and a small ankle buckle: deliberately directional.
      px(ctx, heelX - 2, footY - 2, 4, 1, front ? "#c39c58" : "#8d754e");
      px(ctx, heelX + (facing > 0 ? 1 : -1), footY - 2, 1, 1, "#d8b779");
    }
    px(ctx, heelX - 2, footY + 2, 4, 1, sole);
    px(ctx, toeX, footY + 2, 4, 1, sole);
    // A brighter top edge reads as forward movement, not a reverse shoe.
    px(ctx, facing > 0 ? toeX + 2 : toeX, footY, 2, 1, toe);
  }
}
