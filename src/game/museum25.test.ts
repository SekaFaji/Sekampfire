import { beforeEach,afterEach,describe,it,expect,vi } from "vitest";
import { MUSEUM_COST, LOG_COLLECTION, MUSEUM_X, museumCount, cleanLogCollection,
  discoverLog, drawMuseumLog, drawMuseumHut, drawMuseumPage } from "./museum";
import { createEngine, buildRows, titleActions, update, handleKey } from "./game";
import { loadMeta, saveMeta, captureRunSnapshot } from "./save";

let data:Map<string,string>;
beforeEach(()=>{data=new Map();vi.stubGlobal("localStorage",{
  getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,String(v)),
  removeItem:(k:string)=>data.delete(k)
});});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:48,totalAsh:60,best:3,runs:1,up:{},petEquipped:null,
  museumBuilt:false,collection:cleanLogCollection(null)});
const game=()=>{const g=createEngine();g.ui="run";g.menu="build";g.buildTab=0;
  g.player.wood=5;g.stored=40;g.trees=[];g.pickups=[];return g;};
function canvas(){
  const marks:Array<{x:number,y:number,w:number,h:number,color:string}>=[];
  let color="";const ctx:any={set fillStyle(v:string){color=v;},get fillStyle(){return color;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      marks.push({x,y,w,h,color});
    }};
  return {ctx,marks};
}
describe("permanent museum building",()=>{
  it("builds once with two-tap confirmation and spends only 20 run wood, not Ash",()=>{
    const g=game(),m=meta();const amount=g.player.wood+g.stored;
    const row=buildRows(g,m).at(-1)!;
    expect(row.label).toBe("BUILD LOG MUSEUM");
    expect(row.right).toBe(MUSEUM_COST+" WOOD");
    row.onDown();
    expect(g.buildConfirm).toBe("museum");
    expect(g.player.wood+g.stored).toBe(amount);
    expect(m.museumBuilt).toBe(false);
    buildRows(g,m).at(-1)!.onDown();
    expect(m.museumBuilt).toBe(true);
    expect(g.museumBuilt).toBe(true);
    expect(g.buildConfirm).toBeNull();
    expect(g.player.wood+g.stored).toBe(amount-20);
    expect(m.ash).toBe(48);
    expect(loadMeta().museumBuilt).toBe(true);
    expect(buildRows(g,m).at(-1)!.label).toBe("VISIT LOG MUSEUM");
    buildRows(g,m).at(-1)!.onDown();
    expect(g.menu).toBe("museum");
    expect(g.player.wood+g.stored).toBe(amount-20);
  });
  it("restores permanently built museum after another run, even if run checkpoint is cleared",()=>{
    const m=meta();m.museumBuilt=true;saveMeta(m);
    const restored=loadMeta();expect(restored.museumBuilt).toBe(true);
    const g=createEngine();g.ui="title";
    const actions=titleActions(g,restored);
    expect(actions.some((v:any)=>v.label==="LOG MUSEUM")).toBe(true);
    actions.find((v:any)=>v.label==="START RUN")!.act();
    expect(g.museumBuilt).toBe(true);
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
  });
  it("does not erase historical upgrades or unique collection flags on legacy load",()=>{
    data.set("sekampfire-meta-v1",JSON.stringify({
      ash:21,runs:2,up:{axe:1,dog:1},collection:{twisted:true,eight:true,unknown:true},museumBuilt:true
    }));
    const m=loadMeta();expect(m.ash).toBe(21);
    expect(m.up.axe).toBe(1);expect(m.up.dog).toBe(1);
    expect(m.collection).toEqual({ordinary:false,twisted:true,hand:false,eight:true});
    expect(m.museumBuilt).toBe(true);
    expect(museumCount(m)).toBe(2);
  });
});
describe("real log collection discoveries",()=>{
  it("automatically discovers the Common Ordinary Log on first tree fell",()=>{
    const m=meta();expect(discoverLog(m,()=>1)).toBe("ordinary");
    expect(m.collection.ordinary).toBe(true);expect(museumCount(m)).toBe(1);
    expect(discoverLog(m,()=>1)).toBeNull();
  });
  it("gives provisional rarity rolls without duplicates or modifying wood inventory",()=>{
    const m=meta();discoverLog(m);
    expect(discoverLog(m,()=>0.99)).toBeNull();
    let n=0;expect(discoverLog(m,()=>[0.01,0.1][n++])).toBe("twisted");
    n=0;expect(discoverLog(m,()=>[0.01,0.92][n++])).toBe("hand");
    n=0;expect(discoverLog(m,()=>[0.01,0.999][n++])).toBe("eight");
    expect(museumCount(m)).toBe(4);
    n=0;expect(discoverLog(m,()=>[0.01,0.999][n++])).toBeNull();
  });
  it("collects unique logs when a real tree falls, without altering its ordinary wood",()=>{
    const g=game(),m=meta();g.ui="run";g.time=8;
    g.falling=[{x:990,y:150,wood:3,t:0.54,dir:1,id:2,tier:0,variant:0}];
    const toasts:string[]=[];
    update(g,m,0.04,{end:()=>{},toast:(v:string)=>toasts.push(v)});
    expect(g.falling).toHaveLength(0);
    expect(g.pickups.some((p:any)=>p.x===990&&p.w===3)).toBe(true);
    expect(m.collection.ordinary).toBe(true);
    expect(loadMeta().collection.ordinary).toBe(true);
    expect(toasts.some(x=>x.includes("MUSEUM DISCOVERY"))).toBe(true);
  });
});
describe("actual pixel-art museum and navigation",()=>{
  it("four collectible log designs are visibly different and have finite pixel bounds",()=>{
    const seen = new Set<string>();
    for(const log of LOG_COLLECTION){
      const v=canvas();drawMuseumLog(v.ctx,log.id,60,40);
      expect(v.marks.length).toBeGreaterThan(4);
      expect(v.marks.every(p=>p.w>0&&p.h>0)).toBe(true);
      seen.add(JSON.stringify(v.marks));
    }
    expect(seen.size).toBe(4);
    const hut=canvas();drawMuseumHut(hut.ctx);
    expect(hut.marks.length).toBeGreaterThan(10);
    expect(hut.marks.some(p=>p.x>=MUSEUM_X-15)).toBe(true);
  });
  it("museum page includes a close hitbox and only shows discovered items",()=>{
    const g=createEngine(),m=meta();g.menu="museum";g.zones=[];
    let closes=0;let v=canvas();
    drawMuseumPage(v.ctx,g,m,()=>{closes++});
    expect(g.zones.some((z:any)=>z.x===273&&z.y===11)).toBe(true);
    expect(v.marks.length).toBeGreaterThan(20);
    g.zones[0].onDown();expect(closes).toBe(1);
    m.museumBuilt=true;m.collection.ordinary=true;g.zones=[];
    drawMuseumPage(v.ctx,g,m,()=>{closes++});
    expect(v.marks.some(p=>p.color==="#c29761")).toBe(true);
    handleKey(g,m,"enter",true);
    expect(g.menu).toBeNull();
  });
});
