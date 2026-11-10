import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {CX,BENCH_X,PILE_X} from "./config";
import {createEngine,update,handleKey,closeMenu,performStationAction} from "./game";
import {drawCampHUD,ASH_PANEL_RECT,HUD_RECTS} from "./hud";
import {guideTarget} from "./guidance";
import {stationCost,stationLevel} from "./campProgress";
import {captureRunSnapshot} from "./save";
import {
  nearbyStation,selectedStation,selectStation,dismissStationSelection,
  stationBubbleRects,stationBubbleCenter,drawStationBubbles
} from "./proximity45";

let store:Map<string,string>;
beforeEach(()=>{
  store=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(k:string)=>store.get(k)??null,
    setItem:(k:string,v:string)=>store.set(k,String(v)),
    removeItem:(k:string)=>store.delete(k)
  });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:0,up:{} as Record<string,number>,guideFx:true,museumBuilt:false});
function run(){
  const g=createEngine();g.ui="run";g.menu=null;g.keys={};
  g.over=false;g.player.x=CX;g.trees=[];g.pickups=[];g.falling=[];
  g.fenceLeft=true;g.fenceRight=true;
  return g;
}
const cb=()=>({toast:vi.fn(),end:vi.fn()});
function press(g:any,m:any){
  handleKey(g,m,"e",true);
  update(g,m,.02,cb());
}
function canvas(){
  let fill="";
  const pixels:{x:number;y:number;w:number;h:number;fill:string}[]=[];
  const ctx:any={
    get fillStyle(){return fill;},
    set fillStyle(v:string){fill=v;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
      pixels.push({x,y,w,h,fill});
    }
  };
  return {ctx,pixels};
}
describe("Patch #46: selected, floating camp buttons and stacked Ash",()=>{
  it("does not display or activate buttons just because the player approaches a fire",()=>{
    const g=run(),m=meta(),view=canvas();
    g.firestarter=1;g.fireLit=false;g.animT=0;g.zones=[];
    expect(nearbyStation(g)).toBe("hearth");
    expect(selectedStation(g)).toBeNull();
    drawStationBubbles(view.ctx,g,nearbyStation(g),()=>{throw Error("not selected");});
    expect(g.zones).toHaveLength(0);
    expect(view.pixels).toHaveLength(0);
    expect(performStationAction(g,m,"hearth","primary")).toBe(false);
    expect(g.fireLit).toBe(false);
  });
  it("first ACT only selects, second ACT lights and later ACT feeds the fire",()=>{
    const g=run(),m=meta();
    g.firestarter=1;g.fireLit=false;g.fuel=0;g.player.wood=1;
    press(g,m);
    expect(g.fireLit).toBe(false);
    expect(selectedStation(g)).toBe("hearth");
    expect(g.firestarter).toBe(1);
    expect(g.menu).toBeNull();
    expect(g.actionLabel).toBe("LIGHT");
    press(g,m);
    expect(g.fireLit).toBe(true);
    expect(g.firestarter).toBe(0);
    expect(g.actionLabel).toBe("FEED");
    expect(selectedStation(g)).toBe("hearth");
    g.player.wood=2;press(g,m);
    expect(g.player.wood).toBe(1);
    expect(g.guideStokes).toBe(1);
  });
  it("a second ACT opens true Workbench crafting; closing does not reopen circles",()=>{
    const g=run(),m=meta();
    g.builtBench=true;g.player.x=BENCH_X;
    press(g,m);
    expect(g.menu).toBeNull();
    expect(selectedStation(g)).toBe("bench");
    expect(g.actionLabel).toBe("CRAFT");
    press(g,m);
    expect(g.menu).toBe("bench");
    expect(g.selectedStation).toBeNull();
    closeMenu(g);
    expect(g.menu).toBeNull();
    expect(selectedStation(g)).toBeNull();
    press(g,m);
    expect(selectedStation(g)).toBe("bench");
  });
  it("up-arrow circles use the existing two-press upgrade rule without reopening a modal",()=>{
    const g=run(),m=meta();
    g.stored=18;g.player.x=CX;g.fireLit=true;
    expect(selectStation(g,"hearth")).toBe(true);
    const before=g.stored,cost=stationCost(g,"hearth");
    expect(performStationAction(g,m,"hearth","upgrade")).toBe(true);
    expect(g.buildConfirm).toBe("hearth");
    expect(g.stored).toBe(before);
    expect(stationLevel(g,"hearth")).toBe(0);
    expect(performStationAction(g,m,"hearth","upgrade")).toBe(true);
    expect(stationLevel(g,"hearth")).toBe(1);
    expect(g.stored).toBe(before-cost);
    expect(g.menu).toBeNull();
    expect(selectedStation(g)).toBe("hearth");
  });
  it("leaving a structure clears selection and pending upgrade; old saves stay v1",()=>{
    const g=run(),m=meta();
    g.stored=20;selectStation(g,"hearth");
    performStationAction(g,m,"hearth","upgrade");
    expect(g.buildConfirm).toBe("hearth");
    let snapshot=captureRunSnapshot(g);
    expect(snapshot.version).toBe(1);
    expect("selectedStation" in snapshot.state).toBe(false);
    expect("buildConfirm" in snapshot.state).toBe(false);
    g.player.x=CX+150;
    update(g,m,.02,cb());
    expect(g.selectedStation).toBeNull();
    expect(g.buildConfirm).toBeNull();
    expect(performStationAction(g,m,"hearth","upgrade")).toBe(false);
    snapshot=captureRunSnapshot(g);
    expect(snapshot.version).toBe(1);
  });
  it("a detailed/paused menu hides and dismisses station selection",()=>{
    const g=run();
    selectStation(g,"hearth");
    g.menu="pause";
    expect(selectedStation(g)).toBeNull();
    closeMenu(g);
    expect(g.selectedStation).toBeNull();
    g.menu=null;
    selectStation(g,"hearth");
    dismissStationSelection(g);
    expect(selectedStation(g)).toBeNull();
  });
  it("circles remain translucent, truly rounded and bob up/down with aligned touch zones",()=>{
    const g=run(),p=canvas(),clicked:string[]=[];
    g.camX=CX-160;
    selectStation(g,"hearth");
    g.animT=0;
    const before=stationBubbleRects(g,"hearth");
    expect(before.primary).not.toBeNull();
    g.zones=[];
    drawStationBubbles(p.ctx,g,"hearth",(station,action)=>clicked.push(station+":"+action));
    expect(g.zones).toHaveLength(2);
    expect(p.pixels.filter(q=>q.fill==="rgba(17,36,44,0.58)").length).toBeGreaterThan(35);
    // Circles use scanline widths, not rectangular 38x38 fill blocks.
    expect(p.pixels.some(q=>q.w===38&&q.h===38&&q.fill==="rgba(17,36,44,0.58)")).toBe(false);
    expect(g.zones[0]).toMatchObject(before.primary!);
    g.zones[0].onDown();
    expect(clicked).toEqual(["hearth:primary"]);
    g.animT=1;
    const after=stationBubbleRects(g,"hearth");
    expect(after.primary?.x).toBe(before.primary?.x);
    expect(after.primary?.y).not.toBe(before.primary?.y);
    const center=stationBubbleCenter(g,"hearth","primary");
    expect(center).toEqual({x:after.primary!.x+19,y:after.primary!.y+19});
    g.zones=[];
    drawStationBubbles(p.ctx,g,"hearth",()=>{});
    expect(g.zones[0]).toMatchObject(after.primary!);
  });
  it("Grooty highlights a world structure first and the matching bobbing icon only after ACT",()=>{
    const g=run(),m=meta();
    g.builtPile=true;g.player.x=PILE_X;g.camX=PILE_X-160;
    g.guideLevel=1;g.guideStoredTen=true;g.campExpansion=1;
    g.stored=20;g.animT=0.8;
    expect(guideTarget(g,m)).toMatchObject({space:"world",x:PILE_X});
    selectStation(g,"pile");
    const target=guideTarget(g,m);
    expect(target).toMatchObject({space:"screen"});
    expect({x:target?.x,y:target?.y}).toEqual(stationBubbleCenter(g,"pile","upgrade"));
  });
  it("draws a dedicated Ash plaque aligned directly below Menu, not Weight",()=>{
    const g=run(),m=meta(),v=canvas();
    g.ashEarned=1276;
    drawCampHUD(v.ctx,g,m);
    expect(ASH_PANEL_RECT).toEqual({x:284,y:40,w:32,h:14});
    // MENU x=284..316 and y=21..37, so this has the same left/right edges.
    expect(ASH_PANEL_RECT.y).toBeGreaterThan(37);
    expect(ASH_PANEL_RECT.x+ASH_PANEL_RECT.w).toBe(316);
    expect(v.pixels.some(p=>p.x===ASH_PANEL_RECT.x&&p.y===ASH_PANEL_RECT.y
      &&p.w===ASH_PANEL_RECT.w&&p.h===ASH_PANEL_RECT.h)).toBe(true);
    expect(v.pixels.some(p=>p.x===HUD_RECTS.resources.x&&p.y===43&&p.w===38&&p.h===11)).toBe(false);
    expect(v.pixels.every(p=>p.x>=0&&p.x+p.w<=320&&p.y>=0&&p.y+p.h<=180)).toBe(true);
  });
});
