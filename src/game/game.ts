import { W, H, GROUND, PLAYER_Y, SCENE_LIFT, WATER_Y, WORLD_W, CX, DAY_LEN, NIGHT_LEN, LONG_NIGHT_LEN, META_KEY, LEGACY_KEYS, SHED_X, BENCH_X, PILE_X, SITE_COST, BUILD_TIME, STAGES, CRAFTS, UPGRADES, WEATHER_TEXT } from "./config";
import { clamp } from "./math";
import { carryCap, pileCap } from "./rules";

// ============ visual-only seasons ============
// Season and backdrop change the art, not warmth, weather odds, rewards or build costs.
// A day is complete after its night ends; don't change seasons halfway through a night.
const SEASON_ROTATION = ["autumn", "autumn", "winter", "winter", "winter", "spring", "spring", "summer", "summer"];
const SEASON_COLORS: Record<string, any> = {
  autumn: {
    ground:"#776a4d", ridge:"#a18c65", shore:"#625e4d", water:"#376477",
    treeLight:"#b3753b", treeDark:"#754b32", cap:"#d0a16b", trunk:"#63482f",
    far:"#727e72", near:"#53655e", hillFar:"#778b88", hillNear:"#66766e",
    mountain:"#566777", mountain2:"#495f65", snow:"#9fa8a7", sky:"#c0a57c", speckle:"#a99264",
  },
  winter: {
    ground:"#dbe4ee", ridge:"#c8d4e2", shore:"#849eaa", water:"#376b83",
    treeLight:"#3c7a44", treeDark:"#245a36", cap:"#e6eef6", trunk:"#6b4a32",
    far:"#577a82", near:"#345b65", hillFar:"#788fa1", hillNear:"#586c85",
    mountain:"#42506e", mountain2:"#313d5c", snow:"#b9c7dd", sky:"#a8c4dc", speckle:"#c4d2e2",
  },
  spring: {
    ground:"#64836a", ridge:"#91aa7d", shore:"#536f68", water:"#397b83",
    treeLight:"#62ac66", treeDark:"#2b7549", cap:"#a4c883", trunk:"#6b5038",
    far:"#719c83", near:"#4b7868", hillFar:"#7b9a99", hillNear:"#608c77",
    mountain:"#637b86", mountain2:"#486778", snow:"#abbec4", sky:"#9bbfbd", speckle:"#a8bf79",
  },
  summer: {
    ground:"#728851", ridge:"#a1aa68", shore:"#647358", water:"#356f83",
    treeLight:"#4b994f", treeDark:"#26623c", cap:"#81b45c", trunk:"#6a4d2f",
    far:"#6f9482", near:"#486f5d", hillFar:"#849d91", hillNear:"#678b75",
    mountain:"#5d7285", mountain2:"#495f75", snow:"#c9cecb", sky:"#a5c6d1", speckle:"#b4ad6e",
  },
};
function completedNights(g: any): number {
  return Math.max(0, g.night - (g.isNight ? 1 : 0));
}
function visualSeason(g: any): string {
  if (g.longNightActive) return "winter";
  return SEASON_ROTATION[completedNights(g) % SEASON_ROTATION.length];
}
function visualPalette(g: any): any {
  const season = visualSeason(g);
  const current = SEASON_COLORS[season];
  const index = completedNights(g);
  const previous = SEASON_ROTATION[(index - 1 + SEASON_ROTATION.length) % SEASON_ROTATION.length];
  if (index === 0 || previous === season || g.longNightActive) return { ...current, name: season };
  // Fade the environment into its new season over the opening seconds of daylight.
  const blend = clamp(g.time / 14, 0, 1);
  const old = SEASON_COLORS[previous];
  const out: any = { name: season };
  for (const k of Object.keys(current)) out[k] = lerpHex(old[k], current[k], blend);
  return out;
}

// ============ 3x5 pixel font ============
const FONT: Record<string, string> = {
  A: "111101111101101", B: "111101111101111", C: "111100100100111",
  D: "110101101101110", E: "111100110100111", F: "111100110100100",
  G: "111100101101111", H: "101101111101101", I: "111010010010111",
  J: "011001001101110", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "111101101101111",
  P: "111101111100100", Q: "111101101111001", R: "111101110101101",
  S: "111100111001111", T: "111010010010010", U: "101101101101111",
  V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111",
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111",
  "3": "111001111001111", "4": "101101111001001", "5": "111100111001111",
  "6": "111100111101111", "7": "111001001010010", "8": "111101111101111",
  "9": "111101111001111",
  " ": "000000000000000", "/": "001001010100100", "-": "000000111000000",
  "(": "001010010010001", ")": "100010010010100", "+": "000010111010000",
  ":": "000010000010000", "!": "010010010000010", ".": "000000000000010",
  ",": "000000000010100", "'": "010010100000000", "?": "111001010000010",
};

function drawText(ctx: any, str: string, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  const s = String(str).toUpperCase();
  let cx = Math.round(x);
  const yy = Math.round(y);
  for (const ch of s) {
    const gl = FONT[ch];
    if (gl) {
      for (let i = 0; i < 15; i++) {
        if (gl[i] === "1") ctx.fillRect(cx + (i % 3), yy + Math.floor(i / 3), 1, 1);
      }
    }
    cx += 4;
  }
}
const textW = (str: string) => String(str).length * 4 - 1;

function drawTextC(ctx: any, str: string, cx: number, y: number, color: string) {
  drawText(ctx, str, Math.round(cx - textW(String(str)) / 2), y, color);
}

// text with a black outline for readability over any background
function drawTextO(ctx: any, str: string, x: number, y: number, color: string, oc: string) {
  drawText(ctx, str, x - 1, y, oc);
  drawText(ctx, str, x + 1, y, oc);
  drawText(ctx, str, x, y - 1, oc);
  drawText(ctx, str, x, y + 1, oc);
  drawText(ctx, str, x, y, color);
}

function drawTextWrap(ctx: any, str: string, x: number, y: number, maxW: number, color: string, lineH: number) {
  const words = String(str).toUpperCase().split(" ");
  let line = "";
  let yy = y;
  const flush = () => {
    if (line) drawText(ctx, line, x, yy, color);
    yy += lineH;
    line = "";
  };
  for (const wd of words) {
    const t = line ? line + " " + wd : wd;
    if (textW(t) > maxW && line) { flush(); line = wd; }
    else line = t;
  }
  flush();
  return yy;
}

function drawBig(ctx: any, str: string, cx: number, y: number, scale: number, color: string) {
  const w = textW(str) * scale;
  ctx.save();
  ctx.translate(Math.round(cx - w / 2), Math.round(y));
  ctx.scale(scale, scale);
  drawText(ctx, str, 0, 0, color);
  ctx.restore();
}

// ============ helpers ============


function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
function lerpHex(a: string, b: string, f: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `#${toHex(A[0] + (B[0] - A[0]) * f)}${toHex(A[1] + (B[1] - A[1]) * f)}${toHex(A[2] + (B[2] - A[2]) * f)}`;
}
function lightenHex(h: string, f: number): string {
  const A = hexToRgb(h);
  const mix = (c: number) => Math.round(c + (255 - c) * f);
  return `rgb(${mix(A[0])},${mix(A[1])},${mix(A[2])})`;
}

const px = (ctx: any, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

function saveMeta(m: any) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) { } }
function safeCount(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}
function loadMeta(): any {
  try {
    let s: any = localStorage.getItem(META_KEY);
    if (!s) for (const lk of LEGACY_KEYS) { s = localStorage.getItem(lk); if (s) break; }
    if (s) {
      const m = JSON.parse(s);
      if (m && typeof m === "object" && !Array.isArray(m)) {
        const up: any = {};
        for (const u of UPGRADES) up[u.id] = Math.min(u.max, safeCount(m.up && m.up[u.id]));
        return { ash: safeCount(m.ash), totalAsh: safeCount(m.totalAsh),
          best: safeCount(m.best), runs: safeCount(m.runs),
          wonEver: !!m.wonEver, up };
      }
    }
  } catch (e) { /* Corrupted local saves should never prevent the game starting. */ }
  return { ash: 0, totalAsh: 0, best: 0, runs: 0, wonEver: false, up: {} };
}


