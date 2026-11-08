import { describe, expect, it, vi } from "vitest";
import { createEngine, drawScreen, titleActions, handleKey } from "./game";
import { drawEndlessNightPreview, drawLockedEndlessButton } from "./menuScreens";
import { drawText } from "./font";
import { LONG_NIGHT_LEN, STAGES } from "./config";

function canvas() {
  const rects: Array<{x:number;y:number;w:number;h:number}> = [];
  const ctx: any = {
    fillStyle: "", globalAlpha: 1, globalCompositeOperation: "source-over",
    fillRect(x:number,y:number,w:number,h:number) {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      rects.push({x,y,w,h});
    },
    save: vi.fn(), restore: vi.fn(), translate: vi.fn(), scale: vi.fn(),
    createRadialGradient: () => ({addColorStop: vi.fn()})
  };
  return {ctx, rects};
}
function at(g:any, x:number,y:number) {
  return [...g.zones].reverse().find((z:any) => x>=z.x && x<z.x+z.w && y>=z.y && y<z.y+z.h);
}
describe("Patch #28 locked Endless Night preview", () => {
  it("places a tappable locked preview directly above How to Play, away from title actions", () => {
    const g=createEngine();g.ui="title";g.zones=[];
    const m={ash:42,best:5,up:{},museumBuilt:true,collection:{ordinary:true}};
    const before=JSON.stringify(m),view=canvas();
    drawScreen(view.ctx,g,m);
    const preview=at(g,250,94),help=at(g,250,115),central=at(g,160,85);
    expect(preview).toMatchObject({x:236,y:85,w:74,h:18});
    expect(help).toMatchObject({x:236,y:107,w:74,h:18});
    expect(central).toMatchObject({x:102,w:116,h:14});
    expect(titleActions(g,m).map((a:any)=>a.label)).toEqual(["START RUN","SHOP","SETTINGS"]);
    expect(at(g,245,104)).toBeUndefined();
    preview.onDown();
    expect(g.menu).toBe("endlessNightInfo");
    expect(g.ui).toBe("title");
    expect(JSON.stringify(m)).toBe(before);
  });
  it("renders the locked title button once, keeping the lock separate from the full label", () => {
    const recorder = () => {
      const marks: Array<{x:number;y:number;w:number;h:number;color:string}> = [];
      let color="";
      const ctx:any = {
        set fillStyle(value:string){color=value;},
        get fillStyle(){return color;},
        fillRect(x:number,y:number,w:number,h:number){marks.push({x,y,w,h,color});}
      };
      return {ctx,marks};
    };
    const g=createEngine();g.zones=[];
    const v=recorder();
    drawLockedEndlessButton(v.ctx,g,()=>{g.menu="endlessNightInfo";});
    const label=v.marks.filter(m=>m.color==="#c6ccd2");
    const lock=v.marks.filter(m=>m.color==="#8393a5");
    const reference=recorder();
    drawText(reference.ctx,"ENDLESS NIGHT",254,92,"#c6ccd2");
    // Identical glyph pixels: no second label or overpainted letters.
    expect(label).toEqual(reference.marks);
    expect(Math.min(...label.map(m=>m.x))).toBeGreaterThanOrEqual(254);
    expect(Math.max(...label.map(m=>m.x))).toBeLessThan(309);
    expect(Math.max(...lock.map(m=>m.x+m.w))).toBeLessThan(254);
    expect(g.zones).toHaveLength(1);
    expect(g.zones[0]).toMatchObject({x:236,y:85,w:74,h:18});
    g.zones[0].onDown();
    expect(g.menu).toBe("endlessNightInfo");
  });
  it("explains the unavailable mode and closes via its Back button or X", () => {
    const g=createEngine();g.ui="title";g.menu="endlessNightInfo";g.zones=[];
    const view=canvas(),close=vi.fn(()=>{g.menu=null;});
    drawEndlessNightPreview(view.ctx,g,close);
    expect(view.rects.length).toBeGreaterThan(25);
    expect(at(g,150,153)).toMatchObject({x:103,y:145,w:114,h:16});
    expect(at(g,286,19)).toMatchObject({x:278,y:13,w:17,h:16});
    at(g,150,153).onDown();
    expect(g.menu).toBeNull();
    g.menu="endlessNightInfo";g.zones=[];
    drawEndlessNightPreview(view.ctx,g,close);
    at(g,286,19).onDown();
    expect(g.menu).toBeNull();
    expect(close).toHaveBeenCalledTimes(2);
  });
  it("closes with Enter or Escape and preserves the existing campaign Long Night", () => {
    const g=createEngine();g.ui="title";g.menu="endlessNightInfo";
    const m={ash:2,up:{},best:1};
    handleKey(g,m,"enter",true);
    expect(g.menu).toBeNull();
    g.menu="endlessNightInfo";
    handleKey(g,m,"escape",true);
    expect(g.menu).toBeNull();
    expect(g.endlessMode).toBe(false);
    expect(LONG_NIGHT_LEN).toBe(46);
    expect(STAGES[5].name).toBe("Cabin and Hearth");
  });
  it("keeps the How to Play entry working, including with a resumable run", () => {
    const g=createEngine();g.ui="title";g.zones=[];
    g.resumeData={time:9};
    const v=canvas();
    drawScreen(v.ctx,g,{ash:6,best:2,up:{}});
    expect(titleActions(g,{ash:6,best:2,up:{}}).map((a:any)=>a.label)).toEqual([
      "CONTINUE RUN","NEW RUN","SHOP","SETTINGS"
    ]);
    at(g,250,115).onDown();
    expect(g.menu).toBe("help");
    expect(g.helpPage).toBe(0);
  });
});
