import { W, H, CX, WORLD_W } from "./config";
import { clamp } from "./math";
import { visualSeason } from "./palette";
import { wildlifeForSeason, wildlifeMovementType } from "./wildlife";
import { weatherIntensity } from "./weather";
import { tickQuickSlotHolds } from "./quickSlots";
import { GRAPHICS } from "./graphics";
import { settleThermometer, localTemperature } from "./thermometer";
import { updateShootingStarParade } from "./nightSky";
import { addStatusMessage, tickStatusMessages } from "./statusMessages";

/** Ambient visual effects and woodland events run even when gameplay is paused.
 * This extraction preserves exact random consumption, spawn cadence, movement
 * easing, weather particles and message queue behavior from the game engine. */

// ============ random cozy events ============
export function spawnEvent(g: any) {
  const day = !g.isNight;
  const r = Math.random();
  const run = g.ui === "run";
  const seasonal = wildlifeForSeason(visualSeason(g));
  if (!day && g.weather === "clear" && r < 0.25) {
    g.meteors.push({ x: 60 + Math.random() * 200, y: 8 + Math.random() * 26, vx: -(70 + Math.random() * 40), vy: 34 + Math.random() * 18, life: 1 });
    if (run) addStatusMessage(g, "A shooting star crosses the sky.");
    return;
  }
  if (!day && r < 0.4) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = clamp(g.player.x + side * (80 + Math.random() * 40), 20, WORLD_W - 20);
    const species = seasonal.nocturnal;
    const type = wildlifeMovementType(species);
    g.critters.push({ type, species, x, y: 150 + Math.random() * 8,
      state: type === "fox" ? "watch" : "sit", t: 12 + Math.random() * 8,
      ph: Math.random() * 6, dir: -side });
    if (run && Math.random() < 0.15) addStatusMessage(g, "Wildlife stirs near the treeline.");
    return;
  }
  if (day && r < 0.55) {
    const n = 3 + Math.floor(Math.random() * 3);
    const fromLeft = Math.random() < 0.5;
    const bx = fromLeft ? g.camX - 24 : g.camX + W + 24;
    const vx = (fromLeft ? 1 : -1) * (16 + Math.random() * 12);
    const by = 34 + Math.random() * 26;
    for (let i = 0; i < n; i++) {
      g.critters.push({ type: "bird", species: seasonal.flying, x: bx - i * 7 * (fromLeft ? 1 : -1), y: by + Math.sin(i * 2.1) * 4, state: "fly", vx, t: -1, ph: i * 1.3, dir: vx > 0 ? 1 : -1 });
    }
    if (run && Math.random() < 0.12) addStatusMessage(g, "Birds cross the pale sky.");
    return;
  }
  if (r < 0.78) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = clamp(g.player.x + side * (46 + Math.random() * 50), 20, WORLD_W - 20);
    const species = seasonal.ground;
    const type = wildlifeMovementType(species);
    g.critters.push({ type, species, x, y: 146 + Math.random() * 12,
      state: "sit", t: 10 + Math.random() * 10,
      ph: Math.random() * 6, dir: -side });
    return;
  }
  if (run && g.moveT > 0) {
    const dayP = ["Birdsong in the trees.", "The wind stirs the branches.", "The wind carries woodsmoke.", "Somewhere a branch snaps.", "The forest grows quiet."];
    const nightP = ["An owl calls far away.", "Ice sings across the lake.", "The pines groan in the dark.", "The stars feel close tonight."];
    const pool = day ? dayP : nightP;
    addStatusMessage(g, pool[Math.floor(Math.random() * pool.length)]);
  }
}

