import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEngine, buildRows, titleActions, pauseRows, closeMenu } from "./game";
import { loadMeta, saveMeta, captureRunSnapshot, clearRunSnapshot } from "./save";
import {
  LOG_RELICS, MUSEUM_COST, rollLogRelic, normalizeMuseum, museumFound,
  museumHasBuilding, addLogRelic, buildLogMuseum,
} from "./logMuseum";
import { drawRelicIcon, drawLogMuseumWorld, drawLogMuseumMenu } from "./logMuseumArt";

let storage: Map<string,string>;
beforeEach(() => {
  storage=new Map();
  vi.stubGlobal("localStorage", {
    getItem:(key:string)=>storage.get(key)??null,
    setItem:(key:string,value:string)=>storage.set(key,String(value)),
    removeItem:(key:string)=>storage.delete(key)
  });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:25,totalAsh:55,up:{},wonEver:true,runs:1,museum:normalizeMuseum(null)});
const game=()=>{const g=createEngine();g.ui="run";g.buildTab=0;g.player.wood=5;g.stored=20;return g;};

describe("Permanent Log Museum construction",()=>{
  it("stays locked before first completed camp, with no wood spent",()=>{
    const m=meta();m.wonEver=false;
    const g=game(), before=g.player.wood+g.stored;
    const row=buildRows(g,m).at(-1);
    expect(row.label).toBe("LOG MUSEUM");
    expect(row.enabled).toBe(false);
    row.onDown();
    expect(g.player.wood+g.stored).toBe(before);
    expect(museumHasBuilding(m)).toBe(false);
  });
  it("requires the same museum build action twice and pays just once",()=>{
    const g=game(),m=meta(),before=g.player.wood+g.stored;
    expect(MUSEUM_COST).toBe(15);
    let row=buildRows(g,m).at(-1);
    expect(row.right).toBe("15 WOOD");
    row.onDown();
    expect(g.buildConfirm).toBe("museum");
    expect(g.player.wood+g.stored).toBe(before);
    row=buildRows(g,m).at(-1);
    expect(row.right).toBe("CONFIRM?");
    row.onDown();
    expect(g.player.wood).toBe(0);
    expect(g.stored).toBe(10);
    expect(museumHasBuilding(m)).toBe(true);
    expect(loadMeta().museum.built).toBe(true);
    expect(g.menu).toBe("museum");
    expect(buildRows(g,m).at(-1).right).toBe("VIEW");
    buildRows(g,m).at(-1).onDown();
    expect(g.player.wood+g.stored).toBe(before-MUSEUM_COST);
    closeMenu(g);
    expect(g.menu).toBeNull();
  });
  it("does not create a museum with insufficient or negative wood",()=>{
    const g=game(),m=meta();
    g.player.wood=5;g.stored=9;
    expect(buildLogMuseum(g,m)).toBe(false);
    expect(museumHasBuilding(m)).toBe(false);
    g.player.wood=-1;g.stored=999;
    expect(buildLogMuseum(g,m)).toBe(false);
    g.player.wood=1;g.stored=14;
    expect(buildLogMuseum(g,m)).toBe(true);
    expect(buildLogMuseum(g,m)).toBe(false);
  });
  it("keeps permanent collection through multiple meta loads, but not in v1 run saves",()=>{
    const g=game(),m=meta();expect(buildLogMuseum(g,m)).toBe(true);
    expect(addLogRelic(m,"ordinary")).toBe(true);
    expect(addLogRelic(m,"ordinary")).toBe(true);
    expect(addLogRelic(m,"hand")).toBe(true);
    saveMeta(m);
    const loaded=loadMeta();
    expect(loaded.museum).toEqual({built:true,found:{ordinary:2,twisted:0,hand:1,eight:0}});
    expect(museumFound(loaded.museum)).toBe(2);
    expect(loaded.ash).toBe(25);
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state).not.toHaveProperty("museum");
    clearRunSnapshot();
    expect(loadMeta().museum.found.hand).toBe(1);
  });
  it("sanitizes corrupted collection and old save data without changing ownership",()=>{
    storage.set("sekampfire-meta-v1",JSON.stringify({ash:7,up:{},wonEver:true}));
    expect(loadMeta().museum).toEqual(normalizeMuseum(null));
    storage.set("sekampfire-meta-v1",JSON.stringify({
      ash:9,up:{},wonEver:true,museum:{built:true,found:{
        ordinary:-5,twisted:2.9,hand:Infinity,eight:999999999,other:999
      }}
    }));
    const m=loadMeta();
    expect(m.museum).toEqual({built:true,found:{ordinary:0,twisted:2,hand:0,eight:1000000}});
    expect(museumFound(m.museum)).toBe(2);
  });
});

