import { W, CX, BENCH_X, PILE_X } from "./config";
import { drawText, drawTextC } from "./font";
import { drawInventoryItemIcon } from "./inventoryMenu";
import { stationCost, stationLevel } from "./campProgress";
import { carriedWeight, carriedWeightLimit } from "./inventory";
import { clamp } from "./math";

export type NearbyStation = "hearth" | "bench" | "pile";
export type StationAction = "primary" | "upgrade" | "plans";
export type BubbleRect = {x:number;y:number;w:number;h:number};

/** One station at a time, using exactly the old 22px physical reach. Nearby
 * means available for ACT, not automatically selected or visually expanded. */
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

/** First ACT selects; a later ACT uses the left action. Selection is a
 * transient visual choice, not save data or an automatic proximity trigger. */
export function selectedStation(g:any):NearbyStation|null {
  const station=nearbyStation(g);
  return station && g.selectedStation===station ? station : null;
}
export function selectStation(g:any,id:NearbyStation):boolean {
  if(nearbyStation(g)!==id)return false;
  g.selectedStation=id;
  g.stationId=id;
  g.buildConfirm=null;
  g.pressE=false;
  g.keys.act=false;
  return true;
}
export function dismissStationSelection(g:any):void {
  if(g.buildConfirm===g.selectedStation)g.buildConfirm=null;
  g.selectedStation=null;
}

/** Native-resolution bubble positions. The same animated geometry is shared
 * by touch hit zones and the guide fireflies, so nothing drifts out of sync. */
export function stationBubbleRects(g:any,id:NearbyStation):Record<StationAction,BubbleRect|null> {
  const wx=id==="hearth"?CX:id==="bench"?BENCH_X:PILE_X;
  const cam=Number.isFinite(g.camX)?g.camX:clamp((g.player?.x||CX)-W/2,0,1600-W);
  const center=clamp(Math.round(wx-cam),70,W-70);
  const t=Number.isFinite(g.animT)?g.animT:0;
  const rect=(dx:number,phase:number):BubbleRect=>({
    x:center+dx,y:77+Math.round(Math.sin(t*2.0+phase)*2),w:38,h:38
  });
  if(id==="bench"){
    return {primary:rect(-64,0),plans:rect(-19,1.35),upgrade:rect(26,2.7)};
  }
  return {primary:rect(-46,0),plans:null,upgrade:rect(8,1.9)};
}
export function stationBubbleCenter(g:any,id:NearbyStation,action:StationAction):{x:number;y:number}|null {
  const r=stationBubbleRects(g,id)[action];
  return r?{x:r.x+r.w/2,y:r.y+r.h/2}:null;
}
function pixel(ctx:any,x:number,y:number,w:number,h:number,color:string){
  ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
}

/** A hand-painted pixel circle, not a square modal or emoji. The real
 * alpha-blended interior lets firelight, trees and weather remain visible. */
function circle(ctx:any,r:BubbleRect,disabled:boolean,confirm:boolean):void {
  const {x,y,w,h}=r;
  const radius=(w-1)/2;
  const core=disabled?"rgba(24,30,35,0.48)"
    :confirm?"rgba(111,72,40,0.68)":"rgba(17,36,44,0.58)";
  const edge=disabled?"rgba(130,138,137,0.44)"
    :confirm?"rgba(255,216,143,0.93)":"rgba(231,203,153,0.73)";
  const shade="rgba(7,14,19,0.18)";
  for(let row=0;row<h;row++){
    const dy=row-radius;
    const inset=Math.max(0,Math.ceil(radius-Math.sqrt(Math.max(0,radius*radius-dy*dy))));
    const inside=w-inset*2;
    if(inside<=0)continue;
    pixel(ctx,x+inset,y+row,inside,1,core);
    pixel(ctx,x+inset,y+row,1,1,edge);
    if(inside>1)pixel(ctx,x+w-inset-1,y+row,1,1,edge);
    if(row===1 || row===h-2)pixel(ctx,x+inset,y+row,inside,1,edge);
    if(row>h-8 && row<h-3 && inside>6)pixel(ctx,x+inset+2,y+row,inside-4,1,shade);
  }
  pixel(ctx,x+12,y+4,9,1,confirm?"rgba(255,236,183,0.67)":"rgba(250,223,183,0.30)");
}
function button(ctx:any,g:any,r:BubbleRect,label:string,kind:StationAction,
  id:NearbyStation,disabled:boolean,confirm:boolean,act:()=>void):void {
  circle(ctx,r,disabled,confirm);
  const {x,y,w}=r;
  const ink=disabled?"#7e8587":confirm?"#ffe2ad":"#f5dfbc";
  const cx=x+Math.floor(w/2);
  if(kind==="upgrade"){
    // A true UP arrow: broad shoulders above a narrow vertical stem.
    pixel(ctx,cx-2,y+6,4,3,ink);
    pixel(ctx,cx-5,y+9,10,3,ink);
    pixel(ctx,cx-8,y+12,16,3,ink);
    pixel(ctx,cx-3,y+15,6,8,ink);
  }else if(kind==="plans"){
    pixel(ctx,cx-8,y+7,16,14,"#9f8255");
    pixel(ctx,cx-6,y+8,12,12,"#ead4a0");
    pixel(ctx,cx-4,y+10,8,1,"#71856a");
    pixel(ctx,cx-4,y+13,6,1,"#71856a");
    pixel(ctx,cx-4,y+16,8,1,"#71856a");
  }else{
    drawInventoryItemIcon(ctx,id==="bench"?"wood_axe":"pine_log",cx-6,y+8);
  }
  drawTextC(ctx,label,cx,y+26,disabled?"#899498":confirm?"#ffdea4":"#e7dec6");
  // A generous unobstructed 38x38 touch target follows the floating circle.
  if(!disabled)g.zones.push({...r,onDown:act});
}

/** Only the ACT-selected station may expose its floating controls. */
export function drawStationBubbles(ctx:any,g:any,station:NearbyStation|null,
  act:(id:NearbyStation,action:StationAction)=>void):void {
  if(!station || selectedStation(g)!==station)return;
  const rects=stationBubbleRects(g,station);
  const lv=stationLevel(g,station),cost=stationCost(g,station);
  const wood=(Number(g.player?.wood)||0)+(Number(g.stored)||0);
  const confirmed=g.buildConfirm===station;
  const primaryLabel=station==="hearth"?(g.fireLit?"FEED":"LIGHT")
    :station==="pile"?(g.player.wood>0?"STORE":"TAKE"):"CRAFT";
  const upgradeLabel=lv>=2?"MAX":confirmed?"CONFIRM":cost+" LOG";
  const name=station==="hearth"?"CAMPFIRE":station==="bench"?"WORKBENCH":"LOG STORAGE";
  const wx=station==="hearth"?CX:station==="bench"?BENCH_X:PILE_X;
  const cam=Number.isFinite(g.camX)?g.camX:clamp(g.player.x-W/2,0,1600-W);
  const center=clamp(Math.round(wx-cam),70,W-70);
  drawTextC(ctx,name,center,67,"#f4daab");
  button(ctx,g,rects.primary!,primaryLabel,"primary",station,false,false,
    ()=>act(station,"primary"));
  if(rects.plans)button(ctx,g,rects.plans,"PLANS","plans",station,false,false,
    ()=>act(station,"plans"));
  button(ctx,g,rects.upgrade!,upgradeLabel,"upgrade",station,lv>=2,confirmed,
    ()=>act(station,"upgrade"));
  if(lv<2 && wood<cost)drawTextC(ctx,"NEED "+cost+" LOGS",center,119,"#dcb795");
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