// ============ Safe local run checkpoint ============
// Permanent ash and upgrades remain in their existing key. This checkpoint
// only stores a pending, unfinished run; it never banks earned ash.
const RUN_KEY = "sekampfire-run-v1";
const RUN_SAVE_VERSION = 1;
const WEATHER_IDS = ["clear", "wind", "fog", "rain", "coldsnap", "blizzard"];
const finiteRange = (v: any, lo: number, hi: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;
function clearRunSnapshot() {
  try { localStorage.removeItem(RUN_KEY); } catch (_e) {}
}
function captureRunSnapshot(g: any): any {
  if (g.ui !== "run" || g.over) return null;
  const keys = ["time","night","isNight","weather","aurora","fuel","fireLit","everLit",
    "firestarter","stage","longNightPending","longNightActive","endlessMode","endlessN",
    "ashEarned","depth","builtBench","builtPile","benchLogs","pileLogs",
    "benchBuildT","pileBuildT","stored","treeId","scenerySeed"];
  const state: any = {};
  for (const key of keys) state[key] = g[key];
  state.player = { x: g.player.x, dir: g.player.dir, wood: g.player.wood,
    warmth: g.player.warmth, torchT: g.player.torchT };
  state.trees = g.trees.map((t: any) => ({
    x:t.x,y:t.y,id:t.id,tier:t.tier,variant:t.variant,hp:t.hp
  }));
  state.pickups = g.pickups.map((p: any) => ({x:p.x,y:p.y,w:p.w}));
  state.falling = g.falling.map((t: any) => ({
    x:t.x,y:t.y,id:t.id,tier:t.tier,variant:t.variant,wood:t.wood,
    t:t.t,dir:t.dir
  }));
  state.crafts = { ...g.crafts };
  return { version: RUN_SAVE_VERSION, state };
}
function saveRunSnapshot(g: any) {
  const snap = captureRunSnapshot(g);
  if (!snap) return;
  try { localStorage.setItem(RUN_KEY, JSON.stringify(snap)); } catch (_e) {}
}
function loadRunSnapshot(): any {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw || raw.length > 240000) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== RUN_SAVE_VERSION || !data.state) return null;
    const v = data.state;
    if (!v.player || !Array.isArray(v.trees) || !Array.isArray(v.pickups)) return null;
    if (v.trees.length > 150 || v.pickups.length > 200) return null;
    if (v.falling !== undefined && (!Array.isArray(v.falling) || v.falling.length > 150)) return null;
    if (!Number.isFinite(v.player.x) || !Number.isFinite(v.time)) return null;
    return v;
  } catch (_e) { return null; }
}
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
  g.depth = n("depth", 0, 10000, 0);
  g.builtBench = flag("builtBench");
  g.builtPile = flag("builtPile");
  g.benchLogs = n("benchLogs", 0, SITE_COST, 0);
  g.pileLogs = n("pileLogs", 0, SITE_COST, 0);
  g.benchBuildT = n("benchBuildT", -1, BUILD_TIME, -1);
  g.pileBuildT = n("pileBuildT", -1, BUILD_TIME, -1);
  g.stored = n("stored", 0, 40, 0);
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

// ============ optional procedural audio ============
// Browser audio unlocks only after a user gesture. No assets, no autoplay,
// and no impact on simulation. Mute is saved locally.
const FX_KEY = "sekampfire-fx-v1";
const GRAPHICS = {
  high: (() => { try { return localStorage.getItem(FX_KEY) !== "low"; } catch (_e) { return true; } })(),
  toggle() {
    this.high = !this.high;
    try { localStorage.setItem(FX_KEY, this.high ? "high" : "low"); } catch (_e) {}
  }
};
const SOUND_KEY = "sekampfire-sound-v1";
const AUDIO_LEVEL_KEY = "sekampfire-audio-v2";
const AUDIO = (() => {
  let enabled = true;
  let masterLevel = 90, ambienceLevel = 90, effectsLevel = 90;
  try {
    enabled = localStorage.getItem(SOUND_KEY) !== "off";
    const settings = JSON.parse(localStorage.getItem(AUDIO_LEVEL_KEY) || "{}");
    const safe = (v: any, fallback: number) =>
      typeof v === "number" && Number.isFinite(v) ? clamp(Math.round(v / 10) * 10, 0, 100) : fallback;
    masterLevel = safe(settings.master, 90);
    ambienceLevel = safe(settings.ambience, 90);
    effectsLevel = safe(settings.effects, 90);
  } catch (_e) { /* Use safe default settings. */ }
  let ac: any = null, master: any = null, wind: any = null, noiseBuffer: any = null;
  function saveLevels() {
    try {
      localStorage.setItem(AUDIO_LEVEL_KEY, JSON.stringify({
        master: masterLevel, ambience: ambienceLevel, effects: effectsLevel
      }));
    } catch (_e) {}
  }
  function outputGain() { return enabled ? 0.96 * masterLevel / 100 : 0; }
  function touch() {
    if (!enabled) return;
    try {
      if (!ac) {
        const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        ac = new Ctor();
        master = ac.createGain();
        master.gain.value = outputGain();
        master.connect(ac.destination);
        const buf = ac.createBuffer(1, Math.round(ac.sampleRate * 2), ac.sampleRate);
        noiseBuffer = buf;
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const source = ac.createBufferSource();
        source.buffer = buf;
        source.loop = true;
        wind = ac.createGain();
        wind.gain.value = 0;
        const windFilter = ac.createBiquadFilter();
        windFilter.type = "lowpass";
        windFilter.frequency.value = 420;
        source.connect(windFilter);
        windFilter.connect(wind);
        wind.connect(master);
        // No synthesized campfire hiss. The old broadband static was harsh;
        // retain quiet wind and short action cues until we have a real fire loop.
        source.start();
      }
      if (ac.state === "suspended") ac.resume().catch(() => {});
    } catch (_e) { /* Gameplay works even if Web Audio is unavailable. */ }
  }
  function setEnabled(value: boolean) {
    enabled = value;
    try { localStorage.setItem(SOUND_KEY, enabled ? "on" : "off"); } catch (_e) {}
    if (enabled) touch();
    if (ac && master) master.gain.setTargetAtTime(outputGain(), ac.currentTime, 0.035);
  }
  function getLevel(kind: string): number {
    return kind === "master" ? masterLevel : kind === "ambience" ? ambienceLevel : effectsLevel;
  }
  function adjust(kind: string, direction: number) {
    const next = clamp(getLevel(kind) + (direction < 0 ? -10 : 10), 0, 100);
    if (kind === "master") masterLevel = next;
    else if (kind === "ambience") ambienceLevel = next;
    else if (kind === "effects") effectsLevel = next;
    saveLevels();
    if (ac && master) master.gain.setTargetAtTime(outputGain(), ac.currentTime, 0.035);
  }
  function sync(g: any) {
    if (!ac || !wind) return;
    const active = enabled && g.ui === "run" && !g.over && !g.menu;
    const gusts = 0.014 + weatherIntensity(g, "blizzard") * 0.075 +
      weatherIntensity(g, "wind") * 0.04;
    const ambience = ambienceLevel / 100;
    wind.gain.setTargetAtTime(active ? gusts * ambience : 0, ac.currentTime, 0.48);
  }
  function effect(kind: string, ambient = false) {
    if (!enabled || !ac || !master || ac.state !== "running") return;
    const mix = (ambient ? ambienceLevel : effectsLevel) / 100;
    if (mix <= 0 || masterLevel <= 0) return;
    try {
      const now = ac.currentTime;
      const step = kind === "step";
      const light = kind === "light", build = kind === "build";
      const duration = step ? 0.09 : light ? 0.20 : 0.12;
      const gain = ac.createGain();
      const volume = (step ? 0.14 : build ? 0.26 : 0.22) * mix;
      // Gentle attack/release keeps filtered action cues from popping
      // abruptly. No new continuous noise or synthetic fire sound.
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      gain.connect(master);
      if (!light && noiseBuffer) {
        const source = ac.createBufferSource();
        source.buffer = noiseBuffer;
        const filter = ac.createBiquadFilter();
        filter.type = step ? "lowpass" : "bandpass";
        filter.frequency.value = step ? 315 : build ? 550 : 710;
        source.connect(filter);
        filter.connect(gain);
        source.start(now, Math.random() * 1.5, duration);
        source.stop(now + duration + 0.015);
      } else {
        const osc = ac.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + duration);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + duration + 0.015);
      }
    } catch (_e) {}
  }
  return {
    touch, sync, effect, setEnabled, getLevel, adjust,
    get enabled() { return enabled; }
  };
})();

// Visual weather crossfades are independent from gameplay/weather balance.
function weatherIntensity(g: any, type: string): number {
  const t = clamp(g.weatherBlend, 0, 1);
  return (g.previousWeather === type ? 1 - t : 0) + (g.weather === type ? t : 0);
}

// ============ sprites ============
function drawFlame(ctx: any, x: number, y: number, t: number, strength: number) {
  const h = Math.max(3, 5 + strength * 11);
  const layer = (hh: number, col: string, wob: number) => {
    for (let i = 0; i < hh; i++) {
      const ph = t * 9 + i * 1.3 + wob;
      const wd = Math.max(1, Math.round(hh - i * 0.9 + Math.sin(ph) * 1.4));
      px(ctx, x - wd / 2, y - i - 2, wd, 1, col);
    }
  };
  layer(Math.round(h), "#ff6a00", 0);
  layer(Math.round(h * 0.72), "#ffb52e", 2);
  layer(Math.round(h * 0.42), "#ffe9a0", 4);
}

