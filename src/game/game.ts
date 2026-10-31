import { W, H, GROUND, PLAYER_Y, SCENE_LIFT, WATER_Y, WORLD_W, CX, DAY_LEN, NIGHT_LEN, LONG_NIGHT_LEN, META_KEY, LEGACY_KEYS, SHED_X, BENCH_X, PILE_X, SITE_COST, BUILD_TIME, STAGES, CRAFTS, UPGRADES, WEATHER_TEXT } from "./config";
import { createInputHandlers } from "./input";
import { drawIllustratedGuide, drawShopTabs } from "./menuScreens";
import { clamp } from "./math";
import { carryCap, pileCap, choppingToolTier } from "./rules";
import { AUDIO } from "./audio";
import { GRAPHICS } from "./graphics";
import { weatherIntensity } from "./weather";
import { completedNights, visualSeason, visualPalette, seasonDay } from "./palette";
import { wildlifeForSeason, wildlifeMovementType } from "./wildlife";
import { shorelineWaveOffset, shorelineFoam, reflectionOffset, reflectionOpacity, waterGlint } from "./water";
import { drawText, textW, drawTextC, drawTextO, drawTextWrap, drawBig } from "./font";
import { mulberry32, hexToRgb, lerpHex, lightenHex, px } from "./renderUtils";
import { loadMeta, saveMeta, clearRunSnapshot, saveRunSnapshot, loadRunSnapshot, finiteRange, WEATHER_IDS } from "./save";
import { drawFlame, drawTree, drawFallingTree, drawBackpack, drawPlayer, drawDog, drawFire, drawBench, drawPile, drawSite, drawConstruction, drawStructures, drawLog, drawPickups, drawMountainRange, drawHillRange, drawForestLayer, drawCritter } from "./renderSprites";
import { drawGroundAccents, drawSkyHaze, drawHorizonHaze } from "./renderAtmosphere";
import { rollNightSkyEvent, drawNightSkyEvent, updateShootingStarParade } from "./nightSky";
import { CAMP_STATIONS, stationIds, stationLevel, stationCost, stationAvailable, stationFuelFactor, stationStokeGain, stationTorchBonus, stationCraftCost, canCompleteCabin, purchaseStation } from "./campProgress";

function resumeRun(g: any, data: any) {
  if (!data) return;
  // Reset all UI pointers, particle state and transient actions before restore.
  Object.assign(g, createEngine());
  const n = (key: string, lo: number, hi: number, fallback: number) =>
    finiteRange(data[key], lo, hi, fallback);
  const flag = (key: string) => data[key] === true;
  const seed = n("scenerySeed", 1, 1e9, 777);
  genScenery(g, seed);
  g.player.x = finiteRange(data.player.x, 10, WORLD_W - 10, CX + 26);
  g.player.dir = data.player.dir === -1 ? -1 : 1;
  g.player.wood = finiteRange(data.player.wood, 0, 26, 0);
  g.player.warmth = finiteRange(data.player.warmth, 1, 100, 100);
  g.player.torchT = finiteRange(data.player.torchT, 0, 60, 0);
  g.time = n("time", 0, DAY_LEN + LONG_NIGHT_LEN - 0.01, 10);
  g.night = Math.floor(n("night", 0, 100000, 0));
  g.isNight = g.time >= DAY_LEN;
  g.weather = WEATHER_IDS.includes(data.weather) ? data.weather : "clear";
  g.previousWeather = g.weather;
  g.weatherBlend = 1;
  g.aurora = flag("aurora");
  g.nightSkyEvent = data.nightSkyEvent === "parade" ? "parade" : g.aurora ? "aurora" : "none";
  g.paradeTimer = 0;
  g.fuel = n("fuel", 0, 100, 0);
  g.fireLit = flag("fireLit") && g.fuel > 0;
  g.everLit = flag("everLit") || g.fireLit;
  g.firestarter = n("firestarter", 0, 1, 0);
  g.stage = Math.floor(n("stage", 0, 6, 0));
  g.longNightPending = flag("longNightPending");
  g.longNightActive = flag("longNightActive");
  g.endlessMode = flag("endlessMode");
  g.endlessN = Math.floor(n("endlessN", 0, 100000, 0));
  g.ashEarned = n("ashEarned", 0, 10000000, 0);
  g.victoryPending = flag("victoryPending");
  g.depth = n("depth", 0, 10000, 0);
  g.builtBench = flag("builtBench");
  g.builtPile = flag("builtPile");
  g.benchLogs = n("benchLogs", 0, SITE_COST, 0);
  g.pileLogs = n("pileLogs", 0, SITE_COST, 0);
  g.benchBuildT = n("benchBuildT", -1, BUILD_TIME, -1);
  g.pileBuildT = n("pileBuildT", -1, BUILD_TIME, -1);
  g.campUpgrades = Object.fromEntries(stationIds.map(id => [
    id, Math.floor(finiteRange(data.campUpgrades?.[id], 0, 2, 0))
  ]));
  g.stored = n("stored", 0, 80, 0);
  g.trees = data.trees.slice(0, 150).filter((t: any) =>
    t && typeof t === "object" && Number.isFinite(t.x) && Number.isFinite(t.y)
      && Number.isFinite(t.id)).map((t: any) => ({
    x:finiteRange(t.x,10,WORLD_W-10,20), y:finiteRange(t.y,132,165,145),
    id:Math.floor(finiteRange(t.id,1,1000000,1)),
    tier:Math.floor(finiteRange(t.tier,0,2,0)),
    variant:Math.floor(finiteRange(t.variant,0,2,0)),
    hp:Math.floor(finiteRange(t.hp,1,3,1)), hitT:0
  }));
  g.falling = (Array.isArray(data.falling) ? data.falling : []).slice(0, 150)
    .filter((t: any) => t && Number.isFinite(t.x) && Number.isFinite(t.y)
      && Number.isFinite(t.id)).map((t: any) => ({
      x:finiteRange(t.x,0,WORLD_W,0),y:finiteRange(t.y,132,165,145),
      id:Math.floor(finiteRange(t.id,1,1000000,1)),
      tier:Math.floor(finiteRange(t.tier,0,2,0)),
      variant:Math.floor(finiteRange(t.variant,0,2,0)),
      wood:Math.floor(finiteRange(t.wood,1,3,1)),
      t:finiteRange(t.t,0,0.55,0),
      dir:t.dir === -1 ? -1 : 1,hitT:0
    }));
  g.treeId = Math.max(Math.floor(n("treeId", 1, 1000001, 1)),
    ...g.trees.map((t: any) => t.id + 1),
    ...g.falling.map((t: any) => t.id + 1));
  g.pickups = data.pickups.slice(0, 200).filter((p: any) => p &&
    Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.w))
    .map((p: any) => ({
      x:finiteRange(p.x,0,WORLD_W,0),
      y:finiteRange(p.y,130,170,145),
      w:Math.floor(finiteRange(p.w,1,12,1))
    }));
  g.crafts = {};
  for (const c of CRAFTS) if (data.crafts && data.crafts[c.id] === true) g.crafts[c.id] = true;
  g.ui = "run";
  g.menu = null;
  g.resumeData = null;
  g.keys = {};
  g.pointers = {};
  g.pleft = false; g.pright = false;
  toast(g, "Run restored. The fire is waiting.");
}



function toast(g: any, text: string) {
  g.toasts.push({ text, life: 4.6 });
  if (g.toasts.length > 3) g.toasts.shift();
}

// ============ engine ============
function createEngine(): any {
  return {
    animT: 0, time: 10, isNight: false, night: 0, weather: "clear", aurora: false,
    weatherBlend: 1, previousWeather: "clear", scenerySeed: 777, resumeData: null,
    nightSkyEvent: "none", paradeTimer: 0,
    trees: [], falling: [], chips: [], pickups: [], mts: [], mts2: [], stars: [], sparkles: [], snow: [], sparks: [], smoke: [],
    player: { x: CX + 26, y: PLAYER_Y, dir: -1, wood: 0, torchT: 0, chopT: 0, chopTime: 1, chopTree: null, moving: false, warmth: 100 },
    dog: null, stored: 0, stokeCd: 0, camX: CX - W / 2, shake: 0,
    pleft: false, pright: false, moveFeedbackLeft: 0, moveFeedbackRight: 0,
    fireLit: false, everLit: false, firestarter: 1, fuel: 0, stage: 0,
    longNightPending: false, longNightActive: false,
    won: false, victoryPending: false, endlessMode: false, endlessN: 0, over: false,
    ashEarned: 0, depth: 0, actionLabel: "-", windAmt: 0, moveT: 0,
    builtBench: false, builtPile: false, benchLogs: 0, pileLogs: 0,
    campUpgrades: { hearth: 0, bench: 0, pile: 0 }, buildConfirm: null,
    benchBuildT: -1, pileBuildT: -1, dust: [] as any[], footprints: [] as any[], footstepT: 0, walkSoundT: 0,
    keys: {}, pressE: false, pressT: false, chopBlocked: false, packTier: 0,
    sparkAcc: 0, smokeAcc: 0, treeId: 1,
    // UI
    ui: "title", menu: null, menuSel: 0, titleSel: 0, helpPage: 0, shopTab: 0, craftTab: 0, buildTab: 0, craftConfirm: null, lastResult: null,
    zones: [] as any[], pointers: {} as any,
    toasts: [] as any[], critters: [] as any[], meteors: [] as any[],
    crafts: {} as any, eventCd: 6,
  };
}

function genScenery(g: any, seed: number) {
  g.scenerySeed = seed;
  const rnd = mulberry32(seed);
  g.mts = []; g.mts2 = []; g.stars = []; g.sparkles = [];
  let x = -100;
  while (x < WORLD_W * 0.5 + W + 100) { g.mts.push({ x, w: 50 + rnd() * 90, h: 26 + rnd() * 44 }); x += 34 + rnd() * 70; }
  x = -100;
  while (x < WORLD_W * 0.75 + W + 100) { g.mts2.push({ x, w: 40 + rnd() * 70, h: 16 + rnd() * 30 }); x += 28 + rnd() * 58; }
  for (let i = 0; i < 45; i++) g.stars.push({ x: rnd() * W, y: rnd() * 90, tw: rnd() * 6 });
  for (let i = 0; i < 320; i++) g.sparkles.push({ x: rnd() * WORLD_W, y: GROUND + 4 + rnd() * (H - GROUND - 8), c: rnd() > 0.5 ? "#eef6fc" : "#c4d2e2" });
  g.snow = []; // Start in snow-free autumn; winter fills snowfall particles naturally.
}

function treeTierFor(x: number): number {
  const d = Math.abs(x - CX);
  return d < 90 ? 0 : d < 220 ? 1 : 2;
}

function spawnTrees(g: any, count: number) {
  for (let n = 0; n < count; n++) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const x = 16 + Math.random() * (WORLD_W - 32);
      if (x > CX - 100 && x < CX + 56) continue;
      if (g.trees.some((t: any) => Math.abs(t.x - x) < 16)) continue;
      const y = 136 + Math.random() * 18; // Keep pickups clear of foreground water.
      const tier = treeTierFor(x);
      const variant = Math.floor(Math.random() * 3);
      g.trees.push({ id: g.treeId++, x, y, tier, variant, hp: [1, 2, 3][tier], hitT: 0 });
      break;
    }
  }
}

function startRunEngine(g: any, meta: any) {
  Object.assign(g, createEngine());
  genScenery(g, Math.floor(Math.random() * 1e9));
  spawnTrees(g, 26);
  if (meta.up.flint) { g.fireLit = true; g.everLit = true; g.fuel = 40; g.firestarter = 0; g.player.wood = 2; }
  else { g.firestarter = 1; }
  toast(g, meta.up.flint ? "The old flint sparks to life. Don't let it die." : "The evenings are cold. Chop a tree. Then light the fire pit.");
  toast(g, "Survive the seasons. Build a cabin. Face the Long Night.");
}