describe("Felled-tree collectible drop and rarity",()=>{
  it("does not roll a museum collectible without an eligible event",()=>{
    expect(rollLogRelic(()=>0.5)).toBeNull();
    const m=meta();
    expect(addLogRelic(m,"ordinary")).toBe(false);
    expect(museumFound(m.museum)).toBe(0);
  });
  it("rolls each log rarity with a distinct threshold",()=>{
    for (const [chance,expected] of [
      [0.0,"ordinary"],[0.7399,"ordinary"],[0.74,"twisted"],
      [0.939,"twisted"],[0.94,"hand"],[0.989,"hand"],
      [0.99,"eight"],[0.999,"eight"]
    ] as const) {
      let i=0;const values=[0.05,chance];
      expect(rollLogRelic(()=>values[i++])).toBe(expected);
    }
    expect(LOG_RELICS.map(x=>x.rarity)).toEqual(["COMMON","UNCOMMON","RARE","LEGENDARY"]);
  });
  it("never burns duplicate collectible logs or produces Ash merely from finding one",()=>{
    const g=game(),m=meta();
    expect(buildLogMuseum(g,m)).toBe(true);
    const startWood=g.player.wood+g.stored;
    const startAsh=m.ash;
    expect(addLogRelic(m,"twisted")).toBe(true);
    expect(addLogRelic(m,"twisted")).toBe(true);
    expect(m.museum.found.twisted).toBe(2);
    expect(g.player.wood+g.stored).toBe(startWood);
    expect(m.ash).toBe(startAsh);
  });
});

function painter(){
  const marks:Array<{x:number,y:number,w:number,h:number,color:string}>=[];
  let color="";
  const ctx:any={
    set fillStyle(c:string){color=c;},get fillStyle(){return color;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      marks.push({x,y,w,h,color});
    }
  };
  return {ctx,marks};
}
describe("Museum rendering and menus",()=>{
  it("all four relics have genuinely different silhouettes",()=>{
    const shapes=[];
    for(const r of LOG_RELICS){
      const a=painter();drawRelicIcon(a.ctx,r.id,0,0);
      expect(a.marks.length).toBeGreaterThan(5);
      shapes.push(JSON.stringify(a.marks));
    }
    expect(new Set(shapes).size).toBe(4);
  });
  it("draws world museum only for permanent owners, and canvas viewer has a close hit area",()=>{
    const m=meta(),v=painter();
    drawLogMuseumWorld(v.ctx,m);
    expect(v.marks).toHaveLength(0);
    const g=game();g.zones=[];
    let closed=false;
    drawLogMuseumMenu(v.ctx,g,m,()=>{closed=true;});
    expect(g.zones.some((z:any)=>z.x===276&&z.w===19)).toBe(true);
    g.zones[0].onDown();expect(closed).toBe(true);
    expect(buildLogMuseum(g,m)).toBe(true);
    const world=painter();drawLogMuseumWorld(world.ctx,m);
    expect(world.marks.length).toBeGreaterThan(10);
  });
  it("museum can be revisited from both title and pause without replacing saved run",()=>{
    const g=game(),m=meta();
    expect(buildLogMuseum(g,m)).toBe(true);
    saveMeta(m);
    g.ui="title";g.resumeData=null;
    titleActions(g,m).find((a:any)=>a.label==="MUSEUM").act();
    expect(g.menu).toBe("museum");
    closeMenu(g);
    g.ui="run";
    pauseRows(g,m).find((r:any)=>r.label==="LOG MUSEUM").onDown();
    expect(g.menu).toBe("museum");
  });
});
