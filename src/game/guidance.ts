import { W, WORLD_W, CX, BENCH_X, PILE_X, SITE_COST, STAGES, CRAFTS } from "./config";
import { WEST_POST_X, EAST_POST_X, EXPANSION_MARKER_X, EXPANSION_COST } from "./campBoundary";
import { guideProgress } from "./guide";
import { SCOUT_GROVE_X } from "./campaign43";
import { stationCost, stationLevel } from "./campProgress";
import { stationCraftCost } from "./campProgress";
import { clamp } from "./math";
import { STATION_ACTIONS } from "./stationPopup";

export type FireflyTarget = {
  space: "world" | "screen" | "menu";
  x: number;
  y: number;
  goal: string;
  menu?: "build" | "bench" | "station";
  tab?: number;
  row?: number;
};

/** Resolve exactly ONE next action from saved gameplay state. Markers never
 * change objectives, spend wood or insert hit zones. The target is recomputed
 * when the player builds, crafts, collects or switches menu tabs. */
export function guideTarget(g: any, meta: any): FireflyTarget | null {
  if (g.ui !== "run" || g.over || meta?.guideFx === false) return null;
  const next = guideProgress(g).next;
  if (!next) return null;
  const goal = next.id;
  const world = (x:number,y=114):FireflyTarget => ({space:"world",x,y,goal});
  const ui = (menu: "build"|"bench"|"station",tab:number,row:number):FireflyTarget =>
    ({space:"menu",x:0,y:0,menu,tab,row,goal});
  const resources = (treesOnly=false):FireflyTarget|null => {
    const p = g.player;
    const drops = (g.pickups||[]).filter((d:any)=>d.w>0 && Number.isFinite(d.x));
    if (!treesOnly && drops.length) {
      const nearest = drops.reduce((best:any,v:any)=>
        Math.abs(v.x-p.x)<Math.abs(best.x-p.x)?v:best);
      return world(nearest.x,Math.min(122,(nearest.y||151)-18));
    }
    const trees = (g.trees||[]).filter((t:any)=>Number.isFinite(t.x));
    if (!trees.length) return null;
    const tree = trees.reduce((best:any,v:any)=>
      Math.abs(v.x-p.x)<Math.abs(best.x-p.x)?v:best);
    return world(tree.x,Math.max(80,(tree.y||150)-43));
  };
  const wood = Number(g.player?.wood)||0;
  const stock = wood + (Number(g.stored)||0);
  const missingWood = (cost:number) => stock < cost;
  const build = (_tab:number,row:number):FireflyTarget => {
    if(g.menu==="build") return ui("build",0,row);
    if(g.menu==="station" && g.stationId==="bench")return ui("station",0,2);
    // Camp plans may be accessed ONLY from the finished physical Workbench.
    return world(BENCH_X,116);
  };
  const craft = ():FireflyTarget => {
    if (g.menu==="bench") return ui("bench",0,0);
    if (g.menu==="station"&&g.stationId==="bench")return ui("station",0,0);
    return world(BENCH_X,116);
  };
  const improvement = (station:"hearth"|"bench"|"pile"):FireflyTarget|null => {
    if (missingWood(stationCost(g,station))) return resources();
    if(g.menu==="station"&&g.stationId===station)return ui("station",0,1);
    return world(station==="hearth"?CX:station==="bench"?BENCH_X:PILE_X,116);
  };
  // Keep a live modal free of glow unless it contains the next actual step.
  // This prevents false guides over Settings, Grooty or the Museum.
  const target = (():FireflyTarget|null => {
    switch(goal) {
      case "chop": return resources(true);
      case "left-post": return wood<1?resources():world(WEST_POST_X);
      case "right-post": return wood<1?resources():world(EAST_POST_X);
      case "light-fire": return world(CX,116);
      case "feed-fire": return stock<1?resources():world(CX,116);
      // Scouting is a world mission, not an instruction to idle at the fire.
      // During daylight Grooty explains to prepare for night; no false marker.
      case "scout-grove": return g.isNight?world(SCOUT_GROVE_X,112):null;
      case "return-home": return world(CX,116);
      case "survive-night": return world(CX,116);
      case "build-storage":
        return !g.builtPile && g.pileLogs<SITE_COST && wood<1
          ? resources():world(PILE_X,112);
      case "store-ten": return wood<1?resources():world(PILE_X,112);
      case "expand": return missingWood(EXPANSION_COST)?resources():world(EXPANSION_MARKER_X,111);
      case "upgrade-storage": return improvement("pile");
      case "build-workbench":
        return !g.builtBench && g.benchLogs<SITE_COST && wood<1
          ? resources():world(BENCH_X,112);
      case "craft-pack": {
        const pack = CRAFTS.find(c=>c.id==="pack");
        if (pack && missingWood(stationCraftCost(g,pack))) return resources();
        return craft();
      }
      case "build-shelter":
      case "build-cabin":
      case "finish-cabin": {
        const stage = STAGES[g.stage];
        if (stage && missingWood(Math.round(stage.cost*(meta?.up?.blue?0.8:1)))) return resources();
        return build(0,0);
      }
      case "upgrade-fireplace": return improvement("hearth");
      case "upgrade-all": {
        const need = (["hearth","bench","pile"] as const).find(id=>stationLevel(g,id)<1);
        return need?improvement(need):null;
      }
      default: return null;
    }
  })();
  if (!target) return null;
  if (g.menu && g.menu!==target.menu) return null;
  return target;
}

