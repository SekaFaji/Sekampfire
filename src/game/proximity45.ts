import { W, CX, BENCH_X, PILE_X } from "./config";
import { drawText, drawTextC } from "./font";
import { drawInventoryItemIcon } from "./inventoryMenu";
import { stationCost, stationLevel } from "./campProgress";
import { carriedWeight, carriedWeightLimit } from "./inventory";
import { clamp } from "./math";

export type NearbyStation = "hearth" | "bench" | "pile";
export type StationAction = "primary" | "upgrade" | "plans";
export type BubbleRect = {x:number;y:number;w:number;h:number};

/** One station at a time, using the same physical 22px interaction range as
 * the original game. Unfinished construction sites remain ACT-only. */
export function nearbyStation(g:any):NearbyStation|null {
  if (g.ui !== "run" || g.over || g.menu || (g.player?.chopT||0)>0) return null;
  const choices:{id:NearbyStation;x:number;ready:boolean}[]=[
    {id:"hearth",x:CX,ready:true},
    {id:"bench",x:BENCH_X,ready:!!g.builtBench},
    {id:"pile",x:PILE_X,ready:!!g.builtPile}
  ];
  const possible=choices.filter(c=>c.ready&&Math.abs((g.player?.x||0)-c.x)<22);
  possible.sort((a,b)=>Math.abs(a.x-g.player.x)-Math.abs(b.x-g.player.x));
  return possible[0]?.id||null;
}

/** Logical 320x180 screen pixels, not CSS coordinates or world hitboxes.
 * Screen-space buttons remain large enough to tap at landscape scale. */
export function stationBubbleRects(g:any,id:NearbyStation):Record<StationAction,BubbleRect|null> {
  const wx=id==="hearth"?CX:id==="bench"?BENCH_X:PILE_X;
  const cam=Number.isFinite(g.camX)?g.camX:clamp((g.player?.x||CX)-W/2,0,1600-W);
  const center=clamp(Math.round(wx-cam),49,W-49);
  const y=79;
  const hasPlans=id==="bench";
  if(hasPlans){
    return {
      primary:{x:center-59,y,w:36,h:27},
      plans:{x:center-18,y,w:36,h:27},
      upgrade:{x:center+23,y,w:36,h:27},
    };
  }
  return {
    primary:{x:center-43,y,w:39,h:27},
    plans:null,
    upgrade:{x:center+4,y,w:39,h:27},
  };
}
export function stationBubbleCenter(g:any,id:NearbyStation,action:StationAction):{x:number;y:number}|null {
  const r=stationBubbleRects(g,id)[action];
  return r ? {x:r.x+r.w/2,y:r.y+r.h/2} : null;
}
function pixel(ctx:any,x:number,y:number,w:number,h:number,color:string){
  ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
}
function button(ctx:any,g:any,rect:BubbleRect,label:string,icon:StationAction,
  id:NearbyStation,disabled:boolean,confirm:boolean,act:()=>void){
  const {x,y,w,h}=rect;
  pixel(ctx,x+1,y+2,w,h-1,"rgba(6,13,20,0.55)");
  pixel(ctx,x,y,w,h,disabled?"rgba(34,40,46,0.92)":confirm?"rgba(111,73,36,0.96)":"rgba(31,51,59,0.94)");
  pixel(ctx,x,y,w,1,confirm?"#ffd68c":disabled?"#62615a":"#bfa276");
  pixel(ctx,x,y,1,h,"#9c8059");
  pixel(ctx,x+w-1,y,1,h,"#71583e");
  pixel(ctx,x,y+h-1,w,1,"#71583e");
  if(icon==="upgrade"){
    const cx=x+Math.floor(w/2);
    pixel(ctx,cx-2,y+6,5,9,disabled?"#69717a":"#e4cf9b");
    pixel(ctx,cx-6,y+9,13,3,disabled?"#69717a":"#e4cf9b");
    pixel(ctx,cx-4,y+6,9,3,disabled?"#69717a":"#e4cf9b");
    pixel(ctx,cx-2,y+3,5,3,disabled?"#69717a":"#e4cf9b");
  }else if(icon==="plans"){
    pixel(ctx,x+Math.floor((w-14)/2),y+4,14,12,"#ab8651");
    pixel(ctx,x+Math.floor((w-14)/2)+2,y+5,10,9,"#d9c69c");
    pixel(ctx,x+Math.floor((w-14)/2)+4,y+7,6,1,"#6d785f");
    pixel(ctx,x+Math.floor((w-14)/2)+4,y+10,6,1,"#6d785f");
  }else{
    drawInventoryItemIcon(ctx,id==="bench"?"wood_axe":"pine_log",
      x+Math.round((w-12)/2),y+3);
  }
  drawTextC(ctx,label,x+w/2,y+19,disabled?"#7a8185":confirm?"#ffe3a9":"#e5d6b7");
  if(!disabled)g.zones.push({x,y,w,h,onDown:act});
}