function startRun(g: any, meta: any) {
  clearRunSnapshot();
  startRunEngine(g, meta);
  g.ui = "run";
  g.menu = null;
  saveRunSnapshot(g);
}

function goEndless(g: any) {
  // Continuing keeps pending Ash in this run; banking happens ONLY on End Run.
  g.victoryPending = false;
  g.endlessMode = true;
  g.ui = "run";
  g.menu = null;
  toast(g, "Endless seasons. Survive as long as you can.");
  saveRunSnapshot(g);
}

function setupTitleScene(g: any) {
  Object.assign(g, createEngine());
  genScenery(g, 777);
  spawnTrees(g, 26);
  g.time = DAY_LEN - 3;
  g.isNight = false;
  g.weather = "clear";
  g.fireLit = true; g.everLit = true; g.fuel = 70; g.stage = 2;
  g.builtBench = true; g.builtPile = true;
  g.stored = 6;
  g.player.x = CX + 26; g.player.dir = -1;
  g.eventCd = 2;
}

function pickWeather(g: any): string {
  if (g.night >= 4 && Math.random() < 0.12) return "blizzard";
  const r = Math.random();
  if (r < 0.42) return "clear";
  if (r < 0.62) return "wind";
  if (r < 0.77) return "fog";
  if (r < 0.9) return "coldsnap";
  return "rain";
}

function nearestTree(g: any, p: any): any {
  let best: any = null, bd = 24;
  for (const t of g.trees) {
    const d = Math.abs(t.x - p.x);
    if (d < bd) { bd = d; best = t; }
  }
  return best;
}

// ============ random cozy events ============
function spawnEvent(g: any) {
  const day = !g.isNight;
  const r = Math.random();
  const run = g.ui === "run";
  const seasonal = wildlifeForSeason(visualSeason(g));
  if (!day && g.weather === "clear" && r < 0.25) {
    g.meteors.push({ x: 60 + Math.random() * 200, y: 8 + Math.random() * 26, vx: -(70 + Math.random() * 40), vy: 34 + Math.random() * 18, life: 1 });
    if (run) toast(g, "A shooting star crosses the sky.");
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
    if (run && Math.random() < 0.15) toast(g, "Wildlife stirs near the treeline.");
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
    if (run && Math.random() < 0.12) toast(g, "Birds cross the pale sky.");
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
    toast(g, pool[Math.floor(Math.random() * pool.length)]);
  }
}

// ============ update ============
function update(g: any, meta: any, dt: number, cb: any) {
  if (g.over) return;
  const p = g.player;
  const cap = carryCap(g, meta);
  const pcap = pileCap(g);
  const speed = g.crafts.boots ? 112 : 90;

  // Movement takes priority over any unfinished axe swing. If ACT remains
  // held after moving, it must be released before another chop can begin.
  const moveLeft = !!(g.keys.left || g.pleft);
  const moveRight = !!(g.keys.right || g.pright);
  const wantsToMove = moveLeft !== moveRight;
  if (!g.keys.act) g.chopBlocked = false;
  if (wantsToMove) {
    if (p.chopT > 0) {
      p.chopT = 0;
      p.chopTree = null;
    }
    if (g.keys.act) g.chopBlocked = true;
    g.pressE = false;
  }

  // ---- day/night cycle ----
  const nightLen = g.longNightActive ? LONG_NIGHT_LEN : NIGHT_LEN;
  const total = DAY_LEN + nightLen;
  g.time += dt;
  const wasNight = g.isNight;
  g.isNight = g.time >= DAY_LEN;
  if (g.isNight && !wasNight) {
    g.night++;
    g.previousWeather = g.weather;
    g.weather = pickWeather(g);
    g.weatherBlend = 0;
    g.nightSkyEvent = rollNightSkyEvent();
    g.aurora = g.nightSkyEvent === "aurora";
    g.paradeTimer = 0;
    if (g.longNightPending) {
      g.longNightPending = false;
      g.longNightActive = true;
      g.weather = "blizzard";
      g.aurora = false;
      g.nightSkyEvent = "none";
      cb.toast("THE LONG NIGHT. Hold the fire until dawn!");
    } else {
      let w = `Night ${g.night} falls. (${WEATHER_TEXT[g.weather]})`;
      if (g.aurora) w += " The AURORA lights up the sky!";
      if (g.nightSkyEvent === "parade") w += " A SHOOTING STAR PARADE begins!";
      cb.toast(w);
    }
  }
  if (g.time >= total) {
    g.time = 0; g.isNight = false;
    if (g.longNightActive) {
      g.longNightActive = false;
      g.weather = "clear";
      g.won = true;
      g.ashEarned += 100;
      // Pause on a resumable completion choice. Do not bank until the player
      // explicitly selects Finish; both options preserve a safe save path.
      g.victoryPending = true;
      g.lastResult = { kind: "won", nights: g.night, ash: Math.floor(g.ashEarned) };
      saveRunSnapshot(g);
      g.ui = "win";
      g.menu = null;
      return;
    }
    if (g.endlessMode) {
      g.endlessN++;
      g.ashEarned += Math.round((3 + g.night) * (1 + g.endlessN * 0.3));
    } else {
      g.ashEarned += 3 + g.night;
    }
    if (g.aurora) g.ashEarned += 2;
    spawnTrees(g, 8);
    if (g.night > 0) cb.toast(`Dawn breaks. Night ${g.night} survived.`);
    g.aurora = false;
    g.nightSkyEvent = "none";
    g.meteors = [];
    g.depth = Math.max(0, g.night - 5) + (g.endlessMode ? g.endlessN * 0.6 : 0);
  }

  const windAmt = weatherIntensity(g, "wind") + weatherIntensity(g, "blizzard") * 1.6;

  // ---- torch ----
  if (g.pressT) {
    g.pressT = false;
    if (g.fireLit && p.torchT <= 0 && g.fuel > 12) {
      g.fuel -= 8;
      p.torchT = (meta.up.scarf ? 50 : 30) + stationTorchBonus(g);
      cb.toast("You take an ember. The fire dimmed a little.");
    } else if (!g.fireLit) {
      cb.toast("No fire to take an ember from.");
    }
  }

  // ---- zones ----
  const nearPit = Math.abs(p.x - CX) < 22;
  const nearBench = Math.abs(p.x - BENCH_X) < 22;
  const nearPile = Math.abs(p.x - PILE_X) < 22;
  const tree = nearestTree(g, p);
  if (g.stokeCd > 0) g.stokeCd -= dt;

  // ---- context action (single press) ----
  if (g.pressE) {
    g.pressE = false;
    if (!wantsToMove && !g.chopBlocked && p.chopT <= 0) {
      if (nearBench && !g.builtBench) {
        g.keys.act = false;
        if (g.benchBuildT >= 0) {
          cb.toast("Hammering away. It is almost up.");
        } else if (g.benchLogs >= SITE_COST) {
          g.benchBuildT = 0;
          cb.toast("You start raising the workbench. Hammer, hammer...");
        } else if (p.wood > 0) {
          const add = Math.min(p.wood, SITE_COST - g.benchLogs);
          p.wood -= add; g.benchLogs += add;
          cb.toast(g.benchLogs >= SITE_COST
            ? "All 15 logs stacked. Press ACT to build the workbench."
            : `Stacked ${add} logs on the site. ${g.benchLogs}/15.`);
        } else cb.toast("Bring 15 logs here to build the workbench.");
      } else if (nearBench) {
        g.menu = "bench";
        g.menuSel = 0;
        g.craftConfirm = null;
        g.buildConfirm = null;
        g.keys.act = false;
      } else if (nearPit) {
        if (!g.fireLit) {
          if (g.firestarter > 0) {
            g.firestarter--; g.fireLit = true; g.everLit = true; g.fuel = 34;
            AUDIO.effect("light");
            cb.toast("The fire catches. Warm at last.");
          } else if (p.wood >= 3 || g.stored >= 3) {
            const fromStore = Math.max(0, 3 - p.wood);
            p.wood -= 3 - fromStore; g.stored -= fromStore;
            g.fireLit = true; g.everLit = true; g.fuel = 28;
            AUDIO.effect("light");
            cb.toast("You rebuild the fire from kindling. (3 wood)");
          } else {
            cb.toast("Need 3 wood to relight the fire.");
          }
        } else if (p.wood > 0 && g.fuel < 99) {
          p.wood--;
          g.fuel = Math.min(100, g.fuel + stationStokeGain(g));
        } else if (g.stored > 0 && g.fuel < 99) {
          g.stored--;
          g.fuel = Math.min(100, g.fuel + stationStokeGain(g));
        }
      } else if (nearPile && !g.builtPile) {
        g.keys.act = false;
        if (g.pileBuildT >= 0) {
          cb.toast("Hammering away. It is almost up.");
        } else if (g.pileLogs >= SITE_COST) {
          g.pileBuildT = 0;
          cb.toast("You start stacking the wood pile. Hammer, hammer...");
        } else if (p.wood > 0) {
          const add = Math.min(p.wood, SITE_COST - g.pileLogs);
          p.wood -= add; g.pileLogs += add;
          cb.toast(g.pileLogs >= SITE_COST
            ? "All 15 logs stacked. Press ACT to build the wood pile."
            : `Stacked ${add} logs on the site. ${g.pileLogs}/15.`);
        } else cb.toast("Bring 15 logs here to build the wood pile.");
      } else if (nearPile) {
        if (p.wood > 0) {
          const move = Math.min(p.wood, pcap - g.stored);
          if (move <= 0) cb.toast("The wood pile is full.");
          else { g.stored += move; p.wood -= move; cb.toast(`Stored ${move} wood on the pile.`); }
        } else if (g.stored > 0) {
          const take = Math.min(g.stored, cap - p.wood);
          if (take <= 0) cb.toast("You cannot carry any more.");
          else { p.wood += take; g.stored -= take; cb.toast(`Took ${take} wood from the pile.`); }
        } else cb.toast("The pile is empty.");
      } else if (tree) {
        p.chopTree = tree;
        p.chopTime = (meta.up.axe ? 0.6 : 1.0) * (g.crafts.maul ? 0.7 : 1);
        p.chopT = p.chopTime;
      }
    }
  }

  // ---- hold action: keep chopping / stoking ----
  if (g.keys.act && !wantsToMove && !g.chopBlocked && p.chopT <= 0) {
    if (nearPit && g.fireLit && g.stokeCd <= 0 && g.fuel < 99) {
      if (p.wood > 0) { p.wood--; g.fuel = Math.min(100, g.fuel + stationStokeGain(g)); g.stokeCd = 0.3; }
      else if (g.stored > 0) { g.stored--; g.fuel = Math.min(100, g.fuel + stationStokeGain(g)); g.stokeCd = 0.3; }
    } else if (!nearPit && !nearBench && !nearPile && tree) {
      p.chopTree = tree;
      p.chopTime = (meta.up.axe ? 0.6 : 1.0) * (g.crafts.maul ? 0.7 : 1);
      p.chopT = p.chopTime;
    }
  }

  // chopping
  if (p.chopT > 0 && p.chopTree) {
    if (!g.trees.includes(p.chopTree)) { p.chopTree = null; p.chopT = 0; }
    else {
      p.chopT -= dt;
      if (p.chopT <= 0) {
        const tr = p.chopTree;
        tr.hp--;
        tr.hitT = 1;
        AUDIO.effect("chop");
        g.shake = 0.12;
        for (let k = 0; k < 7; k++) {
          g.chips.push({
            x: tr.x + (Math.random() * 6 - 3), y: tr.y - 10 - Math.random() * 6,
            vx: (Math.random() * 50 - 25) * (p.dir || 1), vy: -(20 + Math.random() * 40),
            life: 0.5 + Math.random() * 0.3,
          });
        }
        if (tr.hp <= 0) {
          g.trees = g.trees.filter((t: any) => t !== tr);
          g.falling.push({ x: tr.x, y: tr.y, tier: tr.tier, variant: tr.variant, id: tr.id, wood: 1 + Math.floor(Math.random() * 3), t: 0, dir: p.dir || 1, hitT: 0 });
          p.chopTree = null;
        } else {
          p.chopT = p.chopTime;
        }
      }
    }
  }

  // falling trees
  for (let i = g.falling.length - 1; i >= 0; i--) {
    const ft = g.falling[i];
    ft.t += dt;
    if (ft.t >= 0.55) {
      const w = ft.wood;
      g.pickups.push({ x: ft.x, y: ft.y, w });
      for (let k = 0; k < 10; k++) {
        g.chips.push({ x: ft.x + (Math.random() * 30 - 15), y: ft.y - 4, vx: Math.random() * 60 - 30, vy: -(Math.random() * 40 + 10), life: 0.5 });
      }
      g.shake = Math.max(g.shake, 0.15);
      cb.toast(`Tree felled. ${w} wood on the ground.`);
      g.falling.splice(i, 1);
    }
  }

  // ---- construction: workbench and wood pile rise over a few seconds ----
  const stepBuild = (isBench: boolean) => {
    const t = isBench ? g.benchBuildT : g.pileBuildT;
    if (t < 0) return;
    const nt = t + dt;
    if (isBench) g.benchBuildT = nt; else g.pileBuildT = nt;
    const bx = isBench ? BENCH_X : PILE_X;
    if (Math.random() < dt * 9) {
      g.dust.push({ x: bx + (Math.random() * 20 - 10), y: 149 - Math.random() * 8, vx: Math.random() * 12 - 6, vy: -(3 + Math.random() * 10), life: 0.8 + Math.random() * 0.6 });
    }
    if (Math.random() < dt * 2) g.shake = Math.max(g.shake, 0.05);
    if (nt >= BUILD_TIME) {
      AUDIO.effect("build");
      for (let k = 0; k < 14; k++) {
        g.dust.push({ x: bx + (Math.random() * 22 - 11), y: 148, vx: Math.random() * 40 - 20, vy: -(10 + Math.random() * 40), life: 0.9 });
      }
      g.shake = Math.max(g.shake, 0.12);
      if (isBench) { g.benchBuildT = -1; g.builtBench = true; g.benchLogs = 0; cb.toast("The workbench is built. Craft gear with wood."); }
      else { g.pileBuildT = -1; g.builtPile = true; g.pileLogs = 0; cb.toast("The wood pile is ready. Store your wood here."); }
    }
  };
  stepBuild(true);
  stepBuild(false);
  for (let i = g.dust.length - 1; i >= 0; i--) {
    const du = g.dust[i];
    du.life -= dt; du.x += du.vx * dt; du.y += du.vy * dt; du.vy += 14 * dt;
    if (du.life <= 0) g.dust.splice(i, 1);
  }

  // movement: independent of the chop timer; an interrupted swing is not
  // allowed to finish/damage its target during this update.
  p.moving = false;
  if (wantsToMove) {
    p.x += (moveRight ? 1 : -1) * speed * dt;
    p.dir = moveRight ? 1 : -1;
    p.moving = true;
    p.x = clamp(p.x, 10, WORLD_W - 10);
  }
  if (p.moving) {
    g.moveT = 2;
    g.walkSoundT -= dt;
    if (g.walkSoundT <= 0) {
      AUDIO.effect("step");
      g.walkSoundT = 0.26;
    }
  } else {
    g.moveT = Math.max(0, g.moveT - dt);
    g.walkSoundT = 0;
  }
  if (p.moving && visualSeason(g) === "winter") {
    g.footstepT = (g.footstepT || 0) - dt;
    if (g.footstepT <= 0) {
      g.footstepT = 0.22;
      g.footprints.push({ x: p.x - (p.dir || 1) * 3, y: p.y - 1, life: 9 });
      if (g.footprints.length > 70) g.footprints.shift();
    }
  } else g.footstepT = 0.04;

  if (p.torchT > 0) p.torchT -= dt;

  // pickups
  for (let i = g.pickups.length - 1; i >= 0; i--) {
    const pk = g.pickups[i];
    if (Math.abs(p.x - pk.x) < 12 && Math.abs(p.y - pk.y) < 16 && p.wood < cap) {
      const take = Math.min(pk.w, cap - p.wood);
      p.wood += take;
      pk.w -= take;
      if (pk.w <= 0) g.pickups.splice(i, 1);
    }
  }

  for (const t of g.trees) if (t.hitT > 0) t.hitT = Math.max(0, t.hitT - dt * 3);

  // ---- dog ----
  if (meta.up.dog) {
    if (!g.dog) g.dog = { x: PILE_X, y: 156, phase: "idle", t: 8, dir: 1, target: null };
    const d = g.dog;
    d.t -= dt;
    if (d.phase === "idle" && d.t <= 0 && g.builtPile) {
      if (g.trees.length) {
        let best: any = null, bd = 1e9;
        for (const t of g.trees) {
          const dd = Math.abs(t.x - CX);
          if (dd < bd) { bd = dd; best = t; }
        }
        d.target = best;
        d.phase = "go";
      } else d.t = 6;
    }
    if (d.phase === "go" && d.target) {
      if (!g.trees.includes(d.target)) { d.phase = "idle"; d.t = 4; d.target = null; }
      else {
        const dx = d.target.x - d.x;
        d.dir = dx > 0 ? 1 : -1;
        d.x += clamp(dx, -120 * dt, 120 * dt);
        if (Math.abs(dx) < 4) d.phase = "return";
      }
    }
    if (d.phase === "return") {
      const dx = PILE_X - d.x;
      d.dir = dx > 0 ? 1 : -1;
      d.x += clamp(dx, -120 * dt, 120 * dt);
      if (Math.abs(dx) < 3) {
        d.phase = "idle"; d.t = 20 + Math.random() * 12;
        g.stored += Math.min(2, Math.max(0, pcap - g.stored));
        if (Math.random() < 0.3) cb.toast("The dog drops sticks at the pile. (+2 stored)");
      }
    }
  }

  // ---- meters ----
  const f = g.fireLit ? g.fuel / 100 : 0;
  let drain = g.isNight ? 2.1 + g.depth * 0.15 : 0.85;
  if (g.weather === "coldsnap") drain += g.isNight ? 0.7 : 0.3;
  if (g.weather === "blizzard") drain += g.isNight ? 1.5 : 0.3;
  drain *= 1 - 0.15 * (meta.up.blood || 0);
  if (p.torchT > 0) drain *= 0.5;
  if (g.stage >= 6 && Math.abs(p.x - CX) < 44) drain *= 0.35;
  else if (g.stage >= 5 && Math.abs(p.x - CX) < 50) drain *= 0.6;
  let d = drain;
  const wr = 20 + f * 34;
  if (g.fireLit && Math.abs(p.x - CX) < wr) d -= 6 * (g.stage >= 2 ? 1.25 : 1) + stationLevel(g, "hearth") * 0.7;
  if (g.aurora && g.isNight) d -= 0.3;
  p.warmth = clamp(p.warmth - d * dt, 0, 100);
  if (p.warmth <= 0) {
    g.over = true;
    cb.end("dead", { nights: g.night, ash: Math.floor(g.ashEarned) });
    return;
  }

  // fuel burn
  if (g.fireLit) {
    let burn = 0.85;
    if (g.weather === "wind") burn *= g.stage >= 1 ? 1.2 : 1.5;
    if (g.weather === "rain" && g.stage < 3) burn *= 1.35;
    if (g.weather === "blizzard") burn *= 1.8;
    if (g.crafts.refl) burn *= 0.8;
    burn *= stationFuelFactor(g);
    g.fuel -= burn * dt;
    if (g.fuel <= 0) {
      g.fuel = 0; g.fireLit = false;
      cb.toast("The fire dies to embers. Relight it with 3 wood.");
    }
  }

  // ---- action label ----
  if (p.chopT > 0) g.actionLabel = "CHOP...";
  else if (nearBench) g.actionLabel = g.builtBench ? "CRAFT" : g.benchBuildT >= 0 ? "BUILDING" : g.benchLogs >= SITE_COST ? "BUILD" : p.wood > 0 ? "ADD LOGS" : "GET LOGS";
  else if (!g.fireLit && nearPit) g.actionLabel = g.firestarter > 0 ? "LIGHT" : (p.wood >= 3 || g.stored >= 3) ? "RELIGHT" : "GET WOOD";
  else if (nearPit) g.actionLabel = p.wood > 0 || g.stored > 0 ? "STOKE" : "GET WOOD";
  else if (nearPile) g.actionLabel = !g.builtPile ? (g.pileBuildT >= 0 ? "BUILDING" : g.pileLogs >= SITE_COST ? "BUILD" : p.wood > 0 ? "ADD LOGS" : "GET LOGS") : p.wood > 0 ? "STORE" : g.stored > 0 ? "TAKE" : "PILE";
  else if (tree) g.actionLabel = "CHOP";
  else g.actionLabel = "-";

  g.windAmt = windAmt;
}

