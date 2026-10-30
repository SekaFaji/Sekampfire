import { CX } from "./config";
import { clamp } from "./math";
import { weatherIntensity } from "./weather";

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

export { AUDIO };
