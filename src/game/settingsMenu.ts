import { AUDIO } from "./audio";
import { GRAPHICS } from "./graphics";
import { saveMeta } from "./save";

/** Settings controls stay independent from their drawing and the main engine.
 * Their transitions, persistent preferences and two-step reset flow are unchanged.
 * The caller provides close handling to avoid importing the engine. */
export function createSettingsRows(g: any, meta: any, onClose: () => void) {
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
      label: "GUIDING FIREFLIES", right: meta.guideFx === false ? "OFF" : "ON",
      desc: "SHOW OR HIDE GROOTYS NEXT OBJECTIVE GLOW",
      h: 15, enabled: true,
      onDown: () => { meta.guideFx = meta.guideFx === false; saveMeta(meta); }
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
      onDown: onClose
    },
  ];
}
export function createAudioRows(g: any, onClose: () => void) {
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
      h: 15, enabled: true, onDown: onClose
    }
  ];
}