// ============ ambient update (always runs) ============
function updateAmbient(g: any, dt: number) {
  g.weatherBlend = clamp(g.weatherBlend + dt / 8, 0, 1);
  updateShootingStarParade(g, dt);
  const ease = 1 - Math.exp(-Math.max(0, dt) * 13);
  g.moveFeedbackLeft += ((g.pleft || g.keys.left) ? 1 - g.moveFeedbackLeft : -g.moveFeedbackLeft) * ease;
  g.moveFeedbackRight += ((g.pright || g.keys.right) ? 1 - g.moveFeedbackRight : -g.moveFeedbackRight) * ease;
  // toasts
  for (let i = g.toasts.length - 1; i >= 0; i--) {
    g.toasts[i].life -= dt;
    if (g.toasts[i].life <= 0) g.toasts.splice(i, 1);
  }
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

// ============ sky ============
const SKY: [number, string][] = [
  [0.0, "#5a4a7a"], [0.05, "#a8c4dc"], [0.48, "#9db8d4"],
  [0.56, "#b06a4a"], [0.63, "#1c2444"], [0.93, "#141c38"], [1.0, "#5a4a7a"],
];

function skyColor(q: number): string {
  for (let i = 0; i < SKY.length - 1; i++) {
    if (q >= SKY[i][0] && q <= SKY[i + 1][0]) {
      const f = (q - SKY[i][0]) / Math.max(0.0001, SKY[i + 1][0] - SKY[i][0]);
      return lerpHex(SKY[i][1], SKY[i + 1][1], clamp(f, 0, 1));
    }
  }
  return SKY[0][1];
}

// ============ HUD ============
function drawBar(ctx: any, x: number, y: number, w: number, v: number, c1: string, c2: string) {
  ctx.fillStyle = "rgba(8,12,28,0.75)";
  ctx.fillRect(x - 1, y - 1, w + 2, 7);
  ctx.fillStyle = "rgba(60,70,100,0.8)";
  ctx.fillRect(x, y, w, 5);
  const f = (clamp(v, 0, 100) / 100) * w;
  if (f > 0) {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, Math.round(f / 2), 5);
    ctx.fillStyle = c2;
    ctx.fillRect(x + Math.round(f / 2), y, Math.round(f) - Math.round(f / 2), 5);
  }
}