/** Locate fireflies over the REAL local station buttons or next plans row.
 * Every marker represents a working interaction, not the removed Pause Build. */
export function guideMenuPosition(g:any,target:FireflyTarget):{x:number;y:number}|null {
  if (target.space!=="menu" || g.menu!==target.menu || !g.menuRect) return null;
  const r=g.menuRect;
  if(target.menu==="station"){
    const button=(target.row===1?STATION_ACTIONS.upgrade
      :target.row===2?STATION_ACTIONS.plans:STATION_ACTIONS.access);
    return {x:button.x+button.w/2,y:button.y+button.h/2};
  }
  if(target.menu==="build") return {x:r.x+11,y:r.y+16+(target.row||0)*15+3};
  if(g.craftTab!==target.tab){
    return {x:r.x+7+(target.tab||0)*129+62,y:r.y+10};
  }
  return {x:r.x+11,y:r.y+34+(target.row||0)*15-5};
}

function cluster(ctx:any,x:number,y:number,t:number){
  const shift=Math.sin(t*2.6)*2;
  const yy=Math.round(y+shift);
  // Four small live lights, grounded in original 320x180 pixels, not assets.
  const sparks=[
    [-9,-2,"#7dc88d"],[-3,-7,"#e4e887"],[6,-4,"#cbe86a"],[10,1,"#9ddc89"]
  ] as const;
  for(let i=0;i<sparks.length;i++){
    const [dx,dy,color]=sparks[i],j=Math.sin(t*1.4+i*2.1)*2;
    const sx=Math.round(x+dx+j),sy=Math.round(yy+dy+Math.cos(t*2+i)*1.4);
    ctx.fillStyle="rgba(216,244,130,0.15)";
    ctx.fillRect(sx-2,sy-2,5,5);
    ctx.fillStyle=color;
    ctx.fillRect(sx,sy,2,2);
  }
  // Little downward pointer underneath the fireflies; gently floats as
  // a group. Brown outline keeps it legible over snow and bright sky.
  ctx.fillStyle="rgba(22,45,33,0.84)";
  ctx.fillRect(Math.round(x)-3,yy+2,7,2);
  ctx.fillStyle="#d7e783";
  ctx.fillRect(Math.round(x)-2,yy+2,5,1);
  ctx.fillRect(Math.round(x)-1,yy+4,3,1);
  ctx.fillRect(Math.round(x),yy+5,1,2);
}
export function drawWorldFireflies(ctx:any,g:any,target:FireflyTarget|null,camX:number):void {
  if (!target || target.space!=="world") return;
  if (target.x<camX-16 || target.x>camX+W+16) return;
  cluster(ctx,target.x,target.y,Number(g.animT)||0);
}
/** One minimap marker for far-away destinations, plus a small edge cue.
 * Doesn't replace or duplicate existing move-left/right controls. */
export function drawOffscreenGuide(ctx:any,g:any,target:FireflyTarget|null,camX:number):void {
  if (!target || target.space!=="world" || (target.x>=camX && target.x<=camX+W)) return;
  const x=clamp(Math.round(6+target.x/WORLD_W*(W-12)),6,W-6);
  ctx.fillStyle="#cde66a";
  ctx.fillRect(x,4,3,3);
  ctx.fillStyle="#547348";
  ctx.fillRect(x+1,7,1,2);
  const side=target.x<camX?34:286;
  cluster(ctx,side,95,Number(g.animT)||0);
}
export function drawScreenFireflies(ctx:any,g:any,target:FireflyTarget|null):void {
  if (!target) return;
  if (target.space==="screen" && !g.menu) {
    cluster(ctx,target.x,target.y,Number(g.animT)||0);
  } else if (target.space==="menu" && g.menu) {
    const pos=guideMenuPosition(g,target);
    if(pos) cluster(ctx,pos.x,pos.y,Number(g.animT)||0);
  }
}