/** Small light-weight actions replace the obstructive station modal.
 * Callbacks revalidate real proximity and execute existing gameplay rules. */
export function drawStationBubbles(ctx:any,g:any,station:NearbyStation|null,
  act:(id:NearbyStation,action:StationAction)=>void):void {
  if(!station || nearbyStation(g)!==station)return;
  const rects=stationBubbleRects(g,station);
  const lv=stationLevel(g,station);
  const cost=stationCost(g,station);
  const wood=(Number(g.player?.wood)||0)+(Number(g.stored)||0);
  const confirmed=g.buildConfirm===station;
  const primaryLabel=station==="hearth"?(g.fireLit?"FEED":"LIGHT")
    :station==="pile"?(g.player.wood>0?"STORE":"TAKE"):"CRAFT";
  const upgradeLabel=lv>=2?"MAX":confirmed?"CONFIRM":cost+" LOG";
  const title=station==="hearth"?"CAMPFIRE":station==="bench"?"WORKBENCH":"LOG STORAGE";
  const cx=station==="hearth"?CX:station==="bench"?BENCH_X:PILE_X;
  const cam=Number.isFinite(g.camX)?g.camX:clamp(g.player.x-W/2,0,1600-W);
  const center=clamp(Math.round(cx-cam),49,W-49);
  drawTextC(ctx,title,center,68,"#ffe0ad");
  button(ctx,g,rects.primary!,primaryLabel,"primary",station,false,false,
    ()=>act(station,"primary"));
  if(rects.plans)button(ctx,g,rects.plans,"PLANS","plans",station,false,false,
    ()=>act(station,"plans"));
  button(ctx,g,rects.upgrade!,upgradeLabel,"upgrade",station,
    lv>=2,confirmed,()=>act(station,"upgrade"));
  if(lv<2&&wood<cost)drawTextC(ctx,"NEED "+cost+" LOGS",center,109,"#e2bba1");
}

/** Existing authentic Pine Log data is the single source of carrying weight. */
export function weightHudValues(g:any,meta:any):{weight:number;limit:number;label:string}{
  const weight=Math.max(0,carriedWeight(g));
  const limit=Math.max(0,carriedWeightLimit(g,meta));
  return {weight,limit,label:weight+"/"+limit+"KG"};
}

/** A hand-drawn backpack button, deliberately below the right movement arrow.
 * The 34x26 hit area takes precedence over the 15% movement press zone. */
export const BACKPACK_BUTTON45={x:281,y:151,w:34,h:26} as const;
export function drawBackpackButton45(ctx:any,g:any,open:()=>void):void {
  const {x,y,w,h}=BACKPACK_BUTTON45;
  pixel(ctx,x+1,y+2,w,h-1,"rgba(4,10,18,0.42)");
  pixel(ctx,x,y,w,h,"rgba(31,49,57,0.92)");
  pixel(ctx,x,y,w,1,"#c2a273");
  pixel(ctx,x,y,1,h,"#97754d");
  pixel(ctx,x+w-1,y,1,h,"#8e6d49");
  pixel(ctx,x,y+h-1,w,1,"#665039");
  drawInventoryItemIcon(ctx,"timber_pack",x+11,y+2);
  drawTextC(ctx,"BAG",x+w/2,y+18,"#ffe1ab");
  g.zones.push({x,y,w,h,onDown:open});
}