function drawHUD(ctx: any, g: any, meta: any) {
  const cap = carryCap(g, meta);
  const wood = clamp(g.player.wood, 0, cap);
  // Subtle transparent ribbons preserve readability without covering the sky.
  ctx.fillStyle = "rgba(8,16,31,0.53)";
  ctx.fillRect(2, 2, 78, 20);
  ctx.fillRect(3, 23, 194, 15);
  ctx.fillRect(W - 85, 19, 83, g.endlessMode ? 32 : 25);
  ctx.fillStyle = "rgba(185,157,112,0.34)";
  ctx.fillRect(3, 22, 194, 1);
  ctx.fillRect(W - 85, 19, 83, 1);
  drawText(ctx, "WARMTH", 6, 5, "#dce3ee");
  drawBar(ctx, 32, 6, 46, g.player.warmth, "#c23b2e", "#ff8a5c");
  drawText(ctx, "FUEL", 6, 15, "#dce3ee");
  drawBar(ctx, 32, 16, 46, g.fireLit ? g.fuel : 0, "#ff8c1a", "#ffe9a0");

  drawText(ctx, "WOOD", 6, 26, "#e8dcc8");
  drawText(ctx, wood + "/" + cap, 28, 26, wood >= cap ? "#ffd98a" : "#f1e5cd");
  // Very small wood progress indicator: the numeric count remains authoritative.
  ctx.fillStyle = "rgba(73,58,39,0.85)";
  ctx.fillRect(6, 34, 54, 2);
  if (wood > 0) {
    ctx.fillStyle = wood >= cap ? "#f0bb69" : "#bd9360";
    ctx.fillRect(6, 34, Math.round(54 * wood / cap), 2);
  }
  if (g.builtPile) drawText(ctx, "PILE " + g.stored + "/" + pileCap(g), 69, 26, "#d8d0bd");
  drawText(ctx, "RUN ASH " + Math.floor(g.ashEarned), 126, 26, "#d8caf2");
  if (g.player.torchT > 0) drawText(ctx, "TORCH " + Math.ceil(g.player.torchT), 6, 40, "#ffd977");

  const rx = W - 81;
  drawText(ctx, g.isNight ? "NIGHT " + g.night : "DAY " + (g.night + 1), rx, 22, "#e0e5ef");
  drawText(ctx, WEATHER_TEXT[g.weather] || "", rx, 30, "#c8d2e8");
  drawText(ctx, visualSeason(g).toUpperCase() + " " + seasonDay(g) + "/7", rx, 38, "#dfc99a");
  if (g.endlessMode) drawText(ctx, "ENDLESS " + g.endlessN, rx, 46, "#8fd0ff");
  if (g.longNightActive && Math.sin(g.animT * 6) > 0) {
    const t = "THE LONG NIGHT";
    drawText(ctx, t, Math.round(W / 2 - textW(t) / 2), 44, "#8fd0ff");
  }
}

// toasts: centered mid-screen above the player, soft shadow, no black box
function drawToasts(ctx: any, g: any) {
  const list = g.toasts;
  for (let idx = 0; idx < list.length; idx++) {
    const t = list[list.length - 1 - idx];
    const f = clamp(t.life / 0.8, 0, 1);
    const y = 60 - idx * 9;
    const x = Math.round(W / 2 - textW(t.text) / 2);
    ctx.globalAlpha = f;
    drawTextO(ctx, t.text, x, y, "#ffe9c8", "#060a18");
    ctx.globalAlpha = 1;
  }
}

// ============ in-canvas UI ============
function panel(ctx: any, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "rgba(8,12,26,0.9)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#6a4a26";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = "#c9a86a";
  ctx.fillRect(x + 1, y + 1, w - 2, 1);
  px(ctx, x + 1, y + 1, 1, 1, "#e8d4a8");
  px(ctx, x + w - 2, y + 1, 1, 1, "#e8d4a8");
}

function uiButton(ctx: any, g: any, x: number, y: number, w: number, h: number, label: string, opts: any = {}) {
  const enabled = opts.enabled !== false;
  const sel = !!opts.sel;
  const water = !!opts.water;
  const pressed = !!opts.pressed && enabled;
  ctx.fillStyle = water ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.4)";
  ctx.fillRect(x + 1, y + 2, w, h - 1);
  if (water) {
    ctx.fillStyle = !enabled ? "rgba(17,32,45,0.34)"
      : opts.accent ? (pressed ? "rgba(128,78,34,0.48)" : "rgba(112,68,32,0.38)")
      : (pressed ? "rgba(41,79,95,0.48)" : "rgba(23,49,66,0.42)");
    ctx.fillRect(x, y, w, h);
  } else {
    px(ctx, x, y, w, h, enabled ? (sel ? "#7a4a1e" : "#4a3020") : "#1e2438");
  }
  const bc = enabled ? (water ? (opts.accent ? "#ffd98a" : "#9bc5d2") : (sel ? "#ffd98a" : "#b08a5a")) : "#3a4462";
  ctx.fillStyle = bc;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
  if (water && pressed) {
    ctx.fillStyle = "rgba(255,221,159,0.58)";
    ctx.fillRect(x + 3, y + h - 3, w - 6, 1);
  }
  drawTextC(ctx, label, x + w / 2, y + Math.floor(h / 2) - 2, enabled ? "#ffe9c8" : "#5a6480");
  g.zones.push({ x, y, w, h, onDown: enabled ? opts.onDown : undefined, onUp: opts.onUp });
}

function closeZone(ctx: any, g: any, x: number, y: number) {
  drawText(ctx, "X", x, y, "#c88a5a");
  g.zones.push({ x: x - 4, y: y - 3, w: 14, h: 11, onDown: () => { closeMenu(g); } });
}

// close the open menu; settings opened from pause returns to the pause menu
function closeMenu(g: any) {
  g.craftConfirm = null;
  g.buildConfirm = null;
  g.endRunConfirm = false;
  if (["audio", "privacy", "credits", "reset1", "reset2"].includes(g.menu)) {
    g.menu = "settings";
    g.menuSel = 0;
    return;
  }
  if (g.menu === "settings" && g.settingsFrom === "pause") {
    g.settingsFrom = null;
    g.menu = "pause";
    g.menuSel = 0;
    return;
  }
  g.menu = null;
  g.keys.act = false;
}

// pause menu: resume, tweak settings, or end the run and bank the ash
function pauseRows(g: any, meta: any) {
  return [
    {
      label: "RESUME", right: "", desc: "BACK TO THE FIRE", h: 15, enabled: true,
      onDown: () => { g.menu = null; g.keys.act = false; },
    },
    {
      label: "SETTINGS", right: "", desc: "FULLSCREEN AND MORE", h: 15, enabled: true,
      onDown: () => { g.settingsFrom = "pause"; g.menu = "settings"; g.menuSel = 0; },
    },
    {
      label: "END RUN", right: "+" + Math.floor(g.ashEarned) + " ASH", desc: "BANK ALL EARNED ASH. TAP TWICE.", h: 15,
      enabled: true,
      onDown: () => {
        if (!g.endRunConfirm) { g.endRunConfirm = true; return; }
        g.settingsFrom = null;
        g.endRunConfirm = false;
        if (g.cb && g.cb.end) g.cb.end("retired", { nights: g.night, ash: Math.floor(g.ashEarned) });
      },
    },
  ];
}

function stationUpgradeRow(g: any, id: "hearth" | "bench" | "pile") {
  const info = CAMP_STATIONS[id], level = stationLevel(g, id);
  const available = stationAvailable(g, id);
  const maxed = level >= 2, cost = stationCost(g, id);
  const total = g.player.wood + g.stored;
  const confirming = g.buildConfirm === id && available && !maxed && total >= cost;
  return {
    label: info.label + " LV" + level + (maxed ? " MAX" : " -> LV" + (level + 1)),
    right: maxed ? "MAX" : !available ? "BUILD FIRST" : confirming ? "CONFIRM?" : cost + " WOOD",
    desc: maxed ? "FULLY UPGRADED" : !available ? "BUILD THIS STATION FIRST"
      : confirming ? "TAP AGAIN TO UPGRADE" : info.benefits[level],
    h: 15, enabled: available && !maxed && total >= cost,
    onDown: () => {
      if (!available) { g.buildConfirm = null; toast(g, "BUILD THE " + info.label + " FIRST."); return; }
      if (maxed) { g.buildConfirm = null; toast(g, info.label + " IS MAX LEVEL."); return; }
      if (g.player.wood + g.stored < cost) { g.buildConfirm = null; toast(g, "NOT ENOUGH WOOD."); return; }
      if (g.buildConfirm !== id) { g.buildConfirm = id; return; }
      g.buildConfirm = null;
      if (!purchaseStation(g, id)) { toast(g, "NOT ENOUGH WOOD."); return; }
      g.ashEarned += 2;
      AUDIO.effect("build");
      toast(g, info.label + " NOW LEVEL " + stationLevel(g, id) + ".");
    }
  };
}

function benchRows(g: any, meta: any) {
  const recipes = CRAFTS.map((c: any) => {
    const level = stationLevel(g, "bench"), locked = level < (c.benchTier || 0);
    const owned = !!g.crafts[c.id];
    const cost = stationCraftCost(g, c);
    const total = g.player.wood + g.stored;
    const enabled = !locked && !owned && total >= cost;
    const confirm = g.craftConfirm === c.id && enabled;
    return {
      label: c.name.toUpperCase(),
      right: locked ? "BENCH LV" + c.benchTier : owned ? "OWNED" : confirm ? "CONFIRM?" : cost + " WOOD",
      desc: locked ? "UPGRADE WORKBENCH IN BUILD" :
        confirm ? "TAP AGAIN TO CRAFT - " + cost + " WOOD" : c.desc,
      h: 15, enabled,
      onDown: () => {
        g.buildConfirm = null;
        if (locked) { g.craftConfirm = null; toast(g, "UPGRADE WORKBENCH IN BUILD FIRST."); return; }
        if (g.crafts[c.id]) { g.craftConfirm = null; toast(g, c.name.toUpperCase() + " is already crafted."); return; }
        const realCost = stationCraftCost(g, c);
        if (g.player.wood + g.stored < realCost) { g.craftConfirm = null; toast(g, "Not enough wood."); return; }
        if (g.craftConfirm !== c.id) { g.craftConfirm = c.id; return; }
        g.craftConfirm = null;
        const fromCarried = Math.min(g.player.wood, realCost);
        g.player.wood -= fromCarried;
        g.stored -= realCost - fromCarried;
        g.crafts[c.id] = true;
        toast(g, c.name.toUpperCase() + " crafted.");
      },
    };
  });
  // Convenient alternate place to improve the workbench itself.
  recipes.push(stationUpgradeRow(g, "bench"));
  return recipes;
}

function shopRows(g: any, meta: any) {
  return UPGRADES.filter((u: any) => g.shopTab === 1 ? u.id === "dog" : u.id !== "dog").map((u: any) => {
    const lvl = meta.up[u.id] || 0;
    const maxed = lvl >= u.max;
    const cost = maxed ? 0 : u.costs[lvl];
    const confirm = g.upConfirm === u.id;
    const enabled = !maxed && meta.ash >= cost;
    return {
      label: u.name.toUpperCase() + (u.max > 1 ? " " + lvl + "/" + u.max : ""),
      right: maxed ? "OWNED" : confirm ? "BUY?" : cost + " ASH",
      desc: maxed ? u.desc : confirm ? "PRESS AGAIN TO CONFIRM" : u.desc,
      h: 15,
      enabled,
      onDown: () => {
        if (maxed) { toast(g, u.name.toUpperCase() + " is already yours."); return; }
        if (meta.ash < cost) { toast(g, "Not enough ash."); return; }
        if (g.upConfirm !== u.id) { g.upConfirm = u.id; return; }
        g.upConfirm = null;
        meta.ash -= cost;
        meta.up[u.id] = lvl + 1;
        saveMeta(meta);
        toast(g, u.name.toUpperCase() + " unlocked.");
      },
    };
  });
}

function menuRows(g: any, meta: any): any[] {
  if (g.menu === "bench") return benchRows(g, meta);
  if (g.menu === "shop") return g.shopTab === 2 ? [] : shopRows(g, meta);
  if (g.menu === "build") return buildRows(g, meta);
  if (g.menu === "settings") return settingsRows(g, meta);
  if (g.menu === "audio") return audioRows(g);
  if (g.menu === "reset1" || g.menu === "reset2") return resetRows(g, meta);
  if (g.menu === "pause") return pauseRows(g, meta);
  return [];
}