// cozy pines in three variants: layered pine, tall spire fir, bushy spruce
function drawTree(ctx: any, tr: any, t: number, windAmt: number, colors: any) {
  const x = Math.round(tr.x), y = Math.round(tr.y);
  // Art only: anchor taller/larger trees at their original stump position.
  // Tier 0 is now a proper young tree instead of a bush beside the player.
  const heightScale = tr.tier === 0 ? 2.4 : tr.tier === 1 ? 1.85 : 1.7;
  const widthScale = tr.tier === 0 ? 1.48 : tr.tier === 1 ? 1.42 : 1.34;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(widthScale, heightScale);
  ctx.translate(-x, -y);
  const hit = tr.hitT > 0 ? Math.sin(t * 45) * 2 * tr.hitT : 0;
  const sway = Math.sin(t * (1.35 + (tr.id % 6) * 0.12) + tr.id) * (1 + windAmt * 3) + hit;
  const s = tr.tier, v = ((tr.variant || 0) % 3);
  const th = 5 + s * 4, tw = 2 + s;
  const tc = colors.trunk;
  px(ctx, x - Math.floor(tw / 2), y - th, tw, th, tc);
  px(ctx, x - Math.floor(tw / 2) + 1, y - th + 2, 1, th - 3, tr.tier === 2 ? "#5a4232" : "#7a5636");
  const cw = 6 + s * 4, chh = 6 + s * 5;
  const cA = v === 2 ? lightenHex(colors.treeLight, 0.14) : colors.treeLight;
  const cB = v === 1 ? colors.treeDark : lerpHex(colors.treeDark, colors.treeLight, 0.18);
  const snowC = colors.cap;
  const showCap = colors.name === "winter";
  if (v === 0) {
    // layered pine: three stacked triangle tiers with snow on each
    const tH = Math.max(2, Math.round(chh / 3) + 1);
    for (let k = 0; k < 3; k++) {
      const twid = Math.max(3, Math.round(cw * (0.5 + k * 0.25)));
      const yb = y - th - 1 - k * (tH - 1);
      for (let i = 0; i < tH; i++) {
        const w2 = Math.max(2, Math.round(twid * (1 - i / tH)));
        px(ctx, x - w2 / 2 + sway * 0.6, yb - i, w2, 1, (i + k) % 3 === 0 ? cA : cB);
      }
      if (showCap || k % 2 === 0) px(ctx, x - Math.max(1, Math.floor(twid * 0.25)), yb - tH + 2, Math.max(2, Math.floor(twid * 0.5)), 1, snowC);
    }
  } else if (v === 1) {
    // tall spire fir: narrow, pointed, little snow cap
    const H2 = chh + 3 + s * 2;
    for (let i = 0; i < H2; i++) {
      const w2 = Math.max(2, Math.round((cw - 2) * (1 - (i / H2) * 0.9)));
      px(ctx, x - w2 / 2 + sway * 0.5, y - th - 1 - i, w2, 1, i % 4 === 0 ? cA : cB);
    }
    px(ctx, x - 1, y - th - H2, 2, 1, snowC);
    px(ctx, x, y - th - H2 - 1, 1, 1, snowC);
  } else {
    // bushy spruce: wide drooping boughs with snow patches
    for (let i = 0; i < chh; i++) {
      const w2 = Math.max(3, Math.round((cw + 3) * Math.sqrt(Math.max(0, 1 - i / chh))));
      px(ctx, x - w2 / 2 + sway * 0.7, y - th - 1 - i, w2, 1, i % 2 === 0 ? cA : cB);
      if (i > chh * 0.45 && w2 > 3 && i % 3 === 0) {
        px(ctx, x - w2 / 2 + sway * 0.7 + 1, y - th - 1 - i, Math.min(3, w2 - 1), 1, snowC);
      }
    }
    px(ctx, x - 1, y - th - chh, 3, 1, snowC);
  }
  ctx.restore();
}

function drawFallingTree(ctx: any, ft: any, t: number, colors: any) {
  const prog = clamp(ft.t / 0.55, 0, 1);
  const ang = (ft.dir || 1) * 1.55 * prog * prog;
  ctx.save();
  ctx.translate(Math.round(ft.x), Math.round(ft.y));
  ctx.rotate(ang);
  ctx.translate(-Math.round(ft.x), -Math.round(ft.y));
  drawTree(ctx, ft, t, 0, colors);
  ctx.restore();
}

function drawBackpack(ctx: any, x: number, y: number, dir: number,
                      amount: number, upgrades: number) {
  // The permanent +8 and crafted +8 backpacks each enlarge the actual bag.
  // Every piece of carried wood remains individually visible, even at 21 logs.
  const tier = clamp(Math.floor(Number.isFinite(upgrades) ? upgrades : 0), 0, 2);
  const count = clamp(Math.floor(Number.isFinite(amount) ? amount : 0), 0, 30);
  const w = [10, 14, 17][tier];
  const h = [12, 17, 21][tier];
  const middleX = Math.round(x - dir * (8 + tier * 2));
  const bx = middleX - Math.floor(w / 2);
  const by = Math.round(y - 8 - h);
  const fabric = ["#685637", "#786443", "#756746"][tier];
  const trim = ["#a38a57", "#b69c65", "#c3a775"][tier];
  px(ctx, bx, by, w, h, "#2c2622");
  px(ctx, bx + 1, by + 1, w - 2, h - 2, fabric);
  px(ctx, bx + 1, by + 1, w - 2, 2, trim);
  px(ctx, bx, by + h - 3, w, 2, "#4d3b2a");
  // Bag size and external pockets make each upgrade visible even when empty.
  if (tier >= 1) {
    px(ctx, bx + 1, by + h - 8, 3, 4, "#4c4835");
    px(ctx, bx + w - 4, by + h - 8, 3, 4, "#4c4835");
    px(ctx, bx + 1, by + h - 8, 3, 1, trim);
  }
  if (tier >= 2) {
    px(ctx, bx + 3, by - 2, w - 6, 2, "#8c7c53");
    px(ctx, bx + Math.floor(w / 2) - 1, by + 1, 2, 3, "#d0b27b");
  }
  // Column width contracts from 4px to 3px, while each 2px log has its own
  // light-colored cut end and dark top edge for visual separation.
  const columns = count <= 5 ? 2 : 3;
  const logWidth = count <= 5 ? 4 : 3;
  const rows = Math.ceil(count / columns);
  const span = columns * logWidth;
  const startX = middleX - Math.floor(span / 2);
  const startY = Math.round(y - 9 - rows * 2);
  for (let i = 0; i < count; i++) {
    const col = i % columns, row = Math.floor(i / columns);
    const pxX = startX + col * logWidth, pxY = startY + row * 2;
    px(ctx, pxX, pxY, logWidth, 2, "#4e301d");
    px(ctx, pxX, pxY, logWidth - 1, 1, "#b77f47");
    px(ctx, pxX, pxY + 1, 1, 1, "#e1b97d");
    px(ctx, pxX + logWidth - 1, pxY + 1, 1, 1, "#c49152");
  }
  // Visible strap BELOW the logs to keep all carried units countable.
  px(ctx, bx, by + h - 2, w, 1, trim);
}

function drawPlayer(ctx: any, g: any) {
  // Compact but recognisable silhouette: hooded coat, face, scarf, pack,
  // individually animated legs and arms, deliberate axe arc and idle blink.
  // All animation is decorative; world coordinates/hitboxes stay unchanged.
  const p = g.player;
  const x = Math.round(p.x), y = Math.round(p.y);
  const dir = p.dir === -1 ? -1 : 1;
  const walking = !!p.moving && p.chopT <= 0;
  const phase = g.animT * 9.5;
  const stride = walking ? Math.sin(phase) : 0;
  const otherStride = walking ? Math.sin(phase + Math.PI) : 0;
  const bob = walking ? -Math.max(0, Math.sin(phase * 2)) * 1.1 :
    Math.sin(g.animT * 1.7) * 0.35;
  const chopping = p.chopT > 0 && !!p.chopTree;
  const chopProgress = chopping ? clamp(1 - p.chopT / Math.max(p.chopTime, 0.001), 0, 1) : 0;
  const lean = chopping ? (chopProgress > 0.58 && chopProgress < 0.83 ? dir : -dir * 0.4) : 0;
  const bx = Math.round(x + lean), by = Math.round(y + bob);
  const dark = "#241d23", outline = "#2b2430";
  const coat = "#885334", coatShade = "#5a3829", coatLight = "#b27649";
  const hasCraftedBoots = !!(g.crafts && g.crafts.boots);
  const trouser = "#414350";
  const footwear = hasCraftedBoots ? "#624b35" : "#545056";
  const footwearSole = hasCraftedBoots ? "#251f1d" : "#403c40";
  const skin = "#dfac84";
  // feet and grounded shadow (same foot position as the original character)
  ctx.fillStyle = "rgba(20,20,40,0.28)";
  ctx.fillRect(x - 6, y - 1, 12, 2);
  for (const [dx, movement] of [[-3, stride], [2, otherStride]]) {
    const legLift = walking ? Math.max(0, movement) * 1.6 : 0;
    const legShift = walking ? Math.round(movement * 2.2) : 0;
    px(ctx, x + dx + legShift, y - 7 - legLift, 3, 5, trouser);
    px(ctx, x + dx + legShift - 1, y - (hasCraftedBoots ? 5 : 3) - legLift,
      4, hasCraftedBoots ? 5 : 3, footwear);
    if (hasCraftedBoots) px(ctx, x + dx + legShift - 1, y - 5 - legLift, 4, 1, "#c39c58");
    px(ctx, x + dx + legShift - 1, y - 1 - legLift, 4, 1, footwearSole);
  }
  // Backpack and its real cargo are drawn behind the shoulders.
  drawBackpack(ctx, bx, by, dir, p.wood, g.packTier);
  px(ctx, bx - 5, by - 16, 10, 10, outline);
  px(ctx, bx - 4, by - 15, 8, 9, coat);
  px(ctx, bx - 4, by - 8, 8, 2, coatShade);
  px(ctx, bx + (dir > 0 ? -3 : 2), by - 14, 2, 6, coatLight);
  px(ctx, bx - 2, by - 7, 4, 1, "#c29b65");
  // arms with opposing stride; lead arm grips the axe on chop
  const armSwing = walking ? Math.round(stride * 2) : 0;
  px(ctx, bx - 6, by - 14 + armSwing, 2, 7, outline);
  px(ctx, bx - 5, by - 13 + armSwing, 2, 5, coatLight);
  px(ctx, bx + 4, by - 14 - armSwing, 2, 7, outline);
  px(ctx, bx + 4, by - 13 - armSwing, 1, 5, coatShade);
  px(ctx, bx + dir * 5 - 1, by - 8 - armSwing, 2, 2, skin);
  // No hat equipment currently exists; leave the starting head uncovered.
  // A short, shaded hairstyle keeps the face readable in 320x180 pixel art.
  px(ctx, bx - 4, by - 23, 8, 8, outline);
  px(ctx, bx - 3, by - 22, 6, 7, skin);
  px(ctx, bx - 3, by - 22, 2, 5, "#bb7b60");
  px(ctx, bx - 4, by - 24, 8, 4, "#302722");
  px(ctx, bx - 3, by - 25, 5, 2, "#47352a");
  px(ctx, bx - 4, by - 21, 2, 3, "#302722");
  px(ctx, bx + 1, by - 22, 2, 1, "#514037");
  const blink = Math.sin(g.animT * 1.23) > 0.994;
  px(ctx, bx + dir * 2 - 1, by - 19, 1, 1, blink ? "#aa7c64" : dark);
  px(ctx, bx + dir * 3 - 1, by - 17, 2, 1, "#ba8063");
  px(ctx, bx - 4, by - 16, 8, 2, "#bc3d30");
  px(ctx, bx - 3, by - 15, 6, 1, "#f1784d");
  const scarfFlutter = Math.sin(g.animT * (walking ? 9 : 3)) * (walking ? 2 : 1);
  px(ctx, bx - dir * (6 + Math.round(scarfFlutter)), by - 15, 4, 2, "#bc3d30");
  if (chopping) {
    const arc = chopProgress < 0.45
      ? -0.2 - (chopProgress / 0.45) * 1.25
      : chopProgress < 0.74
        ? -1.45 + ((chopProgress - 0.45) / 0.29) * 2.55
        : 1.1 - ((chopProgress - 0.74) / 0.26) * 1.2;
    ctx.save();
    ctx.translate(bx + dir * 6, by - 12);
    ctx.rotate(-dir * arc);
    px(ctx, -1, -2, 2, 10, "#745338");
    px(ctx, -3, -5, 6, 3, "#abbac4");
    px(ctx, -2, -5, 3, 1, "#e1eaf0");
    px(ctx, dir > 0 ? -3 : 1, -3, 2, 2, "#65747d");
    ctx.restore();
  }
  if (p.torchT > 0) {
    px(ctx, bx + dir * 7, by - 21, 2, 9, "#6b4a32");
    drawFlame(ctx, bx + dir * 7, by - 21, g.animT, 0.25);
  }
  if (visualSeason(g) === "winter" || g.weather === "coldsnap") {
    const breath = (g.animT * 1.5) % 1;
    ctx.fillStyle = "rgba(226,239,243," + (0.28 * (1 - breath)).toFixed(3) + ")";
    ctx.fillRect(bx + dir * (5 + breath * 6), by - 18 - breath * 5, 2, 1);
  }
}

