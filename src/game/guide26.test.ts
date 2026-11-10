import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { GUIDE_LEVELS, GROOTY_X, guideProgress, advanceGuide, drawGrooty, drawGuideShortcut, drawGuideDialog } from "./guide";
import { createEngine, update, titleActions, handleKey, buildRows } from "./game";
import { captureRunSnapshot, loadRunSnapshot } from "./save";

let storage: Map<string,string>;
beforeEach(() => {
  storage = new Map();
  vi.stubGlobal("localStorage", {
    getItem:(key:string)=>storage.get(key)??null,
    setItem:(key:string,value:string)=>storage.set(key,String(value)),
    removeItem:(key:string)=>storage.delete(key)
  });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:9,totalAsh:9,best:1,runs:0,up:{},museumBuilt:false,collection:{}});
function running(){
  const g=createEngine();g.ui="run";g.time=12;g.trees=[];g.pickups=[];g.falling=[];
  return g;
}
const callbacks=()=>({toast:vi.fn(),end:vi.fn()});
function canvas(){
  const rects:any[]=[];
  const ctx:any={fillStyle:"",fillRect(x:number,y:number,w:number,h:number){
    expect([x,y,w,h].every(Number.isFinite)).toBe(true);
    expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
    rects.push({x,y,w,h});
  }};
  return {ctx,rects};
}
describe("Patch #26 run-scoped tutorial",()=>{
  it("has five ordered run missions teaching actual existing interactions",()=>{
    expect(GUIDE_LEVELS.map(level=>level.title)).toEqual([
      "FIRST CAMP","LOG STORAGE","TOOLS OF THE TRADE","A WARMER HOME","THE HOMESTEAD"
    ]);
    const g=running();
    expect(guideProgress(g).next?.label).toBe("CHOP ONE PINE TREE");
    g.guideChops=1;
    expect(guideProgress(g).next?.label).toBe("BUILD THE LEFT FENCE POST");
    g.fenceLeft=true;
    expect(guideProgress(g).next?.label).toBe("BUILD THE RIGHT FENCE POST");
    g.fenceRight=true;
    expect(guideProgress(g).next?.label).toBe("LIGHT THE CAMPFIRE");
    g.everLit=true;
    expect(guideProgress(g).next?.label).toBe("FEED ONE LOG TO THE FIRE");
    g.guideStokes=1;
    expect(guideProgress(g).next?.label).toBe("SURVIVE YOUR FIRST NIGHT");
    g.night=1;
    const report=callbacks();update(g,meta(),0.02,report);
    expect(g.guideLevel).toBe(1);
    expect(guideProgress(g).level?.title).toBe("LOG STORAGE");
  });
  it("does not lose the ten-log objective after wood is spent upgrading the storage",()=>{
    const g=running();g.guideLevel=1;g.builtPile=true;g.stored=10;
    g.fenceLeft=true;g.fenceRight=true;g.campExpansion=1;
    update(g,meta(),0.02,callbacks());
    expect(g.guideStoredTen).toBe(true);
    g.stored=0;g.campUpgrades.pile=1;
    update(g,meta(),0.02,callbacks());
    expect(g.guideLevel).toBe(2);
  });
  it("completes later tiers using real camp and craft levels, then stops at five",()=>{
    const g=running();g.guideLevel=2;g.builtBench=true;
    const notes:string[]=[];
    advanceGuide(g,t=>notes.push(t));expect(g.guideLevel).toBe(2);
    g.crafts.pack=true;advanceGuide(g,t=>notes.push(t));expect(g.guideLevel).toBe(3);
    g.stage=2;g.campUpgrades.hearth=1;advanceGuide(g,t=>notes.push(t));
    expect(g.guideLevel).toBe(4);
    g.stage=6;g.campUpgrades.bench=1;g.campUpgrades.pile=1;
    advanceGuide(g,t=>notes.push(t));expect(g.guideLevel).toBe(5);
    expect(guideProgress(g).level).toBeNull();
    expect(notes.at(-1)).toContain("ALL MISSIONS");
    advanceGuide(g,t=>notes.push(t));expect(notes).toHaveLength(3);
  });
  it("requires finished teaching missions before the last cabin, not only enough wood",()=>{
    const g=running(),m=meta();
    g.stage=5;g.builtBench=true;g.builtPile=true;
    g.fenceLeft=true;g.fenceRight=true;
    g.campUpgrades={hearth:1,bench:1,pile:1};g.player.wood=5;g.stored=70;
    expect(buildRows(g,m)[0].right).toBe("FINISH M1-4");
    expect(buildRows(g,m)[0].enabled).toBe(false);
    g.guideLevel=4;
    expect(buildRows(g,m)[0].enabled).toBe(true);
  });
  it("retains guide state in a v1 checkpoint but resets the level when starting a new run",()=>{
    const g=running();g.guideLevel=3;g.guideChops=4;g.guideStokes=2;g.guideStoredTen=true;
    const snapshot=captureRunSnapshot(g);
    expect(snapshot.version).toBe(1);
    expect(snapshot.state.guideLevel).toBe(3);
    expect(snapshot.state.guideStoredTen).toBe(true);
    const m=meta();const title=createEngine();title.resumeData=null;
    titleActions(title,m).find((action:any)=>action.label==="START RUN")!.act();
    expect(title.guideLevel).toBe(0);
    expect(title.guideChops).toBe(0);
    expect(title.guideStoredTen).toBe(false);
  });
  it("Grooty is interactable near camp, is not chop target and does not appear in title menu",()=>{
    const g=running();g.player.x=GROOTY_X;g.pressE=true;
    const m=meta();update(g,m,0.02,callbacks());
    expect(g.menu).toBe("guide");expect(g.keys.act).toBe(false);
    expect(g.actionLabel).toBe("TALK");
    expect(titleActions(createEngine(),m).map((a:any)=>a.label)).toEqual([
      "START RUN","SHOP","SETTINGS"
    ]);
    handleKey(g,m,"enter",true);expect(g.menu).toBeNull();
  });
  it("draws Grooty, the minimal help shortcut and dialogue as finite pixel shapes",()=>{
    const g=running();const c=canvas();
    drawGrooty(c.ctx,g);expect(c.rects.length).toBeGreaterThan(20);
    const before = c.rects.length;
    drawGuideShortcut(c.ctx,g);
    expect(g.zones.some((z:any)=>z.x===8&&z.y===45&&z.w===17&&z.h===16)).toBe(true);
    // The former 203x25 objective panel must never cover the world.
    expect(c.rects.slice(before).some(r=>r.w>=200&&r.h>=20)).toBe(false);
    g.zones.at(-1).onDown();expect(g.menu).toBe("guide");
    drawGuideDialog(c.ctx,g,()=>{g.menu=null;});
    expect(g.zones.some((z:any)=>z.x===268&&z.y===13)).toBe(true);
    g.zones.at(-1).onDown();expect(g.menu).toBeNull();
  });
});