function moveSel(g: any, meta: any, dir: number) {
  const rows = menuRows(g, meta);
  if (!rows.length) return;
  g.menuSel = (g.menuSel + dir + rows.length) % rows.length;
  if (g.menu === "bench") g.craftConfirm = null;
  if (g.menu === "pause") g.endRunConfirm = false;
  if (g.menu === "build" || g.menu === "bench") g.buildConfirm = null;
}

function activateSel(g: any, meta: any) {
  const rows = menuRows(g, meta);
  if (!rows.length) return;
  g.menuSel = clamp(g.menuSel, 0, rows.length - 1);
  rows[g.menuSel].onDown();
}

function doBuildAction(g: any, meta: any) {
  if (g.stage >= 6) { g.menu = null; return; }
  if (g.stage === 5 && !canCompleteCabin(g)) { toast(g, "UPGRADE FIREPLACE, WORKBENCH & LOG STORAGE TO LV1 FIRST."); return; }
  const cost = Math.round(STAGES[g.stage].cost * (meta.up.blue ? 0.8 : 1));
  if (g.player.wood + g.stored < cost) { toast(g, "Not enough wood."); return; }
  const fromCarried = Math.min(g.player.wood, cost);
  g.player.wood -= fromCarried;
  g.stored -= cost - fromCarried;
  g.stage++;
  g.ashEarned += 4;
  AUDIO.effect("build");
  g.menu = null;
  g.keys.act = false;
  toast(g, STAGES[g.stage - 1].name + " built.");
  if (g.stage === 4) toast(g, "The shed is up. The wood pile holds 40 now.");
  if (g.stage === 6) {
    g.longNightPending = true;
    toast(g, "The cabin is complete. Something howls in the distance.");
    toast(g, "THE LONG NIGHT comes at nightfall. Stock up on wood.");
  }
}

function drawListMenu(ctx: any, g: any, title: string, right: string, rows: any[]) {
  const n = rows.length;
  const pw = 272, ph = 32 + n * 15 + 12;
  const x0 = Math.round((W - pw) / 2);
  const y0 = Math.max(8, Math.round((H - ph) / 2) - 4);
  panel(ctx, x0, y0, pw, ph);
  drawText(ctx, title, x0 + 6, y0 + 5, "#ffd98a");
  drawText(ctx, right, x0 + pw - 24 - textW(right), y0 + 5, "#cfc2f0");
  closeZone(ctx, g, x0 + pw - 12, y0 + 5);
  let y = y0 + 16;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (i === g.menuSel) {
      px(ctx, x0 + 3, y, pw - 6, r.h,
        r.red ? "rgba(211,65,65,0.22)" : "rgba(255,217,138,0.11)");
      px(ctx, x0 + 3, y + 1, 2, Math.max(1, r.h - 2),
        r.red ? "#f37e70" : "#dcb779");
    }
    drawText(ctx, r.label, x0 + 9, y + 1, !r.enabled ? "#5a6480" : r.red ? "#ff7272" : "#ffe9c8");
    drawText(ctx, r.right, x0 + pw - 9 - textW(r.right), y + 1, !r.enabled ? "#5a6480" : r.red ? "#ff7272" : "#d9c9a0");
    drawText(ctx, r.desc, x0 + 9, y + 8, "#a4acc0");
    if (r.volumeKey) {
      const level = AUDIO.getLevel(r.volumeKey);
      ctx.fillStyle = "rgba(41,53,71,0.92)";
      ctx.fillRect(x0 + 191, y + 10, 49, 3);
      if (level > 0) {
        ctx.fillStyle = "#caa46b";
        ctx.fillRect(x0 + 191, y + 10, Math.round(level * 49 / 100), 3);
      }
    }
    const idx = i;
    g.zones.push({ x: x0 + 3, y, w: pw - 6, h: r.h, onDown: () => { g.menuSel = idx; rows[idx].onDown(); } });
    if (r.onAdjust) {
      // Separate +/- touch targets; full row still increments for convenience.
      g.zones.push({ x: x0 + pw - 39, y, w: 12, h: r.h, onDown: () => { g.menuSel = idx; r.onAdjust(-1); } });
      g.zones.push({ x: x0 + pw - 17, y, w: 12, h: r.h, onDown: () => { g.menuSel = idx; r.onAdjust(1); } });
    }
    y += r.h;
  }
  const foot = "W/S PICK - E SELECT - ESC CLOSE";
  drawText(ctx, foot, Math.round(W / 2 - textW(foot) / 2), y + 4, "#5a6480");
}

function buildRows(g: any, meta: any) {
  const rows: any[] = [];
  const total = () => g.player.wood + g.stored;
  if (g.stage < 6) {
    const cost = Math.round(STAGES[g.stage].cost * (meta.up.blue ? 0.8 : 1));
    const needsStations = g.stage === 5 && !canCompleteCabin(g);
    rows.push({
      label: STAGES[g.stage].name.toUpperCase(),
      right: needsStations ? "3 STATIONS LV1" : g.buildConfirm === "stage" ? "CONFIRM?" : cost + " WOOD",
      desc: needsStations ? "HEARTH, BENCH AND STORAGE LV1 FIRST" :
        g.buildConfirm === "stage" ? "TAP AGAIN TO BUILD" : STAGES[g.stage].desc.toUpperCase(),
      h: 15, enabled: !needsStations && total() >= cost,
      onDown: () => {
        if (needsStations) { g.buildConfirm = null; toast(g, "UPGRADE FIREPLACE, WORKBENCH & LOG STORAGE TO LV1 FIRST."); return; }
        if (total() < cost) { g.buildConfirm = null; toast(g, "NOT ENOUGH WOOD."); return; }
        if (g.buildConfirm !== "stage") { g.buildConfirm = "stage"; return; }
        g.buildConfirm = null;
        doBuildAction(g, meta);
      },
    });
  }
  for (const id of stationIds) rows.push(stationUpgradeRow(g, id));
  return rows;
}

function resetAllProgress(g: any, meta: any) {
  // Delete only our own progress keys; leave sound preferences untouched.
  clearRunSnapshot();
  try { localStorage.removeItem(META_KEY); } catch (_e) {}
  for (const key of LEGACY_KEYS) {
    try { localStorage.removeItem(key); } catch (_e) {}
  }
  Object.assign(meta, {
    ash: 0, totalAsh: 0, best: 0, runs: 0, wonEver: false, up: {}
  });
  setupTitleScene(g);
  g.resumeData = null;
  g.settingsFrom = null;
  g.menu = null;
  g.menuSel = 0;
  g.titleSel = 0;
}
function settingsRows(g: any, meta: any) {
  return [
    {
      label: "AUDIO", right: "", desc: "MASTER AMBIENCE AND EFFECTS VOLUME",
      h: 15, enabled: true,
      onDown: () => { g.menu = "audio"; g.menuSel = 0; }
    },
    {
      label: "FULLSCREEN", right: g.fs ? "ON" : "OFF",
      desc: "TAP HERE OR PRESS F TO TOGGLE", h: 15, enabled: true,
      onDown: () => { if (g.fsToggle) g.fsToggle(); }
    },
    {
      label: "VISUAL FX", right: GRAPHICS.high ? "HIGH" : "LOW",
      desc: "LOW USES FEWER PARTICLES/REFLECTIONS", h: 15, enabled: true,
      onDown: () => GRAPHICS.toggle()
    },
    {
      label: "PRIVACY POLICY", right: "", desc: "LOCAL SAVES AND THIRD PARTY HOSTING",
      h: 15, enabled: true,
      onDown: () => { g.menu = "privacy"; g.menuSel = 0; }
    },
    {
      label: "CREDITS", right: "", desc: "MAKERS AND SOFTWARE LIBRARIES",
      h: 15, enabled: true,
      onDown: () => { g.menu = "credits"; g.menuSel = 0; }
    },
    {
      label: "RESET SAVE", right: "!", desc: "PERMANENTLY ERASE ALL GAME PROGRESS",
      h: 15, enabled: true, red: true,
      onDown: () => { g.menu = "reset1"; g.menuSel = 1; }
    },
    {
      label: "BACK", right: "", desc: "RETURN TO PREVIOUS SCREEN",
      h: 15, enabled: true,
      onDown: () => closeMenu(g)
    },
  ];
}
function audioRows(g: any) {
  return [
    {
      label: "SOUND", right: AUDIO.enabled ? "ON" : "OFF",
      desc: "ALL GAME AUDIO ON OR OFF", h: 15, enabled: true,
      onDown: () => AUDIO.setEnabled(!AUDIO.enabled)
    },
    ...[
      { key: "master", label: "MASTER", desc: "OVERALL GAME LOUDNESS" },
      { key: "ambience", label: "AMBIENCE", desc: "WIND BACKGROUND AUDIO" },
      { key: "effects", label: "EFFECTS", desc: "STEPS CHOPPING BUILDING AND MORE" }
    ].map((v: any) => ({
      label: v.label, right: "- " + AUDIO.getLevel(v.key) + "% +",
      desc: v.desc, h: 15, enabled: true, volumeKey: v.key,
      onAdjust: (dir: number) => AUDIO.adjust(v.key, dir),
      onDown: () => AUDIO.adjust(v.key, 1)
    })),
    {
      label: "BACK", right: "", desc: "RETURN TO SETTINGS",
      h: 15, enabled: true, onDown: () => closeMenu(g)
    }
  ];
}
function resetRows(g: any, meta: any) {
  if (g.menu === "reset1") {
    return [
      {
        label: "CANCEL", right: "", desc: "KEEP ALL YOUR PROGRESS",
        h: 15, enabled: true, onDown: () => closeMenu(g)
      },
      {
        label: "CONTINUE", right: "!", desc: "GO TO FINAL DELETION CONFIRMATION",
        h: 15, enabled: true, red: true,
        onDown: () => { g.menu = "reset2"; g.menuSel = 0; }
      }
    ];
  }
  return [
    {
      label: "CANCEL", right: "", desc: "KEEP ALL YOUR PROGRESS",
      h: 15, enabled: true, onDown: () => closeMenu(g)
    },
    {
      label: "ERASE SAVE", right: "!", desc: "FINAL STEP - CANNOT BE UNDONE",
      h: 15, enabled: true, red: true,
      onDown: () => resetAllProgress(g, meta)
    }
  ];
}


function drawHelpMenu(ctx: any, g: any) {
  drawIllustratedGuide(ctx, g, () => closeMenu(g));
}