function drawDog(ctx: any, g: any) {
  const d = g.dog;
  if (!d) return;
  const x = Math.round(d.x), y = Math.round(d.y);
  const dir = d.dir || 1;
  const bob = d.phase !== "idle" ? Math.floor(g.animT * 8) % 2 : 0;
  const idleBreath = d.phase === "idle" && Math.sin(g.animT * 2.2) > 0.6 ? -1 : 0;
  ctx.fillStyle = "rgba(20,20,40,0.3)";
  ctx.fillRect(x - 4, y - 1, 8, 1);
  px(ctx, x - 4, y - 4 + idleBreath, 8, 3, "#d8dee4");
  px(ctx, x - 4, y - 1 - bob, 1, 2, "#b8bec6");
  px(ctx, x + 3, y - 2 + bob, 1, 2, "#b8bec6");
  px(ctx, dir > 0 ? x + 3 : x - 6, y - 6, 3, 3, "#d8dee4");
  px(ctx, dir > 0 ? x + 5 : x - 6, y - 7, 1, 2, "#c2c8ce");
  px(ctx, dir > 0 ? x + 6 : x - 6, y - 5, 1, 1, "#2a2a2e");
  const wag = Math.sin(g.animT * (d.phase === "idle" ? 5 : 12)) > 0 ? -1 : 0;
  px(ctx, dir > 0 ? x - 5 : x + 4, y - 5 + wag, 1, 2, "#c2c8ce");
}

function drawFire(ctx: any, g: any) {
  if (g.stage >= 1) {
    const stones = [[CX - 12, 149], [CX + 10, 149], [CX - 9, 152], [CX + 7, 152], [CX - 2, 153], [CX + 2, 153]];
    for (const s of stones) px(ctx, s[0], s[1], 3, 2, "#9aa2ac");
  }
  if (g.stage >= 6) {
    px(ctx, CX - 12, 144, 24, 2, "#7a828c");
    px(ctx, CX - 12, 144, 2, 8, "#7a828c");
    px(ctx, CX + 10, 144, 2, 8, "#7a828c");
  }
  px(ctx, CX - 6, 147, 7, 2, "#5a3a22");
  px(ctx, CX - 1, 148, 7, 2, "#4a2f1a");
  if (g.fireLit) {
    drawFlame(ctx, CX, 148, g.animT, g.fuel / 100);
    // Tiny ambient embers without artificial spotlights.
    const flicker = Math.sin(g.animT * 7.1) * 1.5;
    px(ctx, CX - 4, 140 + flicker, 1, 1, "#ffb452");
    px(ctx, CX + 3, 137 - flicker, 1, 1, "#e9983b");
  } else if (g.everLit) {
    px(ctx, CX - 3, 148, 5, 1, "#8a2a1a");
    px(ctx, CX - 2, 147, 2, 1, "#c24a1e");
  }
  for (const s of g.sparks) {
    ctx.fillStyle = `rgba(255,210,120,${clamp(s.life, 0, 1)})`;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
  }
}

// the crafting bench, left of the fire
function drawBench(ctx: any, g: any) {
  const bx = BENCH_X, y = 152;
  ctx.fillStyle = "rgba(20,20,40,0.3)";
  ctx.fillRect(bx - 11, y - 1, 23, 2);
  px(ctx, bx - 8, y - 7, 2, 7, "#54371f");
  px(ctx, bx + 6, y - 7, 2, 7, "#54371f");
  px(ctx, bx - 11, y - 10, 22, 3, "#7a4c2a");
  px(ctx, bx - 11, y - 10, 22, 1, "#95603a");
  // hammer
  px(ctx, bx - 6, y - 13, 4, 2, "#8a92a0");
  px(ctx, bx - 5, y - 11, 1, 1, "#54371f");
  // plank with nails
  px(ctx, bx + 1, y - 12, 7, 2, "#a06a3a");
  px(ctx, bx + 2, y - 11, 1, 1, "#54371f");
  px(ctx, bx + 6, y - 11, 1, 1, "#54371f");
  // hanging lantern
  px(ctx, bx + 11, y - 16, 1, 6, "#54371f");
  if (g.isNight) {
    px(ctx, bx + 10, y - 13, 3, 3, "#ffd98a");
    px(ctx, bx + 11, y - 12, 1, 1, "#fff6d8");
  } else {
    px(ctx, bx + 10, y - 13, 3, 3, "#8a92a0");
  }
}

// the wood pile, right of the fire - grows with stored wood
function drawPile(ctx: any, g: any) {
  const bx = PILE_X, y = 152;
  const per = g.stage >= 4 ? 7 : 3;
  const rows = clamp(Math.ceil(g.stored / per), 0, 6);
  if (rows === 0) {
    px(ctx, bx - 8, y - 1, 16, 1, "#b8c2d0");
    px(ctx, bx - 5, y - 2, 3, 1, "#c8d2e0");
    return;
  }
  for (let i = 0; i < rows; i++) {
    const wdt = 16 - (i % 2);
    const yy = y - 2 - i * 2;
    const off = i % 2;
    px(ctx, bx - wdt / 2 + off, yy, wdt, 2, i % 2 ? "#7a4c2a" : "#8a5a34");
    px(ctx, bx - wdt / 2 + off, yy, 1, 2, "#c9a86a");
    px(ctx, bx + wdt / 2 - 1 + off, yy, 1, 2, "#c9a86a");
  }
  px(ctx, bx - 6, y - 2 - rows * 2, 5, 1, "#eef4fa");
}

// unbuilt plot marker: two stakes and a string
// unbuilt build site: survey stakes mark the spot, and the logs you
// carry here stack up visually until the site has all SITE_COST of them
function drawSite(ctx: any, g: any, bx: number, logs: number) {
  const y = 152;
  px(ctx, bx - 10, y - 4, 2, 4, "#7a5a34");
  px(ctx, bx - 10, y - 4, 2, 1, "#9a7a4a");
  px(ctx, bx + 9, y - 4, 2, 4, "#7a5a34");
  px(ctx, bx + 9, y - 4, 2, 1, "#9a7a4a");
  ctx.fillStyle = "rgba(190,200,216,0.45)";
  ctx.fillRect(bx - 8, y - 1, 16, 2);
  const n = Math.min(3, Math.ceil(logs / (SITE_COST / 3)));
  if (n >= 1) drawLog(ctx, bx - 7, y - 3, 7);
  if (n >= 2) drawLog(ctx, bx + 1, y - 3, 6);
  if (n >= 3) drawLog(ctx, bx - 3, y - 6, 7);
}

