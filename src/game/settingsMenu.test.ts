import { afterEach, describe, expect, it, vi } from "vitest";
import { AUDIO } from "./audio";
import { createEngine, drawMenu, closeMenu } from "./game";
import { createAudioRows, createSettingsRows } from "./settingsMenu";
import {
  MENU_PANEL_INK, SETTINGS_PANEL_INK, SETTINGS_SELECTED_INK,
  SETTINGS_SLIDER_INK, SETTINGS_VEIL_INK, isSettingsFamily, panel
} from "./listMenuRenderer";

function canvas() {
  let fill = "";
  const rects: Array<{x:number;y:number;w:number;h:number;fill:string}> = [];
  const ctx:any = {
    set fillStyle(value:string) { fill=value; },
    get fillStyle() { return fill; },
    fillRect(x:number,y:number,w:number,h:number) {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      rects.push({x,y,w,h,fill});
    }
  };
  return {ctx,rects};
}
const meta = () => ({ash:20,up:{},guideFx:true});
afterEach(() => vi.unstubAllGlobals());

describe("Settings opacity and native list rendering", () => {
  it("keeps the main menu panel unchanged, but uses a lighter Settings surface", () => {
    const {ctx,rects} = canvas();
    panel(ctx,98,76,124,58);
    expect(rects[0].fill).toBe(MENU_PANEL_INK);
    const g=createEngine();g.menu="settings";g.menuSel=1;g.zones=[];
    rects.length=0;
    drawMenu(ctx,g,meta());
    expect(rects[0]).toMatchObject({x:0,y:0,w:320,h:180,fill:SETTINGS_VEIL_INK});
    expect(rects.some(r=>r.w===272&&r.h===164&&r.fill===SETTINGS_PANEL_INK)).toBe(true);
    expect(rects.some(r=>r.fill===SETTINGS_SELECTED_INK)).toBe(true);
    expect(g.menuRect).toEqual({x:24,y:8,w:272,h:164});
  });
  it("uses the same Settings opacity for Audio sliders and both save warnings", () => {
    const g=createEngine(), {ctx,rects}=canvas();
    for(const menu of ["audio","reset1","reset2"]) {
      g.menu=menu;g.menuSel=0;g.zones=[];rects.length=0;
      drawMenu(ctx,g,meta());
      expect(rects[0].fill).toBe(SETTINGS_VEIL_INK);
      expect(rects.some(r=>r.fill===SETTINGS_PANEL_INK&&r.w===272)).toBe(true);
      if(menu==="audio") expect(rects.some(r=>r.fill===SETTINGS_SLIDER_INK&&r.w===49&&r.h===3)).toBe(true);
    }
    expect(["settings","audio","reset1","reset2"].every(isSettingsFamily)).toBe(true);
    expect(isSettingsFamily("shop")).toBe(false);
  });
  it("does not alter pause and other menus' established darkening", () => {
    const g=createEngine(),{ctx,rects}=canvas();g.menu="pause";g.zones=[];
    drawMenu(ctx,g,meta());
    expect(rects[0].fill).toBe("rgba(4,6,16,0.25)");
    expect(rects.some(r=>r.fill===MENU_PANEL_INK&&r.w===272)).toBe(true);
    expect(rects.some(r=>r.fill===SETTINGS_PANEL_INK)).toBe(false);
  });
  it("keeps Settings and Audio options, navigation and the close button active", () => {
    const g=createEngine(),m=meta();
    g.menu="settings";g.zones=[];
    const {ctx,rects}=canvas();
    drawMenu(ctx,g,m);
    expect(g.zones).toHaveLength(9); // X plus eight settings rows
    const close=g.zones.find((z:any)=>z.w===14&&z.h===11);
    expect(close).toBeDefined();
    const settingsRows=createSettingsRows(g,m,()=>closeMenu(g));
    expect(settingsRows.map((r:any)=>r.label)).toEqual([
      "AUDIO","FULLSCREEN","GUIDING FIREFLIES","VISUAL FX",
      "PRIVACY POLICY","CREDITS","RESET SAVE","BACK"
    ]);
    settingsRows[0].onDown();
    expect(g.menu).toBe("audio");
    const audioRows=createAudioRows(g,()=>closeMenu(g));
    expect(audioRows.map((r:any)=>r.label)).toEqual(["SOUND","MASTER","AMBIENCE","EFFECTS","BACK"]);
    expect(audioRows.filter((r:any)=>r.volumeKey)).toHaveLength(3);
    audioRows.at(-1).onDown();
    expect(g.menu).toBe("settings");
    close.onDown();
    expect(g.menu).toBe(null);
    expect(rects.length).toBeGreaterThan(0);
    expect(AUDIO).toBeDefined();
  });
  it("retains two-step reset and prevents a simple Settings back action from erasing progress", () => {
    const g=createEngine(),m=meta();g.menu="settings";g.settingsFrom="pause";
    const rows=createSettingsRows(g,m,()=>closeMenu(g));
    rows.at(-1).onDown();
    expect(g.menu).toBe("pause");
    expect(m.ash).toBe(20);
    g.menu="settings";
    rows[6].onDown();
    expect(g.menu).toBe("reset1");
    closeMenu(g);
    expect(g.menu).toBe("settings");
    expect(m.ash).toBe(20);
  });
});