function drawInfoMenu(ctx: any, g: any, title: string, lines: string[], hasPolicyLink: boolean) {
  panel(ctx, 23, 10, 274, 160);
  drawText(ctx, title, 31, 17, "#ffd98a");
  closeZone(ctx, g, 283, 17);
  let y = 32;
  for (const line of lines) {
    if (line) drawText(ctx, line, 31, y, "#c5d2e2");
    y += 8;
  }
  if (hasPolicyLink) {
    uiButton(ctx, g, 77, 141, 166, 16, "OPEN FULL POLICY", {
      onDown: () => {
        // User gesture allows a new tab without losing the current run.
        const url = new URL("./privacy.html", window.location.href).href;
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  } else {
    uiButton(ctx, g, 118, 143, 84, 15, "BACK", { onDown: () => closeMenu(g) });
  }
}

function drawMenu(ctx: any, g: any, meta: any) {
  ctx.fillStyle = "rgba(4,6,16,0.5)";
  ctx.fillRect(0, 0, W, H);
  if (g.menu === "bench") {
    drawListMenu(ctx, g, "WORKBENCH", "WOOD " + g.player.wood + " + PILE " + g.stored, benchRows(g, meta));
  } else if (g.menu === "shop") {
    drawShopTabs(ctx, g, meta, shopRows(g, meta), () => closeMenu(g));
  } else if (g.menu === "build") {
    drawListMenu(ctx, g, "BUILD", "WOOD " + (g.player.wood + g.stored), buildRows(g, meta));
  } else if (g.menu === "settings") {
    drawListMenu(ctx, g, "SETTINGS", "", settingsRows(g, meta));
  } else if (g.menu === "audio") {
    drawListMenu(ctx, g, "AUDIO", "", audioRows(g));
  } else if (g.menu === "reset1" || g.menu === "reset2") {
    drawListMenu(ctx, g, g.menu === "reset1" ? "RESET SAVE? 1/2" : "FINAL WARNING 2/2",
      "!", resetRows(g, meta));
  } else if (g.menu === "pause") {
    drawListMenu(ctx, g, "PAUSED", "RUN ASH " + Math.floor(g.ashEarned), pauseRows(g, meta));
  } else if (g.menu === "help") {
    drawHelpMenu(ctx, g);
  } else if (g.menu === "privacy") {
    drawInfoMenu(ctx, g, "PRIVACY POLICY", [
      "THIS GAME DOES NOT REQUIRE AN ACCOUNT.",
      "GAME PROGRESS AND SOUND PREFERENCES",
      "ARE STORED LOCALLY IN THIS BROWSER.",
      "NO IN-GAME ANALYTICS OR ADS ARE",
      "IMPLEMENTED IN THE GAME SOURCE.",
      "",
      "GITHUB PAGES HOSTS THE GAME. EXTERNAL",
      "LIBRARIES ARE LOADED FROM UNPKG AND",
      "TAILWIND CDN. THOSE PROVIDERS MAY",
      "RECEIVE IP/REQUEST DATA UNDER THEIR",
      "OWN POLICIES.",
      "",
      "FULL POLICY AVAILABLE ONLINE BELOW."
    ], true);
  } else if (g.menu === "credits") {
    drawInfoMenu(ctx, g, "CREDITS", [
      "SEKAMPFIRE",
      "A GAME BY SEKAFAJI.",
      "",
      "PROCEDURAL PIXEL ART AND AUDIO.",
      "BUILT WITH HTML CANVAS AND REACT.",
      "REACT DOM / BABEL / TAILWIND CSS.",
      "",
      "INSPIRED BY ATMOSPHERIC PIXEL GAMES.",
      "NO THIRD PARTY GAME SPRITES USED.",
      "",
      "THANK YOU FOR PLAYING!"
    ], false);
  }
}

// bottom bar: smaller main button flanked by BUILD and TORCH
function drawRunChrome(ctx: any, g: any) {
  const act = g.actionLabel || "-";
  // Gameplay controls float over the river; movement arrows remain untouched.
  uiButton(ctx, g, 133, H - 29, 54, 26, act, {
    enabled: act !== "-", water: true, accent: true, pressed: !!g.keys.act,
    onDown: () => { g.pressE = true; g.keys.act = true; },
    onUp: () => { g.keys.act = false; g.chopBlocked = false; },
  });
  uiButton(ctx, g, 77, H - 22, 47, 18, "BUILD", {
    water: true, onDown: () => { g.menu = "build"; g.menuSel = 0; g.keys.act = false; },
  });
  const t = g.player.torchT;
  const tLbl = t > 0 ? "TORCH " + Math.ceil(t) : "TORCH";
  uiButton(ctx, g, 196, H - 22, 48, 18, tLbl, {
    water: true, enabled: t <= 0 && g.fireLit, onDown: () => { g.pressT = true; },
  });
  // Located immediately below the minimap, away from the world and river controls.
  uiButton(ctx, g, 284, 21, 32, 16, "MENU", {
    onDown: () => { g.menu = "pause"; g.menuSel = 0; g.keys.act = false; },
  });
}

// Large, restrained directional feedback behind the EXISTING movement chevrons.
// Pointer and keyboard input both work; the arrow geometry itself is unchanged.
function drawMovementFeedback(ctx: any, g: any) {
  // Smooth 15% edge indicator: soft spatial fade and a short time fade-out.
  // Never draw extra arrows, and don't alter existing input hit areas.
  const width = Math.round(W * 0.15);
  const drawSide = (side: "left" | "right", intensity: number) => {
    if (intensity < 0.015) return;
    const x = side === "left" ? 0 : W - width;
    const alpha = (g.isNight ? 0.18 : 0.28) * clamp(intensity, 0, 1);
    // During daylight the entire pressed side darkens softly. No amber
    // overlay remains; nighttime colour and time-based fading are unchanged.
    const bright = g.isNight ? "194,215,230" : "24,37,43";
    const fill = ctx.createLinearGradient(x, 0, x + width, 0);
    fill.addColorStop(0, side === "left" ? `rgba(${bright},${alpha})` : `rgba(${bright},0)`);
    fill.addColorStop(1, side === "left" ? `rgba(${bright},0)` : `rgba(${bright},${alpha})`);
    ctx.fillStyle = fill;
    ctx.fillRect(x, 0, width, H);
  };
  drawSide("left", g.moveFeedbackLeft || 0);
  drawSide("right", g.moveFeedbackRight || 0);
}

// movement chevrons mid-screen on both sides - movement hint, not a button
// darker ink during the bright day, pale light at night so they always read
function drawSideArrows(ctx: any, g: any) {
  const actL = !!(g.pleft || g.keys.left);
  const actR = !!(g.pright || g.keys.right);
  const pulse = 0.5 + 0.5 * Math.sin(g.animT * 2);
  const cy = 92;
  const drawChev = (dir: number, active: boolean) => {
    // Daytime pressed arrows use charcoal with a cool pale pixel outline,
    // rather than any yellow. Nighttime and idle guidance remain unchanged.
    const pressedDay = active && !g.isNight;
    const main = active
      ? (g.isNight ? "rgba(255,219,147,0.96)" : "rgba(29,43,49,0.98)")
      : g.isNight
        ? `rgba(236,245,250,${(0.56 + pulse * 0.13).toFixed(3)})`
        : `rgba(255,246,218,${(0.78 + pulse * 0.13).toFixed(3)})`;
    const outline = pressedDay ? "rgba(219,230,234,0.90)" : "rgba(14,23,34,0.82)";
    for (let i = 0; i < 7; i++) {
      const ind = Math.abs(i - 3);
      const xx = dir < 0 ? 14 + ind * 3 : W - 16 - ind * 3;
      const yy = cy - 7 + i * 2;
      ctx.fillStyle = outline;
      ctx.fillRect(xx - 1, yy - 1, 4, 4);
      ctx.fillStyle = main;
      ctx.fillRect(xx, yy, 2, 2);
    }
  };
  drawChev(-1, actL);
  drawChev(1, actR);
}

function titleActions(g: any, meta: any): any[] {
  const run = [
    ...(g.resumeData ? [{
      label: "CONTINUE RUN", act: () => resumeRun(g, g.resumeData)
    }, {
      label: "NEW RUN", act: () => startRun(g, meta)
    }] : [{
      label: "START RUN", act: () => startRun(g, meta)
    }])
  ];
  return run.concat([
    { label: "SHOP", act: () => { g.menu = "shop"; g.shopTab = 0; g.menuSel = 0; } },
    { label: "SETTINGS", act: () => { g.menu = "settings"; g.menuSel = 0; } },
  ]);
}
function returnToMainMenu(g: any) {
  // End-of-run rewards have already been banked and the checkpoint cleared.
  // Returning to the title must never start or re-bank a completed run.
  setupTitleScene(g);
  g.resumeData = loadRunSnapshot();
  g.titleSel = 0;
  g.menu = null;
}

function activateTitleItem(g: any, meta: any, idx: number) {
  const actions = titleActions(g, meta);
  const chosen = actions[idx];
  if (chosen) chosen.act();
}

function drawScreen(ctx: any, g: any, meta: any) {
  if (g.ui === "title") {
    ctx.fillStyle = "rgba(6,8,20,0.38)";
    ctx.fillRect(0, 0, W, H);
    // warm glow behind the logo
    ctx.globalCompositeOperation = "lighter";
    const lg = ctx.createRadialGradient(W / 2, 30, 0, W / 2, 30, 72);
    lg.addColorStop(0, "rgba(255,150,60,0.14)");
    lg.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, W, 95);
    ctx.globalCompositeOperation = "source-over";
    // floating embers around the logo
    for (let i = 0; i < 10; i++) {
      const ex = 92 + i * 16 + Math.sin(g.animT * 0.8 + i * 2.1) * 10;
      const ey = 46 - ((g.animT * 7 + i * 9) % 34);
      const a = clamp((ey - 12) / 34, 0, 1) * 0.7;
      ctx.fillStyle = `rgba(255,190,90,${a * 0.6})`;
      ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1);
    }
    drawBig(ctx, "SEKAMPFIRE", W / 2 + 2, 18 + 2, 5, "#3a2408");
    drawBig(ctx, "SEKAMPFIRE", W / 2, 18, 5, "#ffd98a");
    drawTextC(ctx, "FOUR SEASONS. ONE FIRE.", W / 2, 50, "#c8d2e8");
    drawTextC(ctx, "BANKED ASH " + meta.ash + " - BEST " + (meta.best || 0) + " NIGHTS", W / 2, 60, "#d0c9d3");
    // Main decisions stay compact and centred; optional help and socials
    // occupy separate side areas without cluttering keyboard navigation.
    const items = titleActions(g, meta);
    const menuTop = 76, rowStep = 14;
    const menuHeight = items.length * rowStep + 2;
    panel(ctx, 98, menuTop, 124, menuHeight);
    g.titleSel = clamp(g.titleSel || 0, 0, items.length - 1);
    for (let i = 0; i < items.length; i++) {
      const y = menuTop + 5 + i * rowStep;
      const sel = i === g.titleSel;
      if (sel) px(ctx, 102, y - 2, 116, 12, "rgba(255,217,138,0.13)");
      drawTextC(ctx, items[i].label, W / 2 + (sel ? 4 : 0), y, sel ? "#ffd98a" : "#a5b0c5");
      if (sel) drawFlame(ctx, 112, y + 4, g.animT, 0.12);
      const idx = i, it = items[i];
      g.zones.push({ x: 102, y: y - 3, w: 116, h: 14, onDown: () => { g.titleSel = idx; it.act(); } });
    }
    // Standalone tutorial plaque to the right, available regardless of
    // whether the player has a resumable run.
    uiButton(ctx, g, 236, 107, 74, 18, "HOW TO PLAY", {
      onDown: () => { g.menu = "help"; g.helpPage = 0; }
    });

    // A small vertical stack of pixel-framed socials. No new audio, popup
    // or accounts: these are explicit user-initiated external links only.
    const socials = [
      { y: 127, glyph: "D", title: "DISCORD", url: "https://discord.gg/794QQWJEeP", fill: "#5865a5" },
      { y: 147, glyph: "YT", title: "YOUTUBE", url: "https://youtube.com/@sekafajigames", fill: "#ae3940" },
    ];
    for (const social of socials) {
      px(ctx, 9, social.y, 78, 17, "rgba(10,15,29,0.78)");
      px(ctx, 9, social.y, 78, 1, "#a48457");
      px(ctx, 9, social.y + 16, 78, 1, "#625039");
      px(ctx, 10, social.y + 1, 16, 15, "#222d3e");
      px(ctx, 12, social.y + 3, 12, 11, social.fill);
      drawTextC(ctx, social.glyph, 18, social.y + 6, "#fff1d5");
      drawText(ctx, social.title, 31, social.y + 6, "#cfdaea");
      g.zones.push({
        x: 9, y: social.y, w: 78, h: 17,
        onDown: () => window.open(social.url, "_blank", "noopener,noreferrer"),
      });
    }

  } else if (g.ui === "dead" && g.lastResult) {
    ctx.fillStyle = "rgba(8,10,26,0.62)";
    ctx.fillRect(0, 0, W, H);
    const retired = g.lastResult.kind === "retired";
    const head = retired ? "YOU HEADED HOME" : "THE COLD TOOK YOU";
    drawBig(ctx, head, W / 2 + 2, 38 + 2, 2, "#060a18");
    drawBig(ctx, head, W / 2, 38, 2, retired ? "#ffd98a" : "#a8c4e8");
    drawTextC(ctx, "YOU SURVIVED " + g.lastResult.nights + (g.lastResult.nights === 1 ? " NIGHT." : " NIGHTS."), W / 2, 62, "#c8d2e8");
    drawTextC(ctx, "+" + g.lastResult.ash + " ASH BANKED. (TOTAL " + meta.ash + ")", W / 2, 72, "#ffd98a");
    uiButton(ctx, g, 100, 94, 120, 15, "TRY AGAIN", { onDown: () => startRun(g, meta) });
    uiButton(ctx, g, 100, 113, 120, 13, "SHOP", { onDown: () => { g.menu = "shop"; g.shopTab = 0; g.menuSel = 0; } });
    uiButton(ctx, g, 100, 130, 120, 13, "MAIN MENU", { onDown: () => returnToMainMenu(g) });
  } else if (g.ui === "win" && g.lastResult) {
    ctx.fillStyle = "rgba(8,10,26,0.55)";
    ctx.fillRect(0, 0, W, H);
    drawBig(ctx, "DAWN AT LAST", W / 2 + 2, 28 + 2, 3, "#3a2408");
    drawBig(ctx, "DAWN AT LAST", W / 2, 28, 3, "#ffd98a");
    drawTextC(ctx, "THE LONG NIGHT HAS PASSED. THE CABIN IS YOURS.", W / 2, 52, "#c8d2e8");
    drawTextC(ctx, "NIGHTS " + g.lastResult.nights + " - RUN ASH +" + Math.floor(g.ashEarned), W / 2, 62, "#ffd98a");
    drawTextC(ctx, "YOUR FIRST CAMP IS COMPLETE!", W / 2, 72, "#d6e4eb");
    uiButton(ctx, g, 83, 92, 154, 17, "END RUN + BANK ASH", { onDown: () => {
      if (g.cb && g.cb.end) {
        g.cb.end("won", { nights: g.night, ash: Math.floor(g.ashEarned) });
        returnToMainMenu(g);
      }
    } });
    uiButton(ctx, g, 83, 114, 154, 17, "CONTINUE SURVIVING", { onDown: () => goEndless(g) });
    drawTextC(ctx, "CONTINUE: BANK LATER VIA MENU > END RUN", W / 2, 143, "#c0cae0");
  }
}

// Gameplay and menus inject their handlers into this input adapter.
const { handleKey, handlePointer } = createInputHandlers({
  audioRows, moveSel, titleActions, activateSel, closeMenu, activateTitleItem, startRun, goEndless, returnToMainMenu
});

// ============ world-object reflection ============
// Render only visible objects into a transparent buffer: mirroring the completed
// screen previously reflected the bright ground strip instead of the player.
// The downward offset aligns world feet with the water surface.
function renderReflectionSubjects(rctx: any, g: any, colors: any, camX: number) {
  rctx.clearRect(0, 0, W, H);
  // A faint reflection of the nearer shoreline woodland adds depth,
  // but distant mountains/sky must not mirror as solid scenery.
  rctx.save();
  rctx.translate(0, WATER_Y - PLAYER_Y + 1);
  rctx.globalAlpha = 0.13;
  drawForestLayer(rctx, camX, 0.48, GROUND + 10, colors.near, 22, 9, colors.name);
  rctx.restore();
  rctx.save();
  rctx.translate(-Math.round(camX), WATER_Y - PLAYER_Y + 1);
  drawStructures(rctx, g);
  for (const tree of g.trees) {
    if (tree.x < camX - 40 || tree.x > camX + W + 40) continue;
    drawTree(rctx, tree, g.animT, g.windAmt || 0, colors);
  }
  for (const tree of g.falling) {
    if (tree.x >= camX - 40 && tree.x <= camX + W + 40) {
      drawFallingTree(rctx, tree, g.animT, colors);
    }
  }
  drawFire(rctx, g);
  // Shoreline wildlife belongs in the same reflection buffer as the player.
  // High flying birds naturally stay out of the mirrored water scanlines.
  for (const critter of g.critters || []) {
    if (critter.x >= camX - 20 && critter.x <= camX + W + 20) {
      drawCritter(rctx, critter, g);
    }
  }
  if (g.dog && g.dog.x >= camX - 20 && g.dog.x <= camX + W + 20) drawDog(rctx, g);
  if (g.player.x >= camX - 20 && g.player.x <= camX + W + 20) drawPlayer(rctx, g);
  rctx.restore();
}

// Paint the lake to the full canvas bottom, without a separate footer bar.
// Reflections are object silhouettes and moving firelight, not the solid ground.
function drawReflectiveRiver(ctx: any, g: any, reflection: any, rctx: any,
                            darkness: number, camX: number) {
  const palette = visualPalette(g);
  renderReflectionSubjects(rctx, g, palette, camX);
  const height = H - WATER_Y;
  const night = clamp(darkness, 0, 1);
  const waterBase = lerpHex(palette.water, "#102335", night * 0.88);
  ctx.fillStyle = waterBase;
  ctx.fillRect(0, WATER_Y - 2, W, H - WATER_Y + 2);
  ctx.save();
  const pixelStep = GRAPHICS.high ? 1 : 2;
  for (let i = 0; i < height; i += pixelStep) {
    // Exact vertical mirror of the aligned sprites: no 18px source offset.
    const srcY = WATER_Y - 1 - i;
    if (srcY < 0) break;
    const wind = g.weather === "wind" || g.weather === "blizzard" ? 1.6 : 1;
    const shift = reflectionOffset(g.animT, i, wind);
    const sx = Math.max(0, -shift);
    const dx = Math.max(0, shift);
    ctx.globalAlpha = reflectionOpacity(i, height, g.weather === "blizzard");
    ctx.drawImage(reflection, sx, srcY, W - Math.abs(shift), 1,
      dx, WATER_Y + i, W - Math.abs(shift), Math.min(pixelStep, height - i));
  }
  ctx.restore();
  // Season-aware, broken surface glints move independently of the mirrored
  // sprites, so they never drag the player's or wildlife's reflection.
  const glintColor = palette.name === "autumn" ? "217,187,139"
    : palette.name === "winter" ? "216,235,244"
    : palette.name === "spring" ? "169,225,204" : "180,222,231";
  const rippleCount = GRAPHICS.high ? 15 : 9;
  for (let i = 0; i < rippleCount; i++) {
    const glint = waterGlint(g.animT, i, camX, W);
    const y = WATER_Y + glint.y;
    if (y >= H - 1) continue;
    ctx.fillStyle = `rgba(${glintColor},${(glint.alpha * (1 - night * 0.45)).toFixed(3)})`;
    ctx.fillRect(glint.x, y, glint.length, 1);
    // Secondary fragment makes the highlight read as broken water motion.
    if (i % 3 === 0) ctx.fillRect((glint.x + glint.length + 3) % W, y + 1, 3, 1);
  }
  const bank = lerpHex(palette.shore, "#243746", night * 0.92);
  const washTone = palette.name === "autumn" ? "207,173,126"
    : palette.name === "winter" ? "213,230,237"
    : palette.name === "spring" ? "166,207,178" : "176,212,207";
  const breeze = g.weather === "wind" || g.weather === "blizzard" ? 1.28 : 1;
  // Small bank waves wash back and forth over one or two logical pixels.
  // Broken foam glints fade out; never a full-width white shoreline stripe.
  for (let x = 0; x < W; x += 3) {
    const wx = x + camX;
    const irregular = Math.round(Math.sin(wx * 0.05) * 0.5 +
      Math.sin(wx * 0.13) * 0.5);
    const y = WATER_Y - 2 + irregular +
      shorelineWaveOffset(g.animT, wx, breeze);
    ctx.fillStyle = bank;
    ctx.fillRect(x, y, Math.min(3, W - x), 1);
    const wash = shorelineFoam(g.animT, wx);
    if (wash > 0.35 && x % 9 !== 0) {
      ctx.fillStyle = `rgba(${washTone},${((0.05 + 0.11 * wash) * (1 - 0.45 * night)).toFixed(3)})`;
      ctx.fillRect(x, y + 1, Math.min(2, W - x), 1);
    }
  }
}

// ============ draw ============
function draw(g: any, ctx: any, off: any, octx: any, reflection: any, rctx: any, meta: any) {
  g.zones = [];
  // Derived from current permanent and crafted upgrades: never persisted as
  // another source of truth. The game world and reflection share this tier.
  g.packTier = (meta.up.pack ? 1 : 0) + (g.crafts.pack ? 1 : 0);
  g.toolTier = choppingToolTier(g, meta);
  const inRun = g.ui === "run";
  // clear the pending upgrade confirmation once the shop is closed or left
  if (g.menu !== "shop") g.upConfirm = null;
  if (g.menu !== "bench") g.craftConfirm = null;
  if (g.menu !== "bench" && g.menu !== "build") g.buildConfirm = null;
  const nightLen = g.longNightActive ? LONG_NIGHT_LEN : NIGHT_LEN;
  const total = DAY_LEN + nightLen;
  const q = clamp(g.time / total, 0, 1);
  const camX = clamp(g.player.x - W / 2, 0, WORLD_W - W);
  g.camX = camX;
  const x0 = CX - 42;
  const colors = visualPalette(g);

  const shx = g.shake > 0 ? Math.round(Math.sin(g.animT * 90) * 1.6 * (g.shake / 0.15)) : 0;
  const shy = g.shake > 0 ? Math.round(Math.cos(g.animT * 77) * 1.2 * (g.shake / 0.15)) : 0;

  ctx.save();
  ctx.translate(shx, shy - SCENE_LIFT);

  // sky
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND);
  const naturalSky = skyColor(q);
  const sky = q > 0.05 && q < 0.55 ? lerpHex(naturalSky, colors.sky, 0.42) : naturalSky;
  grad.addColorStop(0, sky);
  grad.addColorStop(1, lightenHex(sky, 0.12));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND);
  // Warm dawn/dusk haze behind scenery, never over the player or HUD.
  drawSkyHaze(ctx, q);

  let darkA = 0;
  if (q > 0.52 && q < 0.6) darkA = (q - 0.52) / 0.08;
  else if (q >= 0.6 && q <= 0.92) darkA = 1;
  else if (q > 0.92) darkA = 1 - (q - 0.92) / 0.08;
  let maxDark = 0.78;
  if (g.weather === "fog") maxDark += 0.07;
  if (g.weather === "blizzard") maxDark += 0.12;
  darkA = clamp(darkA * maxDark, 0, 0.9);

  if (darkA > 0.25) {
    const sa = (darkA - 0.25) / 0.65;
    for (const s of g.stars) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(g.animT * 1.5 + s.tw));
      ctx.fillStyle = `rgba(230,238,250,${clamp(sa * tw * 0.9, 0, 1)})`;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }
    if (q > 0.6) {
      const mf = (q - 0.6) / 0.4;
      const mx = 280 - mf * 230, my = 58 - Math.sin(mf * Math.PI) * 26;
      px(ctx, mx - 3, my - 3, 6, 6, "#e8eef8");
      px(ctx, mx - 2, my - 4, 4, 8, "#e8eef8");
      px(ctx, mx - 1, my + 1, 2, 1, "#c8d2e2");
      px(ctx, mx + 1, my - 2, 1, 1, "#c8d2e2");
    }

  } else {
    const sf = q / 0.52;
    const sx = 16 + sf * 288, sy = 64 - Math.sin(clamp(sf, 0, 1) * Math.PI) * 38;
    px(ctx, sx - 3, sy - 3, 6, 6, "#ffd977");
    px(ctx, sx - 4, sy - 2, 8, 4, "#ffd977");
    px(ctx, sx - 2, sy - 4, 4, 8, "#ffd977");
  }

  // Distinct left meadow, central woodland and right mountain horizons.
  // Blend by world position to avoid a sudden change while walking.
  drawHillRange(ctx, camX, 0.16, colors.hillFar, 29, 70);
  drawHillRange(ctx, camX, 0.30, colors.hillNear, 18, 48);
  const mountainBlend = clamp((g.player.x - 990) / 240, 0, 1);
  if (mountainBlend > 0) {
    ctx.save();
    ctx.globalAlpha = mountainBlend;
    ctx.translate(-Math.round(camX * 0.2), 0);
    drawMountainRange(ctx, g.mts, colors.mountain, colors.snow);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = mountainBlend;
    ctx.translate(-Math.round(camX * 0.45), 0);
    drawMountainRange(ctx, g.mts2, colors.mountain2, colors.snow);
    ctx.restore();
  }

  const meadowBlend = 1 - clamp((g.player.x - 420) / 260, 0, 1);
  ctx.save();
  ctx.globalAlpha = 1 - meadowBlend * 0.5;
  drawForestLayer(ctx, camX, 0.24, GROUND + 11, colors.far, 24, 3, colors.name);
  drawForestLayer(ctx, camX, 0.48, GROUND + 10, colors.near, 22, 9, colors.name);
  ctx.restore();
  drawHorizonHaze(ctx, colors, weatherIntensity(g, "fog"));

  // The existing fog/rain weather affects distance, not the sharp foreground.
  const fogStrength = weatherIntensity(g, "fog") + weatherIntensity(g, "rain") * 0.35;
  if (fogStrength > 0.005) {
    const density = 0.16 * fogStrength;
    const drift = Math.round(Math.sin(g.animT * 0.23) * 11);
    ctx.fillStyle = "rgba(182,203,214," + density + ")";
    ctx.fillRect(drift - 12, GROUND - 37, W + 24, 16);
    ctx.fillStyle = "rgba(195,213,219," + (density * 0.6) + ")";
    ctx.fillRect(-drift - 12, GROUND - 25, W + 24, 11);
  }

  // Ground and scattered texture share a continuous palette, including camp.
  px(ctx, 0, GROUND, W, 4, colors.ridge);
  px(ctx, 0, GROUND + 4, W, H - GROUND - 4, colors.ground);
  for (let x = 0; x < W; x += 11) {
    const wx = x + Math.round(camX);
    const dy = 135 + (Math.abs(Math.sin(wx * 0.73)) * 19 | 0);
    px(ctx, x, dy, 2, 1, colors.speckle);
  }
  // Sparse seasonal grasses/reeds and snow flecks, away from central camp.
  drawGroundAccents(ctx, camX, g.animT, colors);

  // world space
  ctx.save();
  ctx.translate(-Math.round(camX), 0);
  for (const s of g.sparkles) {
    if (s.x < camX - 4 || s.x > camX + W + 4) continue;
    px(ctx, s.x, s.y, 1, 1, colors.name === "winter" ? s.c : colors.speckle);
  }
  for (const f of g.footprints) {
    ctx.fillStyle = "rgba(67,91,109," + (0.18 * clamp(f.life / 9, 0, 1)) + ")";
    ctx.fillRect(Math.round(f.x), Math.round(f.y), 3, 1);
  }

  const ents: { y: number; f: () => void }[] = [];
  ents.push({ y: 150, f: () => drawStructures(ctx, g) });
  for (const tr of g.trees) {
    if (tr.x < camX - 60 || tr.x > camX + W + 60) continue;
    ents.push({ y: tr.y, f: () => drawTree(ctx, tr, g.animT, g.windAmt || 0, colors) });
  }
  for (const ft of g.falling) {
    ents.push({ y: ft.y, f: () => drawFallingTree(ctx, ft, g.animT, colors) });
  }
  ents.push({ y: 151, f: () => drawFire(ctx, g) });
  ents.push({ y: 151.5, f: () => drawPickups(ctx, g) });
  for (const c of g.critters) {
    ents.push({ y: c.y, f: () => drawCritter(ctx, c, g) });
  }
  if (g.dog) ents.push({ y: g.dog.y, f: () => drawDog(ctx, g) });
  ents.push({ y: 152, f: () => drawPlayer(ctx, g) });
  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) e.f();

  // wood chips
  for (const c of g.chips) {
    ctx.fillStyle = `rgba(180,130,80,${clamp(c.life, 0, 1)})`;
    ctx.fillRect(Math.round(c.x), Math.round(c.y), 1, 2);
  }
  for (const du of g.dust) {
    ctx.fillStyle = "rgba(222,230,240," + clamp(du.life, 0, 1) * 0.7 + ")";
    ctx.fillRect(Math.round(du.x), Math.round(du.y), 2, 2);
  }

  // context prompts above interactables
  if (inRun && g.player.chopT <= 0 && !g.over && !g.menu) {
    const p = g.player;
    const bob = Math.sin(g.animT * 4) > 0 ? 0 : 1;
    const nearPit2 = Math.abs(p.x - CX) < 22;
    const nearBench2 = Math.abs(p.x - BENCH_X) < 22;
    const nearPile2 = Math.abs(p.x - PILE_X) < 22;
    const tr = nearestTree(g, p);
    if (nearBench2) {
      const lbl = g.builtBench ? "CRAFT" : g.benchBuildT >= 0 ? "BUILDING" : g.benchLogs >= SITE_COST ? "BUILD" : g.benchLogs + "/15 LOGS";
      drawTextO(ctx, lbl, BENCH_X - 7, 122 - bob, "#ffe9a0", "#060a18");
    }
    else if (nearPit2) {
      const lbl = !g.fireLit ? (g.firestarter > 0 ? "LIGHT" : "RELIGHT") : "STOKE";
      drawTextO(ctx, lbl, CX - 9, 118 - bob, "#ffe9a0", "#060a18");
    } else if (nearPile2) {
      const lbl = !g.builtPile ? (g.pileBuildT >= 0 ? "BUILDING" : g.pileLogs >= SITE_COST ? "BUILD" : g.pileLogs + "/15 LOGS") : p.wood > 0 ? "STORE" : g.stored > 0 ? "TAKE" : "PILE";
      drawTextO(ctx, lbl, PILE_X - 7, 120 - bob, "#ffe9a0", "#060a18");
    } else if (tr) drawTextO(ctx, "CHOP", tr.x - 7, tr.y - 40 - bob, "#ffe9a0", "#060a18");
  }
  ctx.restore();

  // A few light wind streaks show motion through the environment.
  const windStrength = weatherIntensity(g, "wind") + weatherIntensity(g, "blizzard") * 1.8;
  if (windStrength > 0.005) {
    ctx.fillStyle = "rgba(211,231,243," + (0.09 * windStrength) + ")";
    for (let i = 0; i < 9; i++) {
      const x = (i * 57 + Math.floor(g.animT * 58)) % W;
      const y = 44 + (i * 23) % 71;
      ctx.fillRect(x, y, 8 + i % 5, 1);
    }
  }
  // snow (screen space)
  for (const s of g.snow) {
    ctx.fillStyle = "rgba(238,244,250,0.85)";
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
  }
  const rainStrength = weatherIntensity(g, "rain");
  if (rainStrength > 0.005) {
    ctx.strokeStyle = "rgba(150,180,220," + (0.4 * rainStrength) + ")";
    ctx.beginPath();
    for (let i = 0; i < 24; i++) {
      const rx = (i * 37 + g.animT * 260) % W;
      const ry = (i * 53 + g.animT * 340) % H;
      ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 5);
    }
    ctx.stroke();
  }

  // darkness + light holes
  octx.clearRect(0, 0, W, H);
  octx.globalCompositeOperation = "source-over";
  octx.fillStyle = `rgba(8,10,30,${darkA})`;
  octx.fillRect(0, 0, W, H);
  octx.globalCompositeOperation = "destination-out";
  const punch = (x: number, y: number, r: number) => {
    const rg = octx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, "rgba(255,255,255,1)");
    rg.addColorStop(0.55, "rgba(255,255,255,0.75)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    octx.fillStyle = rg;
    octx.beginPath();
    octx.arc(x, y, r, 0, Math.PI * 2);
    octx.fill();
  };
  let lightR = g.fireLit ? 28 + (g.fuel / 100) * 66 : 0;
  lightR *= 1 - weatherIntensity(g, "fog") * 0.35;
  lightR *= 1 - weatherIntensity(g, "blizzard") * 0.25;
  if (lightR > 0) punch(CX - camX, 146, lightR);
  if (g.player.torchT > 0) punch(g.player.x - camX, g.player.y - 12, 38);
  if (g.stage >= 6) {
    punch(x0 + 28 - camX, 131, 15);
    punch(x0 + 66 - camX, 131, 15);
  }
  ctx.drawImage(off, 0, 0);
  // Spectacles appear ABOVE the night mask (previously darkened away).
  drawNightSkyEvent(ctx, g, darkA);

  if (g.fireLit && lightR > 0) {
    ctx.globalCompositeOperation = "lighter";
// slow firelight flicker on the surrounding ground (no second light source)
    const flicker = 0.92 + Math.sin(g.animT * 9) * 0.06;
    const rg = ctx.createRadialGradient(CX - camX, 146, 0, CX - camX, 146, Math.max(10, lightR * flicker));
    rg.addColorStop(0, "rgba(255,172,92,0.23)");
    rg.addColorStop(0.42, "rgba(244,136,66,0.09)");
    rg.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();

  // Reflect animated world objects (not the solid ground or HUD).
  drawReflectiveRiver(ctx, g, reflection, rctx, darkA, camX);

  // minimap - a wide strip reaching from beside the warmth bar to the right edge
  if (inRun) {
    const mx0 = 82, mw = W - 4 - mx0, my0 = 4, mh = 14;
    ctx.fillStyle = "rgba(8,10,28,0.5)";
    ctx.fillRect(mx0, my0, mw, mh);
    const mm = (wx: number) => mx0 + (wx / WORLD_W) * mw;
    // snow ground line
    ctx.fillStyle = colors.ridge;
    ctx.fillRect(mx0 + 1, my0 + 11, mw - 2, 1);
    for (const tr of g.trees) {
      const tx = Math.round(mm(tr.x));
      ctx.fillStyle = colors.treeLight;
      ctx.fillRect(tx, my0 + 4, 2, 5);
      ctx.fillStyle = "#5a4232";
      ctx.fillRect(tx, my0 + 9, 1, 2);
    }
    if (g.builtBench) {
      ctx.fillStyle = "#a06a3a";
      ctx.fillRect(Math.round(mm(BENCH_X)), my0 + 9, 2, 2);
    }
    if (g.builtPile) {
      ctx.fillStyle = "#8a5a34";
      ctx.fillRect(Math.round(mm(PILE_X)), my0 + 9, 2, 2);
    }
    const fx = Math.round(mm(CX));
    ctx.fillStyle = "#ffb52e";
    ctx.fillRect(fx - 1, my0 + 7, 3, 4);
    ctx.fillStyle = g.fireLit ? (Math.sin(g.animT * 9) > 0 ? "#ffe9a0" : "#ff8c1a") : "#6a4a26";
    ctx.fillRect(fx, my0 + 5, 1, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(mm(g.player.x)), my0 + 6, 2, 5);
  }

  // screen chrome
  if (!inRun) drawScreen(ctx, g, meta);
  if (inRun && !g.over) {
    drawHUD(ctx, g, meta);
    if (!g.menu) { drawMovementFeedback(ctx, g); drawRunChrome(ctx, g); drawSideArrows(ctx, g); }
  }
  if (g.menu) drawMenu(ctx, g, meta);
  if (inRun) drawToasts(ctx, g);
}

// ============ App ============

export { loadMeta, saveMeta, createEngine, setupTitleScene, loadRunSnapshot, clearRunSnapshot, toast, saveRunSnapshot, update, updateAmbient, draw, handleKey, handlePointer, AUDIO, titleActions, drawScreen, renderReflectionSubjects, spawnEvent, drawMovementFeedback, benchRows, buildRows, moveSel, closeMenu, drawSideArrows };
export { W, H } from "./config";