// a structure under construction: stacked logs, a hammer, and fog that clears as it rises
function drawConstruction(ctx: any, g: any, bx: number, isBench: boolean) {
  const y = 152;
  const prog = clamp((isBench ? g.benchBuildT : g.pileBuildT) / BUILD_TIME, 0, 1);
  drawSite(ctx, g, bx, SITE_COST);
  ctx.globalAlpha = 0.2 + prog * 0.8;
  if (isBench) drawBench(ctx, g); else drawPile(ctx, g);
  ctx.globalAlpha = 1;
  const swing = Math.sin(g.animT * 13) > 0 ? 0 : 1;
  px(ctx, bx + 2, y - 17 + swing, 2, 5, "#8a6a3a");
  px(ctx, bx + 1, y - 18 + swing, 4, 2, "#8a92a0");
  px(ctx, bx + 1, y - 18 + swing, 4, 1, "#b8c2d0");
  const fog = (1 - prog) * 0.55;
  for (let i = 0; i < 6; i++) {
    const fx = bx - 12 + i * 4.4 + Math.sin(g.animT * 1.2 + i * 2.3) * 2.5;
    const fy = y - 4 - ((i * 31 + Math.floor(g.animT * 8)) % 13);
    ctx.fillStyle = "rgba(222,230,240," + fog + ")";
    ctx.fillRect(Math.round(fx), Math.round(fy), 7, 3);
  }
  const pw = 18, bxp = Math.round(bx - pw / 2);
  ctx.fillStyle = "rgba(8,12,28,0.8)";
  ctx.fillRect(bxp - 1, 131, pw + 2, 5);
  ctx.fillStyle = "rgba(60,70,100,0.8)";
  ctx.fillRect(bxp, 132, pw, 3);
  ctx.fillStyle = "#ffd98a";
  ctx.fillRect(bxp, 132, Math.round(prog * pw), 3);
}

function drawStructures(ctx: any, g: any) {
  const st = g.stage;
  const colors = visualPalette(g);
  const roofTrim = colors.name === "winter" ? "#eef4fa" : colors.ridge;
  const x0 = CX - 42;
  if (g.builtBench) drawBench(ctx, g);
  else if (g.benchBuildT >= 0) drawConstruction(ctx, g, BENCH_X, true);
  else drawSite(ctx, g, BENCH_X, g.benchLogs);
  if (g.builtPile) drawPile(ctx, g);
  else if (g.pileBuildT >= 0) drawConstruction(ctx, g, PILE_X, false);
  else drawSite(ctx, g, PILE_X, g.pileLogs);
  if (st >= 2 && st < 6) {
    px(ctx, CX + 16, 142, 18, 3, "#8a5a34");
    px(ctx, CX + 17, 145, 2, 5, "#6b4a32");
    px(ctx, CX + 30, 145, 2, 5, "#6b4a32");
    px(ctx, CX + 16, 141, 18, 1, roofTrim);
  }
  if (st >= 3 && st < 6) {
    px(ctx, CX - 32, 150, 2, 18, "#6b4a32");
    px(ctx, CX - 8, 150, 2, 16, "#6b4a32");
    for (let i = 0; i < 8; i++) {
      px(ctx, CX - 38 + i * 4, 132 - i, 5, 2, "#8a5a34");
      px(ctx, CX - 38 + i * 4, 131 - i, 5, 1, roofTrim);
    }
  }
  if (st >= 4) {
    const sx = SHED_X;
    px(ctx, sx, 136, 26, 14, "#6b4a32");
    px(ctx, sx, 136, 26, 1, "#7a5636");
    px(ctx, sx + 8, 140, 10, 10, "#3a2a1e");
    px(ctx, sx + 10, 148, 6, 2, "#8a5a34");
    px(ctx, sx + 10, 146, 6, 2, "#7a4c2a");
    for (let i = 0; i < 8; i++) px(ctx, sx - 2 + i * 4, 133, 4, 2, "#5a3a22");
    px(ctx, sx - 2, 132, 30, 1, roofTrim);
  }
  if (st === 5) {
    px(ctx, CX - 36, 112, 4, 38, "#6a482c");
    px(ctx, CX + 32, 112, 4, 38, "#6a482c");
    px(ctx, CX - 36, 110, 72, 3, "#6a482c");
    px(ctx, CX - 36, 109, 72, 1, roofTrim);
    for (let i = 0; i < 9; i++) px(ctx, CX - 28 + i * 6, 118, 4, 32, "#7a5636");
  }
  if (st >= 6) {
    px(ctx, x0, 122, 84, 28, "#7a5636");
    for (let i = 0; i < 20; i++) px(ctx, x0 + 2 + i * 4, 124, 1, 24, "#6a482c");
    px(ctx, x0, 122, 84, 2, "#8a5a34");
    px(ctx, x0 + 6, 128, 11, 22, "#4a3428");
    px(ctx, x0 + 14, 138, 1, 1, "#ffd98a");
    px(ctx, x0 + 22, 126, 12, 10, "#ffd98a");
    px(ctx, x0 + 22, 126, 12, 1, "#4a3428");
    px(ctx, x0 + 22, 135, 12, 1, "#4a3428");
    px(ctx, x0 + 22, 126, 1, 10, "#4a3428");
    px(ctx, x0 + 33, 126, 1, 10, "#4a3428");
    px(ctx, x0 + 60, 126, 12, 10, "#ffd98a");
    px(ctx, x0 + 60, 126, 12, 1, "#4a3428");
    px(ctx, x0 + 60, 135, 12, 1, "#4a3428");
    px(ctx, x0 + 60, 126, 1, 10, "#4a3428");
    px(ctx, x0 + 71, 126, 1, 10, "#4a3428");
    px(ctx, x0 + 68, 86, 8, 12, "#8a8a92");
    px(ctx, x0 + 67, 85, 10, 2, "#9aa2ac");
    for (let i = 0; i < 16; i++) {
      const w = 84 - i * 5;
      if (w <= 0) break;
      px(ctx, CX - w / 2, 120 - i * 2, w, 2, i % 2 ? "#8a4a3a" : "#94523e");
    }
    for (let i = 0; i < 6; i++) {
      const w = 84 - i * 5;
      px(ctx, CX - w / 2, 119 - i * 2, w, 1, roofTrim);
    }
  }
  for (const s of g.smoke) {
    ctx.fillStyle = `rgba(207,214,221,${clamp(s.life, 0, 1) * 0.5})`;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
  }
}

// one side-view log with bark shading and pale cut end caps
function drawLog(ctx: any, x: number, y: number, w: number) {
  px(ctx, x, y, w, 3, "#6b4426");
  px(ctx, x, y, w, 1, "#8a5a34");
  px(ctx, x, y + 2, w, 1, "#4a2e18");
  px(ctx, x, y, 1, 3, "#c9975f");
  px(ctx, x + w - 1, y, 1, 3, "#c9975f");
  px(ctx, x, y + 1, 1, 1, "#8a5a34");
  px(ctx, x + w - 1, y + 1, 1, 1, "#8a5a34");
}

function drawPickups(ctx: any, g: any) {
  for (const pk of g.pickups) {
    const x = Math.round(pk.x), y = Math.round(pk.y);
    ctx.fillStyle = "rgba(20,20,40,0.25)";
    ctx.fillRect(x - 7, y, 14, 1);
    if (pk.w >= 4) {
      // small log pile: two below, one on top
      drawLog(ctx, x - 7, y - 3, 7);
      drawLog(ctx, x + 1, y - 3, 6);
      drawLog(ctx, x - 3, y - 6, 7);
    } else if (pk.w >= 2) {
      drawLog(ctx, x - 5, y - 3, 8);
      drawLog(ctx, x - 2, y - 6, 6);
    } else {
      drawLog(ctx, x - 4, y - 3, 8);
    }
  }
}

function drawMountainRange(ctx: any, arr: any[], color: string, snow: string) {
  for (const m of arr) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(m.x, GROUND + 2);
    ctx.lineTo(m.x + m.w / 2, GROUND + 2 - m.h);
    ctx.lineTo(m.x + m.w, GROUND + 2);
    ctx.closePath();
    ctx.fill();
    const capH = Math.min(9, m.h * 0.35);
    const capW = m.w * (capH / m.h);
    ctx.fillStyle = snow;
    ctx.beginPath();
    ctx.moveTo(m.x + m.w / 2 - capW / 2, GROUND + 2 - m.h + capH);
    ctx.lineTo(m.x + m.w / 2, GROUND + 2 - m.h);
    ctx.lineTo(m.x + m.w / 2 + capW / 2, GROUND + 2 - m.h + capH);
    ctx.closePath();
    ctx.fill();
  }
}

// Rolling hills fill the horizon in the meadow / forest regions.
// Moving right gradually reveals the mountain panorama instead.
function drawHillRange(ctx: any, camX: number, shift: number,
                       fill: string, depth: number, spread: number) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, GROUND + 12);
  for (let x = 0; x <= W + 8; x += 8) {
    const wx = x + camX * shift;
    const y = GROUND - depth
      - Math.sin(wx / spread) * 10
      - Math.sin(wx / (spread * 0.48) + 0.9) * 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W + 8, GROUND + 12);
  ctx.closePath();
  ctx.fill();
}

