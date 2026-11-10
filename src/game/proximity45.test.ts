import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {CX,BENCH_X,PILE_X} from "./config";
import {createEngine,performStationAction,closeMenu,handlePointer,handleKey,drawRunChrome,update} from "./game";
import {hudInventoryReadout} from "./hud";
import {occupiedInventorySlots} from "./inventory";
import {stationCost,stationLevel} from "./campProgress";
import {guideTarget} from "./guidance";
import {captureRunSnapshot} from "./save";
import {
  nearbyStation, stationBubbleRects, stationBubbleCenter, drawStationBubbles,
  weightHudValues, BACKPACK_BUTTON45
} from "./proximity45";

let store:Map<string,string>;
beforeEach(()=>{
  store=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(key:string)=>store.get(key)??null,
    setItem:(key:string,value:string)=>store.set(key,String(value)),
    removeItem:(key:string)=>store.delete(key)
  });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:0,up:{} as Record<string,number>,guideFx:true,museumBuilt:false});
function run(){
  const g=createEngine();g.ui="run";g.over=false;g.menu=null;g.keys={};
  g.fenceLeft=true;g.fenceRight=true;
  g.trees=[];g.pickups=[];g.falling=[];
  return g;
}
function canvas(){
  const rects:any[]=[];
  const ctx:any={fillStyle:"",
    fillRect:(x:number,y:number,w:number,h:number)=>{
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      rects.push({x,y,w,h});
    }
  };
  return {ctx,rects};
}
describe("Patch #45: readable weight HUD and proximity-first camp controls",()=>{
  it("reports kg instead of inventory occupied slots with unchanged 5/13/21 limits",()=>{
    const g=run(),m=meta();
    expect(weightHudValues(g,m)).toEqual({weight:0,limit:5,label:"0/5KG"});
    expect(hudInventoryReadout(g,m)).toBe("WEIGHT 0/5KG");
    g.player.wood=3;
    expect(occupiedInventorySlots(g)).toBe(1);
    expect(hudInventoryReadout(g,m)).toBe("WEIGHT 3/5KG");
    g.crafts.pack=true;
    expect(weightHudValues(g,m).limit).toBe(13);
    m.up.pack=1;
    expect(weightHudValues(g,m)).toEqual({weight:3,limit:21,label:"3/21KG"});
  });
  it("shows nearby completed stations automatically and never creates a remote station",()=>{
    const g=run();g.player.x=CX;
    expect(nearbyStation(g)).toBe("hearth");
    g.player.x=BENCH_X;
    expect(nearbyStation(g)).toBeNull(); // unfinished bench
    g.builtBench=true;
    expect(nearbyStation(g)).toBe("bench");
    g.player.x=PILE_X;g.builtPile=true;
    expect(nearbyStation(g)).toBe("pile");
    g.menu="pause";expect(nearbyStation(g)).toBeNull();
    g.menu=null;g.ui="title";expect(nearbyStation(g)).toBeNull();
    g.ui="run";g.player.x=CX+150;expect(nearbyStation(g)).toBeNull();
  });
  it("draws left Log and right Upgrade over the fire, with a third Workbench Plans button",()=>{
    const g=run(),m=meta(),picture=canvas();
    g.player.x=CX;g.camX=CX-160;g.zones=[];
    const fire=stationBubbleRects(g,"hearth");
    expect(fire.plans).toBeNull();
    expect(fire.primary!.x+fire.primary!.w).toBeLessThan(fire.upgrade!.x);
    const clicked:string[]=[];
    drawStationBubbles(picture.ctx,g,"hearth",(id,action)=>clicked.push(id+":"+action));
    expect(g.zones).toHaveLength(2);
    g.zones[0].onDown();g.zones[1].onDown();
    expect(clicked).toEqual(["hearth:primary","hearth:upgrade"]);
    g.builtBench=true;g.player.x=BENCH_X;g.camX=BENCH_X-160;g.zones=[];
    const bench=stationBubbleRects(g,"bench");
    expect(bench.plans).not.toBeNull();
    drawStationBubbles(picture.ctx,g,"bench",(id,action)=>clicked.push(id+":"+action));
    expect(g.zones).toHaveLength(3);
    g.zones[1].onDown();expect(clicked[2]).toBe("bench:plans");
    expect(stationBubbleCenter(g,"bench","plans")?.y).toBe(92.5);
    expect(picture.rects.length).toBeGreaterThan(90);
    expect(m.up).toBeDefined();
  });
  it("ACT feeds the fire immediately instead of opening the old station overlay",()=>{
    const g=run(),m=meta();
    g.player.x=CX;g.fireLit=false;g.firestarter=1;
    handleKey(g,m,"e",true);
    update(g,m,0.02,{toast:vi.fn(),end:vi.fn()});
    expect(g.fireLit).toBe(true);
    expect(g.menu).toBeNull();
    expect(g.stationId).toBe("hearth");
    g.player.wood=2;
    handleKey(g,m,"e",true);
    update(g,m,0.02,{toast:vi.fn(),end:vi.fn()});
    expect(g.player.wood).toBe(1);
    expect(g.guideStokes).toBe(1);
  });
  it("arrow-up retains actual two-tap upgrade costs, rewards and physical reach checks",()=>{
    const g=run(),m=meta();
    g.player.x=CX;g.fireLit=true;g.stored=20;
    const cost=stationCost(g,"hearth");
    expect(performStationAction(g,m,"hearth","upgrade")).toBe(true);
    expect(g.buildConfirm).toBe("hearth");
    expect(stationLevel(g,"hearth")).toBe(0);
    expect(performStationAction(g,m,"hearth","upgrade")).toBe(true);
    expect(stationLevel(g,"hearth")).toBe(1);
    expect(g.stored).toBe(20-cost);
    expect(g.ashEarned).toBe(2);
    expect(g.menu).toBeNull();
    g.player.x=CX+150;
    expect(performStationAction(g,m,"hearth","upgrade")).toBe(false);
    expect(g.stored).toBe(20-cost);
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.campUpgrades.hearth).toBe(1);
    expect("buildConfirm" in snap.state).toBe(false);
  });
  it("the left button keeps storage and Workbench real controls and back returns to the world",()=>{
    const g=run(),m=meta();
    g.builtPile=true;g.player.x=PILE_X;g.player.wood=5;
    expect(performStationAction(g,m,"pile","primary")).toBe(true);
    expect(g.stored).toBe(5);
    expect(g.player.wood).toBe(0);
    expect(performStationAction(g,m,"pile","primary")).toBe(true);
    expect(g.player.wood).toBe(5);
    expect(g.stored).toBe(0);
    g.builtBench=true;g.player.x=BENCH_X;
    expect(performStationAction(g,m,"bench","primary")).toBe(true);
    expect(g.menu).toBe("bench");expect(g.stationFrom).toBe(false);
    closeMenu(g);expect(g.menu).toBeNull();
    expect(performStationAction(g,m,"bench","plans")).toBe(true);
    expect(g.menu).toBe("build");expect(g.stationFrom).toBe(false);
    closeMenu(g);expect(g.menu).toBeNull();
  });
  it("a real bottom-right bag button wins touch priority without breaking movement zones",()=>{
    const g=run(),m=meta(),p=canvas();
    g.zones=[];drawRunChrome(p.ctx,g);
    const r=BACKPACK_BUTTON45;
    const actual=g.zones.find((z:any)=>z.x===r.x && z.y===r.y && z.w===r.w && z.h===r.h);
    expect(actual).toBeDefined();
    handlePointer(g,"down",9,r.x+10,r.y+10);
    expect(g.menu).toBe("inventory");
    expect(g.inventoryTab).toBe(0);
    expect(g.pright).toBe(false);
    handlePointer(g,"up",9,r.x+10,r.y+10);
    closeMenu(g);expect(g.menu).toBeNull();
    handlePointer(g,"down",10,312,92);
    expect(g.pright).toBe(true);
    handlePointer(g,"up",10,312,92);
    expect(g.pright).toBe(false);
    handleKey(g,m,"i",true);
    expect(g.menu).toBe("inventory");
  });
  it("Grooty fireflies point at actual screen buttons when nearby, not obsolete station modal",()=>{
    const g=run(),m=meta();
    g.guideLevel=1;g.guideStoredTen=true;g.campExpansion=1;
    g.builtPile=true;g.stored=20;g.player.x=PILE_X;g.camX=PILE_X-160;
    const target=guideTarget(g,m);
    expect(target?.space).toBe("screen");
    const center=stationBubbleCenter(g,"pile","upgrade");
    expect(target?.x).toBe(center?.x);
    expect(target?.y).toBe(center?.y);
    g.menu="pause";expect(guideTarget(g,m)).toBeNull();
  });
});