// ============ ambient update (always runs) ============
export function updateAmbient(g: any, dt: number): void {
  tickQuickSlotHolds(g,dt);
  g.ashTapFx=Math.max(0,(Number(g.ashTapFx)||0)-Math.max(0,dt));
  g.weatherBlend = clamp(g.weatherBlend + dt / 8, 0, 1);
  // Pixel-art instrument settles slowly as weather/day/night/season changes.
  // It is not added to the save format because real weather is authoritative.
  g.thermometerTemp = settleThermometer(g.thermometerTemp, localTemperature(g), dt);
  updateShootingStarParade(g, dt);
  const ease = 1 - Math.exp(-Math.max(0, dt) * 13);
  g.moveFeedbackLeft += ((g.pleft || g.keys.left) ? 1 - g.moveFeedbackLeft : -g.moveFeedbackLeft) * ease;
  g.moveFeedbackRight += ((g.pright || g.keys.right) ? 1 - g.moveFeedbackRight : -g.moveFeedbackRight) * ease;
  // One visible event at a time, fixed near the upper HUD.
  tickStatusMessages(g, dt);
  // sparks
  if (g.fireLit) {
    g.sparkAcc += dt;
    while (g.sparkAcc > 0.12) {
      g.sparkAcc -= 0.12;
      g.sparks.push({ x: CX - 3 + Math.random() * 6, y: 146, vy: -10 - Math.random() * 12, life: 1 });
    }
  }
  for (let i = g.sparks.length - 1; i >= 0; i--) {
    const s = g.sparks[i];
    s.y += s.vy * dt; s.x += Math.sin(g.animT * 6 + s.y) * 8 * dt; s.life -= dt * 1.4;
    if (s.life <= 0) g.sparks.splice(i, 1);
  }
  // chimney smoke
  if (g.stage >= 6) {
    g.smokeAcc += dt;
    while (g.smokeAcc > 0.4) {
      g.smokeAcc -= 0.4;
      g.smoke.push({ x: CX + 27 + Math.random() * 2, y: 85, life: 1 });
    }
  }
  for (let i = g.smoke.length - 1; i >= 0; i--) {
    const s = g.smoke[i];
    s.y -= 7 * dt; s.x += Math.sin(g.animT + s.y * 0.2) * 6 * dt; s.life -= dt * 0.35;
    if (s.life <= 0) g.smoke.splice(i, 1);
  }
  // wood chips
  for (let i = g.chips.length - 1; i >= 0; i--) {
    const c = g.chips[i];
    c.vy += 260 * dt;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.life -= dt * 2;
    if (c.life <= 0) g.chips.splice(i, 1);
  }
  if (g.shake > 0) g.shake = Math.max(0, g.shake - dt);
  // Melt temporary footprints naturally and clear them outside winter.
  for (let i = g.footprints.length - 1; i >= 0; i--) {
    g.footprints[i].life -= dt;
    if (g.footprints[i].life <= 0 || visualSeason(g) !== "winter") g.footprints.splice(i, 1);
  }
  // snow
  const winter = visualSeason(g) === "winter" || g.longNightActive;
  const target = !winter ? 0 : Math.round((45 + 65 * weatherIntensity(g, "blizzard") + 25 * weatherIntensity(g, "wind")) * (GRAPHICS.high ? 1 : 0.55));
  while (g.snow.length < target) g.snow.push({ x: Math.random() * W, y: Math.random() * H, v: 12 + Math.random() * 18, ph: Math.random() * 6 });
  while (g.snow.length > target) g.snow.pop();
  const gust = weatherIntensity(g, "wind") + weatherIntensity(g, "blizzard") * 2;
  const windV = gust * 45;
  const speedup = 1 + weatherIntensity(g, "blizzard") * 1.2;
  for (const s of g.snow) {
    s.y += s.v * speedup * dt;
    s.x += (Math.sin(g.animT * 2 + s.ph) * 8 + windV) * dt;
    if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
    if (s.x > W) s.x = 0;
    if (s.x < 0) s.x = W;
  }
  // meteors
  for (let i = g.meteors.length - 1; i >= 0; i--) {
    const m = g.meteors[i];
    m.x += m.vx * dt; m.y += m.vy * dt; m.life -= dt;
    if (m.life <= 0 || m.y > 100) g.meteors.splice(i, 1);
  }
  // critters
  const pxr = g.player.x;
  for (let i = g.critters.length - 1; i >= 0; i--) {
    const c = g.critters[i];
    c.t -= dt;
    if (c.type === "bird") {
      if (c.state === "sit") {
        if (Math.abs(pxr - c.x) < 22) {
          c.state = "fly";
          c.vx = (c.x > pxr ? 1 : -1) * (26 + Math.random() * 14);
          c.dir = c.vx > 0 ? 1 : -1;
          if (g.ui === "run" && Math.random() < 0.1) toast(g, "A bird flutters away.");
        } else if (c.t <= 0) { g.critters.splice(i, 1); continue; }
      } else {
        c.x += c.vx * dt;
        c.y += Math.sin(g.animT * 3 + c.ph) * 6 * dt - 8 * dt;
        if (c.x < g.camX - 40 || c.x > g.camX + W + 40) { g.critters.splice(i, 1); continue; }
      }
    } else if (c.type === "bunny") {
      if (c.state === "sit") {
        if (Math.abs(pxr - c.x) < 20) {
          c.state = "hop";
          c.dir = c.x > pxr ? 1 : -1;
          c.t = 2.2;
          if (g.ui === "run" && Math.random() < 0.12) toast(g, "A rabbit darts away.");
        } else if (c.t <= 0) { g.critters.splice(i, 1); continue; }
      } else {
        c.x += c.dir * 52 * dt;
        if (c.t <= 0) { g.critters.splice(i, 1); continue; }
      }
    } else if (c.type === "fox") {
      if (c.state === "watch") {
        c.dir = pxr > c.x ? 1 : -1;
        if (Math.abs(pxr - c.x) < 46) {
          c.state = "trot";
          c.dir = pxr > c.x ? -1 : 1;
          c.t = 3.5;
        } else if (c.t <= 0) { g.critters.splice(i, 1); continue; }
      } else {
        c.x += c.dir * 66 * dt;
        if (c.t <= 0) { g.critters.splice(i, 1); continue; }
      }
    }
  }
  // random cozy events
  g.eventCd -= dt;
  if (g.eventCd <= 0) {
    spawnEvent(g);
    g.eventCd = 16 + Math.random() * 22;
  }
}