// ============ distant forest layers ============
// Forest silhouettes are decorative parallax, not collectible world trees.
function drawForestLayer(ctx: any, camX: number, parallax: number, base: number,
                         color: string, spacing: number, seed: number) {
  const scroll = camX * parallax;
  const start = Math.floor((scroll - 40) / spacing);
  const end = Math.ceil((scroll + W + 40) / spacing);
  ctx.save();
  ctx.translate(-Math.round(scroll), 0);
  for (let i = start; i <= end; i++) {
    const r = Math.abs(Math.sin(i * 91.731 + seed * 17.23) * 43758.5453) % 1;
    const x = Math.round(i * spacing + (r - 0.5) * 12);
    const h = Math.round(19 + r * 18);
    const half = Math.round(5 + r * 4);
    px(ctx, x - 1, base - h + 5, 2, h - 4, color);
    for (let row = 0; row < h - 5; row += 2) {
      const wid = Math.max(1, Math.round((row / (h - 5)) * half));
      px(ctx, x - wid, base - h + row, wid * 2 + 1, 2, color);
    }
  }
  ctx.restore();
}

// ============ ambient critters ============
function drawCritter(ctx: any, c: any, g: any) {
  const x = Math.round(c.x), y = Math.round(c.y);
  const d = c.dir || 1;
  const rabbitFur = visualSeason(g) === "winter" ? "#e8eef4" : "#bda184";
  if (c.type === "bird") {
    if (c.state === "fly") {
      const flap = Math.sin(g.animT * (17 + (c.ph || 0) % 5) + c.ph) > 0 ? -1 : 1;
      ctx.fillStyle = "#39435a";
      ctx.fillRect(x - 1, y, 3, 1);
      ctx.fillRect(x - 2, y + flap, 2, 1);
      ctx.fillRect(x + 1, y + flap, 2, 1);
    } else {
      const hop = Math.sin(g.animT * 4 + c.ph) > 0.82 ? -1 : 0;
      ctx.fillStyle = "rgba(20,20,40,0.25)";
      ctx.fillRect(x - 2, y - 1, 4, 1);
      px(ctx, x - 2, y - 3 + hop, 4, 2, "#39435a");
      px(ctx, x + d, y - 5 + hop, 3, 3, "#39435a");
      px(ctx, x + d * 2, y - 4 + hop, 1, 1, "#e8a03a");
      px(ctx, x - 1, y - 1 + hop, 1, 1, "#8a94ac");
      px(ctx, x + 1, y - 1 + hop, 1, 1, "#8a94ac");
    }
  } else if (c.type === "bunny") {
    const hop = c.state === "hop" ? -Math.abs(Math.sin(g.animT * 10 + c.ph)) * 3 : (Math.sin(g.animT * 3 + c.ph) > 0.85 ? -1 : 0);
    const ears = Math.sin(g.animT * 4 + c.ph) > 0.4 ? -1 : 0;
    ctx.fillStyle = "rgba(20,20,40,0.25)";
    ctx.fillRect(x - 2, y - 1, 5, 1);
    px(ctx, x - 2, y - 3 + hop, 5, 3, rabbitFur);
    px(ctx, x + d * 2, y - 5 + hop, 2, 2, rabbitFur);
    px(ctx, x + d * 2, y - 7 + hop + ears, 1, 2, rabbitFur);
    px(ctx, x + d * 3, y - 7 + hop - ears, 1, 2, "#d8dfe8");
    px(ctx, x + d * 3, y - 4 + hop, 1, 1, "#d87a8a");
  } else if (c.type === "fox") {
    const bob = c.state === "trot" ? Math.floor(g.animT * 10) % 2 : 0;
    const headTilt = c.state === "watch" && Math.sin(g.animT * 1.8 + c.x) > 0.8 ? -1 : 0;
    ctx.fillStyle = "rgba(20,20,40,0.25)";
    ctx.fillRect(x - 4, y - 1, 8, 1);
    px(ctx, x - 3, y - 3 - bob, 7, 3, "#c9703a");
    px(ctx, x + d * 3, y - 5 - bob + headTilt, 3, 3, "#c9703a");
    px(ctx, x + d * 3, y - 6 - bob, 1, 2, "#8a4a28");
    px(ctx, x + d * 5, y - 4 - bob, 1, 1, "#2a2a2e");
    const wag = Math.sin(g.animT * 4 + c.x * 0.13) > 0.2 ? -1 : 0;
    px(ctx, x - d * 4, y - 4 - (c.state === "trot" ? bob : wag), 3, 2, "#c9703a");
    px(ctx, x - d * 6, y - 3, 2, 1, "#e8eef4");
  }
}

// ============ engine ============
function createEngine(): any {
  return {
    animT: 0, time: 10, isNight: false, night: 0, weather: "clear", aurora: false,
    weatherBlend: 1, previousWeather: "clear", scenerySeed: 777, resumeData: null,
    trees: [], falling: [], chips: [], pickups: [], mts: [], mts2: [], stars: [], sparkles: [], snow: [], sparks: [], smoke: [],
    player: { x: CX + 26, y: PLAYER_Y, dir: -1, wood: 0, torchT: 0, chopT: 0, chopTime: 1, chopTree: null, moving: false, warmth: 100 },
    dog: null, stored: 0, stokeCd: 0, camX: CX - W / 2, shake: 0,
    pleft: false, pright: false,
    fireLit: false, everLit: false, firestarter: 1, fuel: 0, stage: 0,
    longNightPending: false, longNightActive: false,
    won: false, endlessMode: false, endlessN: 0, over: false,
    ashEarned: 0, depth: 0, actionLabel: "-", windAmt: 0, moveT: 0,
    builtBench: false, builtPile: false, benchLogs: 0, pileLogs: 0,
    benchBuildT: -1, pileBuildT: -1, dust: [] as any[], footprints: [] as any[], footstepT: 0, walkSoundT: 0,
    keys: {}, pressE: false, pressT: false, chopBlocked: false, packTier: 0,
    sparkAcc: 0, smokeAcc: 0, treeId: 1,
    // UI
    ui: "title", menu: null, menuSel: 0, titleSel: 0, lastResult: null,
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
  toast(g, "Survive the nights. Build a cabin. Outlast the winter.");
}

function startRun(g: any, meta: any) {
  clearRunSnapshot();
  startRunEngine(g, meta);
  g.ui = "run";
  g.menu = null;
  saveRunSnapshot(g);
}

function goEndless(g: any) {
  // Victory ash was banked on the win screen; never award it a second time.
  g.ashEarned = 0;
  g.endlessMode = true;
  g.ui = "run";
  g.menu = null;
  toast(g, "Endless winter. Survive as long as you can.");
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
  if (!day && g.weather === "clear" && r < 0.25) {
    g.meteors.push({ x: 60 + Math.random() * 200, y: 8 + Math.random() * 26, vx: -(70 + Math.random() * 40), vy: 34 + Math.random() * 18, life: 1 });
    if (run) toast(g, "A shooting star crosses the sky.");
    return;
  }
  if (!day && r < 0.4) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = clamp(g.player.x + side * (80 + Math.random() * 40), 20, WORLD_W - 20);
    g.critters.push({ type: "fox", x, y: 150 + Math.random() * 8, state: "watch", t: 12 + Math.random() * 8, dir: -side });
    if (run && Math.random() < 0.15) toast(g, "A fox watches from the treeline.");
    return;
  }
  if (day && r < 0.55) {
    const n = 3 + Math.floor(Math.random() * 3);
    const fromLeft = Math.random() < 0.5;
    const bx = fromLeft ? g.camX - 24 : g.camX + W + 24;
    const vx = (fromLeft ? 1 : -1) * (16 + Math.random() * 12);
    const by = 34 + Math.random() * 26;
    for (let i = 0; i < n; i++) {
      g.critters.push({ type: "bird", x: bx - i * 7 * (fromLeft ? 1 : -1), y: by + Math.sin(i * 2.1) * 4, state: "fly", vx, t: -1, ph: i * 1.3, dir: vx > 0 ? 1 : -1 });
    }
    if (run && Math.random() < 0.12) toast(g, "Birds cross the pale sky.");
    return;
  }
  if (r < 0.78) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = clamp(g.player.x + side * (46 + Math.random() * 50), 20, WORLD_W - 20);
    if (Math.random() < 0.5) {
      g.critters.push({ type: "bunny", x, y: 146 + Math.random() * 12, state: "sit", t: 10 + Math.random() * 10, ph: Math.random() * 6, dir: -side });
    } else {
      g.critters.push({ type: "bird", x, y: 146 + Math.random() * 12, state: "sit", t: 8 + Math.random() * 8, ph: Math.random() * 6, dir: -side });
    }
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
    g.aurora = g.weather === "clear" && Math.random() < 0.25;
    if (g.longNightPending) {
      g.longNightPending = false;
      g.longNightActive = true;
      g.weather = "blizzard";
      g.aurora = false;
      cb.toast("THE LONG NIGHT. Hold the fire until dawn!");
    } else {
      let w = `Night ${g.night} falls. (${WEATHER_TEXT[g.weather]})`;
      if (g.aurora) w += " An aurora shimmers above the peaks.";
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
      cb.end("won", { nights: g.night, ash: Math.floor(g.ashEarned) });
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
    g.depth = Math.max(0, g.night - 5) + (g.endlessMode ? g.endlessN * 0.6 : 0);
  }

  const windAmt = weatherIntensity(g, "wind") + weatherIntensity(g, "blizzard") * 1.6;

  // ---- torch ----
  if (g.pressT) {
    g.pressT = false;
    if (g.fireLit && p.torchT <= 0 && g.fuel > 12) {
      g.fuel -= 8;
      p.torchT = meta.up.scarf ? 50 : 30;
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
          g.fuel = Math.min(100, g.fuel + 16);
        } else if (g.stored > 0 && g.fuel < 99) {
          g.stored--;
          g.fuel = Math.min(100, g.fuel + 16);
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
      if (p.wood > 0) { p.wood--; g.fuel = Math.min(100, g.fuel + 16); g.stokeCd = 0.3; }
      else if (g.stored > 0) { g.stored--; g.fuel = Math.min(100, g.fuel + 16); g.stokeCd = 0.3; }
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
  if (g.fireLit && Math.abs(p.x - CX) < wr) d -= 6 * (g.stage >= 2 ? 1.25 : 1);
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
  const winter = visualSeason(g) === "winter";
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
  drawText(ctx, "ASH " + Math.floor(g.ashEarned), 134, 26, "#d8caf2");
  if (g.player.torchT > 0) drawText(ctx, "TORCH " + Math.ceil(g.player.torchT), 6, 40, "#ffd977");

  const rx = W - 81;
  drawText(ctx, g.isNight ? "NIGHT " + g.night : "DAY " + (g.night + 1), rx, 22, "#e0e5ef");
  drawText(ctx, WEATHER_TEXT[g.weather] || "", rx, 30, "#c8d2e8");
  drawText(ctx, visualSeason(g).toUpperCase(), rx, 38, "#dfc99a");
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
      label: "END RUN", right: "+" + Math.floor(g.ashEarned) + " ASH", desc: "HEAD HOME AND BANK YOUR ASH", h: 15,
      enabled: true,
      onDown: () => {
        g.settingsFrom = null;
        if (g.cb && g.cb.end) g.cb.end("retired", { nights: g.night, ash: Math.floor(g.ashEarned) });
      },
    },
  ];
}

