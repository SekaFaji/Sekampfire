import { clamp } from "./math";

/** A distinct sky spectacle is rolled once per night. The aurora roll is
 * exactly one in five regardless of other weather RNG calls.
 */
export type NightSkyEvent = "aurora" | "parade" | "none";
export function rollNightSkyEvent(random: () => number = Math.random): NightSkyEvent {
  if (random() < 0.20) return "aurora";
  return random() < 0.12 ? "parade" : "none";
}

/** Actual sky art is applied after the darkness mask; otherwise a glowing
 * aurora becomes nearly invisible underneath the 78% night overlay.
 * Clip to upper sky so it never paints over the player's campsite or HUD.
 */
export function drawNightSkyEvent(ctx: any, g: any, darkness: number): void {
  if (!g.isNight || darkness < 0.05) return;
  const intensity = clamp(darkness / 0.58, 0, 1);
  const skyEvent: NightSkyEvent = g.nightSkyEvent === "aurora" || g.aurora ? "aurora"
    : g.nightSkyEvent === "parade" ? "parade" : "none";

  if (skyEvent === "aurora") {
    const palettes = ["72,238,176", "99,224,206", "102,153,239"];
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 7, 320, 76); ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    for (let x = 0; x < 320; x += 3) {
      const t = g.animT || 0;
      const sw = Math.sin(x * 0.024 - t * 0.24) * 9
        + Math.sin(x * 0.061 + t * 0.16) * 3.2;
      for (let k = 0; k < 3; k++) {
        const y = 24 + Math.round(sw) + k * 9;
        const height = 12 + Math.round((1 + Math.sin(x * 0.046 + t * 0.62 + k)) * 5);
        const brightness = (0.17 - k * 0.036) * intensity;
        ctx.fillStyle = `rgba(${palettes[k]},${brightness.toFixed(3)})`;
        ctx.fillRect(x, y, 3, height);
        ctx.fillStyle = `rgba(${palettes[k]},${(brightness * 1.35).toFixed(3)})`;
        ctx.fillRect(x, y + 3, 3, 3);
      }
    }
    ctx.restore();
  }

  // Ordinary shooting stars and parade streaks are painted here rather than
  // *behind* the darkness overlay. Each streak is a small visible tail.
  for (const m of g.meteors || []) {
    const life = clamp(m.life, 0, 1) * intensity;
    if (life < 0.01) continue;
    const x = Math.round(m.x), y = Math.round(m.y);
    if (y < -8 || y > 88) continue;
    ctx.fillStyle = `rgba(242,247,255,${life.toFixed(3)})`;
    ctx.fillRect(x, y, 2, 2);
    for (let i = 1; i <= 8; i++) {
      ctx.fillStyle = `rgba(161,206,248,${(life * (1 - i / 10) * 0.65).toFixed(3)})`;
      ctx.fillRect(Math.round(x - m.vx * i * 0.016), Math.round(y - m.vy * i * 0.016), i < 4 ? 2 : 1, 1);
    }
  }
}

/** Run during the night to sustain a whole-night meteor shower rather than
 * a single random shooting star at the start. Particle cap bounds cost.
 */
export function updateShootingStarParade(g: any, dt: number, random: () => number = Math.random): void {
  if (!g.isNight || g.nightSkyEvent !== "parade" || g.longNightActive) return;
  g.paradeTimer = (Number.isFinite(g.paradeTimer) ? g.paradeTimer : 0) - dt;
  let emitted = 0;
  while (g.paradeTimer <= 0 && emitted < 3) {
    const life = 1.1 + random() * 0.5;
    if (g.meteors.length < 25) {
      g.meteors.push({
        x: 55 + random() * 270, y: 8 + random() * 35,
        vx: -(60 + random() * 50), vy: 22 + random() * 18, life,
      });
    }
    g.paradeTimer += 0.7 + random() * 0.9;
    emitted++;
  }
}