function benchRows(g: any, meta: any) {
  return CRAFTS.map((c: any) => {
    const owned = !!g.crafts[c.id];
    const total = g.player.wood + g.stored;
    const enabled = !owned && total >= c.cost;
    return {
      label: c.name.toUpperCase(),
      right: owned ? "OWNED" : c.cost + " WOOD",
      desc: c.desc,
      h: 15,
      enabled,
      onDown: () => {
        if (owned) { toast(g, c.name.toUpperCase() + " is already crafted."); return; }
        if (total < c.cost) { toast(g, "Not enough wood."); return; }
        const fromCarried = Math.min(g.player.wood, c.cost);
        g.player.wood -= fromCarried;
        g.stored -= c.cost - fromCarried;
        g.crafts[c.id] = true;
        toast(g, c.name.toUpperCase() + " crafted.");
      },
    };
  });
}

function shopRows(g: any, meta: any) {
  return UPGRADES.map((u: any) => {
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
  if (g.menu === "shop") return shopRows(g, meta);
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
}

function activateSel(g: any, meta: any) {
  const rows = menuRows(g, meta);
  if (!rows.length) return;
  g.menuSel = clamp(g.menuSel, 0, rows.length - 1);
  rows[g.menuSel].onDown();
}

function doBuildAction(g: any, meta: any) {
  if (g.stage >= 6) { g.menu = null; return; }
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
  // the workbench and wood pile are no longer built from this menu:
  // carry 15 logs to each marked site and press ACT there to build
  const rows: any[] = [];
  const have = () => g.player.wood + g.stored;
  if (g.stage < 6) {
    const cost = Math.round(STAGES[g.stage].cost * (meta.up.blue ? 0.8 : 1));
    rows.push({
      label: STAGES[g.stage].name.toUpperCase(), right: cost + " WOOD", desc: STAGES[g.stage].desc.toUpperCase(), h: 15,
      enabled: have() >= cost,
      onDown: () => doBuildAction(g, meta),
    });
  }
  if (!rows.length) {
    rows.push({ label: "NOTHING LEFT TO BUILD", right: "", desc: "THE CAMP IS COMPLETE", h: 15, enabled: false, onDown: () => { } });
  }
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
  panel(ctx, 34, 18, 252, 146);
  drawText(ctx, "HOW TO PLAY", 40, 24, "#ffd98a");
  closeZone(ctx, g, 268, 24);
  const lines: any[] = [
    ["WALK: HOLD LEFT OR RIGHT SIDE", "#c8d2e8"],
    ["OF THE SCREEN - OR A AND D KEYS", "#c8d2e8"],
    ["", "#c8d2e8"],
    ["ACT: BIG BUTTON OR E. HOLD IT", "#c8d2e8"],
    ["TO KEEP CHOPPING OR STOKING", "#c8d2e8"],
    ["", "#c8d2e8"],
    ["THE WORKBENCH AND WOOD PILE SITES", "#ffd977"],
    ["ARE MARKED BY STAKES. CARRY 15", "#ffd977"],
    ["LOGS TO A SITE AND ACT TO STACK THEM.", "#ffd977"],
    ["ACT AGAIN - HAMMERING TAKES A WHILE", "#ffd977"],
    ["", "#c8d2e8"],
    ["WORKBENCH: CRAFT GEAR", "#ffd977"],
    ["WOOD PILE: STORE WOOD", "#ffd977"],
    ["", "#c8d2e8"],
    ["TORCH: T - BUILD: B - PAUSE: P OR ESC", "#c8d2e8"],
    ["", "#c8d2e8"],
    ["ASH IS EARNED EACH NIGHT AND SPENT", "#cfc2f0"],
    ["ON PERMANENT UPGRADES BETWEEN RUNS", "#cfc2f0"],
  ];
  let y = 36;
  for (const ln of lines) {
    if (ln[0]) drawText(ctx, ln[0], 42, y, ln[1]);
    y += 7;
  }
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
    drawListMenu(ctx, g, "FLAME LINEAGE", "ASH " + meta.ash, shopRows(g, meta));
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
    drawListMenu(ctx, g, "PAUSED", "ASH " + Math.floor(g.ashEarned), pauseRows(g, meta));
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
  // Narrow pressed-edge tint (15% width), with NO new arrows or controls.
  const left = !!(g.pleft || g.keys.left);
  const right = !!(g.pright || g.keys.right);
  if (!left && !right) return;
  const edgeWidth = Math.round(W * 0.15);
  const fillSide = (x: number) => {
    ctx.fillStyle = g.isNight ? "rgba(187,206,226,0.105)" : "rgba(51,79,101,0.115)";
    ctx.fillRect(x, 0, edgeWidth, H);
  };
  if (left) fillSide(0);
  if (right) fillSide(W - edgeWidth);
}

// movement chevrons mid-screen on both sides - movement hint, not a button
// darker ink during the bright day, pale light at night so they always read
function drawSideArrows(ctx: any, g: any) {
  const actL = !!(g.pleft || g.keys.left);
  const actR = !!(g.pright || g.keys.right);
  const pulse = 0.5 + 0.5 * Math.sin(g.animT * 2);
  const cy = 92;
  const drawChev = (dir: number, active: boolean) => {
    if (active) ctx.fillStyle = g.isNight ? "rgba(255,217,138,0.65)" : "rgba(70,40,14,0.6)";
    else ctx.fillStyle = g.isNight
      ? `rgba(235,240,250,${0.2 + pulse * 0.12})`
      : `rgba(24,32,52,${0.34 + pulse * 0.14})`;
    for (let i = 0; i < 7; i++) {
      const ind = Math.abs(i - 3);
      const xx = dir < 0 ? 14 + ind * 3 : W - 16 - ind * 3;
      ctx.fillRect(xx, cy - 7 + i * 2, 2, 2);
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
    { label: "UPGRADES", act: () => { g.menu = "shop"; g.menuSel = 0; } },
    { label: "SETTINGS", act: () => { g.menu = "settings"; g.menuSel = 0; } },
    { label: "HOW TO PLAY", act: () => { g.menu = "help"; } },
  ]);
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
    drawTextC(ctx, "A COZY WINTER SURVIVAL", W / 2, 50, "#c8d2e8");
    drawTextC(ctx, "ASH " + meta.ash + " - BEST " + (meta.best || 0) + " NIGHTS", W / 2, 60, "#8a94ac");
    // themed menu panel
    panel(ctx, 98, 69, 124, 91);
    const items = titleActions(g, meta);
    g.titleSel = clamp(g.titleSel || 0, 0, items.length - 1);
    for (let i = 0; i < items.length; i++) {
      const y = 76 + i * 16;
      const sel = i === g.titleSel;
      if (sel) px(ctx, 102, y - 2, 116, 11, "rgba(255,217,138,0.12)");
      drawTextC(ctx, items[i].label, W / 2 + (sel ? 4 : 0), y, sel ? "#ffd98a" : "#98a4bc");
      if (sel) drawFlame(ctx, 112, y + 4, g.animT, 0.12);
      const it = items[i];
      const idx = i;
      g.zones.push({ x: 102, y: y - 3, w: 116, h: 12, onDown: () => { g.titleSel = idx; it.act(); } });
    }
    if (Math.sin(g.animT * 3) > -0.2) drawTextC(ctx, "W/S PICK - E SELECT", W / 2, 163, "#5a6480");
    drawTextC(ctx, "HOLD A SCREEN SIDE TO WALK", W / 2, 170, "#4a5470");
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
    uiButton(ctx, g, 100, 113, 120, 13, "UPGRADES", { onDown: () => { g.menu = "shop"; g.menuSel = 0; } });
  } else if (g.ui === "win" && g.lastResult) {
    ctx.fillStyle = "rgba(8,10,26,0.55)";
    ctx.fillRect(0, 0, W, H);
    drawBig(ctx, "DAWN AT LAST", W / 2 + 2, 28 + 2, 3, "#3a2408");
    drawBig(ctx, "DAWN AT LAST", W / 2, 28, 3, "#ffd98a");
    drawTextC(ctx, "THE LONG NIGHT HAS PASSED. THE CABIN IS YOURS.", W / 2, 52, "#c8d2e8");
    drawTextC(ctx, "NIGHTS " + g.lastResult.nights + " - ASH +" + g.lastResult.ash, W / 2, 62, "#ffd98a");
    uiButton(ctx, g, 90, 82, 140, 14, "ENDLESS WINTER", { onDown: () => goEndless(g) });
    uiButton(ctx, g, 90, 100, 140, 13, "UPGRADES", { onDown: () => { g.menu = "shop"; g.menuSel = 0; } });
    uiButton(ctx, g, 90, 117, 140, 13, "NEW RUN", { onDown: () => startRun(g, meta) });
  }
}

// ============ input ============
function handleKey(g: any, meta: any, k: string, down: boolean) {
  if (g.menu === "audio" && down && ["arrowleft", "a", "arrowright", "d"].includes(k)) {
    const row: any = audioRows(g)[g.menuSel];
    if (row && row.onAdjust) row.onAdjust(k === "arrowleft" || k === "a" ? -1 : 1);
    return;
  }
  if (k === "arrowleft" || k === "a") g.keys.left = !g.menu && down;
  if (k === "arrowright" || k === "d") g.keys.right = !g.menu && down;
  if (!down) {
    if (k === "e" || k === " ") { g.keys.act = false; g.chopBlocked = false; }
    return;
  }
  const isList = ["bench", "shop", "build", "settings", "audio", "reset1", "reset2", "pause"].includes(g.menu);
  if (k === "arrowup" || k === "w") {
    if (isList) moveSel(g, meta, -1);
    else if (g.ui === "title" && !g.menu) g.titleSel = (g.titleSel + titleActions(g, meta).length - 1) % titleActions(g, meta).length;
  }
  if (k === "arrowdown" || k === "s") {
    if (isList) moveSel(g, meta, 1);
    else if (g.ui === "title" && !g.menu) g.titleSel = (g.titleSel + 1) % titleActions(g, meta).length;
  }
  if (k === "e" || k === "enter" || k === " ") {
    if (isList) activateSel(g, meta);
    else if (g.menu === "help") { g.menu = null; }
    else if (g.menu === "privacy" || g.menu === "credits") closeMenu(g);
    else if (g.ui === "title") activateTitleItem(g, meta, g.titleSel);
    else if (g.ui === "dead") startRun(g, meta);
    else if (g.ui === "win") goEndless(g);
    else if (g.ui === "run") { g.pressE = true; g.keys.act = true; }
  }
  if (k === "t" && g.ui === "run" && !g.menu) g.pressT = true;
  if (k === "b") {
    if (g.ui === "run") {
      g.menu = g.menu ? null : "build";
      g.menuSel = 0;
      g.keys.act = false;
    } else if (g.menu) g.menu = null;
  }
  if (k === "escape") {
    if (g.menu) closeMenu(g);
    else if (g.ui === "run" && !g.over) { g.menu = "pause"; g.menuSel = 0; g.keys.act = false; }
  }
  if (k === "p" && g.ui === "run" && !g.over) {
    if (g.menu === "pause") { g.menu = null; g.keys.act = false; }
    else if (!g.menu) { g.menu = "pause"; g.menuSel = 0; g.keys.act = false; }
  }
  if (k === "u" && !g.menu && (g.ui === "title" || g.ui === "dead" || g.ui === "win")) { g.menu = "shop"; g.menuSel = 0; }
  if (k === "f" && g.fsToggle) g.fsToggle();
}

function syncTouchMovement(g: any) {
  // One finger lifting must not cancel another finger still holding a side.
  g.pleft = false;
  g.pright = false;
  for (const p of Object.values(g.pointers) as any[]) {
    if (!p.side) continue;
    if (p.dir === "left") g.pleft = true;
    if (p.dir === "right") g.pright = true;
  }
}
function handlePointer(g: any, type: string, id: number, mx: number, my: number) {
  if (type === "down") {
    for (let i = g.zones.length - 1; i >= 0; i--) {
      const z = g.zones[i];
      if (mx >= z.x && mx < z.x + z.w && my >= z.y && my < z.y + z.h) {
        g.pointers[id] = { zone: z };
        if (z.onDown) z.onDown();
        return;
      }
    }
    if (g.menu) { closeMenu(g); return; }
    if (g.ui === "run") {
      g.pointers[id] = { side: true, dir: mx < W / 2 ? "left" : "right" };
      syncTouchMovement(g);
    }
  } else if (type === "move") {
    const pt = g.pointers[id];
    if (pt && pt.side) {
      pt.dir = mx < W / 2 ? "left" : "right";
      syncTouchMovement(g);
    }
  } else {
    const pt = g.pointers[id];
    if (pt) {
      if (pt.zone && pt.zone.onUp) pt.zone.onUp();
      delete g.pointers[id];
      if (pt.side) syncTouchMovement(g);
    }
  }
}

// ============ world-object reflection ============
// Render only visible objects into a transparent buffer: mirroring the completed
// screen previously reflected the bright ground strip instead of the player.
// The downward offset aligns world feet with the water surface.
function renderReflectionSubjects(rctx: any, g: any, colors: any, camX: number) {
  rctx.clearRect(0, 0, W, H);
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
    const wave = Math.sin(i * 0.49 + g.animT * 1.5) * 1.25 +
      Math.sin(i * 0.18 - g.animT * 0.76) * 1.4;
    const wind = g.weather === "wind" || g.weather === "blizzard" ? 1.6 : 1;
    const shift = Math.round(wave * wind);
    const sx = Math.max(0, -shift);
    const dx = Math.max(0, shift);
    ctx.globalAlpha = (0.53 - 0.28 * i / height) * (g.weather === "blizzard" ? 0.75 : 1);
    ctx.drawImage(reflection, sx, srcY, W - Math.abs(shift), 1,
      dx, WATER_Y + i, W - Math.abs(shift), Math.min(pixelStep, height - i));
  }
  ctx.restore();
  for (let i = 0; i < 14; i++) {
    const y = WATER_Y + 3 + (i * 11) % (height - 3);
    const x = (i * 71 + Math.floor(Math.sin(g.animT * 0.62 + i) * 14)
      - Math.floor(camX * 0.16) + 4 * W) % W;
    ctx.fillStyle = "rgba(178,215,227," + (0.07 + (1 - night) * 0.045) + ")";
    ctx.fillRect(x, y, 7 + (i % 4) * 4, 1);
  }
  const bank = lerpHex(palette.shore, "#243746", night * 0.92);
  for (let x = 0; x < W; x += 2) {
    const wx = x + camX;
    const delta = Math.round(Math.sin(wx * 0.05) + Math.sin(wx * 0.13) * 0.7);
    const y = WATER_Y - 2 + delta;
    ctx.fillStyle = bank;
    ctx.fillRect(x, y, 2, 1);
  }
}

// ============ draw ============
function draw(g: any, ctx: any, off: any, octx: any, reflection: any, rctx: any, meta: any) {
  g.zones = [];
  // Derived from current permanent and crafted upgrades: never persisted as
  // another source of truth. The game world and reflection share this tier.
  g.packTier = (meta.up.pack ? 1 : 0) + (g.crafts.pack ? 1 : 0);
  const inRun = g.ui === "run";
  // clear the pending upgrade confirmation once the shop is closed or left
  if (g.menu !== "shop") g.upConfirm = null;
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
    if (g.aurora) {
      for (let x = 0; x < W; x += 4) {
        const h1 = 26 + Math.sin(x * 0.05 + g.animT * 0.7) * 12 + Math.sin(x * 0.11 - g.animT * 0.4) * 6;
        ctx.fillStyle = "rgba(58,255,200,0.055)";
        ctx.fillRect(x, 16, 4, h1);
        ctx.fillStyle = "rgba(80,160,255,0.04)";
        ctx.fillRect(x, 8, 4, h1 * 0.7);
      }
    }
    // shooting stars
    for (const m of g.meteors) {
      ctx.fillStyle = `rgba(230,240,255,${clamp(m.life, 0, 1)})`;
      ctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
      ctx.fillStyle = `rgba(180,200,240,${clamp(m.life, 0, 1) * 0.6})`;
      ctx.fillRect(Math.round(m.x - m.vx * 0.02), Math.round(m.y - m.vy * 0.02), 1, 1);
      ctx.fillRect(Math.round(m.x - m.vx * 0.05), Math.round(m.y - m.vy * 0.05), 1, 1);
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
  drawForestLayer(ctx, camX, 0.24, GROUND + 11, colors.far, 24, 3);
  drawForestLayer(ctx, camX, 0.48, GROUND + 10, colors.near, 22, 9);
  ctx.restore();

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

  if (g.fireLit && lightR > 0) {
    ctx.globalCompositeOperation = "lighter";
// slow firelight flicker on the surrounding ground (no second light source)
    const flicker = 0.92 + Math.sin(g.animT * 9) * 0.06;
    const rg = ctx.createRadialGradient(CX - camX, 146, 0, CX - camX, 146, Math.max(10, lightR * flicker));
    rg.addColorStop(0, "rgba(255,150,60,0.22)");
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

export { loadMeta, saveMeta, createEngine, setupTitleScene, loadRunSnapshot, clearRunSnapshot, toast, saveRunSnapshot, update, updateAmbient, draw, handleKey, handlePointer, AUDIO };
export { W, H } from "./config";
