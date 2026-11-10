import { drawText, drawTextC } from "./font";
import { CAMP_STATIONS, type StationId, stationLevel, stationCost } from "./campProgress";

/** Compact local object popup, intentionally not a global BUILD screen.
 * Real touch zones belong only to this modal; the shared input adapter
 * discards all HUD and world zones beneath it. */
export const STATION_POPUP = {x:59,y:46,w:202,h:108} as const;
export const STATION_ACTIONS = {
  access:{x:72,y:104,w:80,h:18},
  upgrade:{x:167,y:104,w:80,h:18},
  plans:{x:113,y:130,w:94,h:16},
} as const;

function px(ctx:any,x:number,y:number,w:number,h:number,color:string) {
  ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
}
function frame(ctx:any,x:number,y:number,w:number,h:number) {
  px(ctx,x,y,w,h,"rgba(13,26,35,0.98)");
  px(ctx,x,y+h-1,w,1,"#8d714f");
  px(ctx,x,y,1,h,"#b48c57");
  px(ctx,x+w-1,y,1,h,"#806a4e");
  px(ctx,x+2,y+2,w-4,h-4,"rgba(45,58,61,0.57)");
  px(ctx,x,y,w,1,"#c19d69");
}
function button(ctx:any,g:any,rect:{x:number;y:number;w:number;h:number},label:string,
  activate:()=>void,active=false) {
  const {x,y,w,h}=rect;
  px(ctx,x,y,w,h,active?"#66513c":"#2a3e48");
  px(ctx,x,y,w,1,active?"#ead09b":"#a08a6b");
  px(ctx,x,y+h-1,w,1,"#655642");
  px(ctx,x,y,1,h,"#aa8b65");
  px(ctx,x+w-1,y,1,h,"#655642");
  drawTextC(ctx,label,x+w/2,y+6,active?"#ffe6ae":"#e9d8b7");
  g.zones.push({x,y,w,h,onDown:activate});
}

/** Paint an original physical-station icon, not an emoji or external asset. */
export function drawStationIcon(ctx:any,id:StationId,x:number,y:number):void {
  if(id==="hearth"){
    px(ctx,x,y+12,20,3,"#60513b");
    px(ctx,x+3,y+10,15,3,"#a48a64");
    px(ctx,x+8,y+4,6,7,"#e99146");
    px(ctx,x+9,y+1,4,8,"#ffd17a");
    px(ctx,x+10,y,2,5,"#fff0ae");
    px(ctx,x+4,y+12,13,1,"#d3bb94");
  }else if(id==="bench"){
    px(ctx,x+2,y+6,18,3,"#bc8e5b");
    px(ctx,x+3,y+9,3,8,"#785538");
    px(ctx,x+16,y+9,3,8,"#785538");
    px(ctx,x+6,y+4,12,2,"#d5ae72");
    px(ctx,x+11,y+1,3,6,"#879da2");
    px(ctx,x+10,y,5,2,"#c7d4d0");
  }else{
    px(ctx,x+3,y+12,17,4,"#765038");
    px(ctx,x+2,y+9,17,3,"#a67647");
    px(ctx,x+5,y+6,14,3,"#c58c4f");
    px(ctx,x+6,y+3,13,3,"#d5a36a");
    for(let i=0;i<3;i++){
      px(ctx,x+7+i*4,y+10,2,1,"#edba80");
      px(ctx,x+9+i*4,y+6,1,2,"#9f6c40");
    }
  }
}

/** Gameplay-authoritative rows are supplied by game.ts:
 * Access, Upgrade, then optionally Build Plans (Workbench only).
 * Upgrade remains two-tap confirmed through the existing purchase rule. */
export function drawStationPopup(ctx:any,g:any,rows:any[],close:()=>void):void {
  const id:StationId=g.stationId==="bench"||g.stationId==="pile"
    ?g.stationId:"hearth";
  const level=stationLevel(g,id);
  const r=STATION_POPUP;
  g.menuRect={...r};
  frame(ctx,r.x,r.y,r.w,r.h);
  drawText(ctx,CAMP_STATIONS[id].label,r.x+10,r.y+9,"#ffdc9c");
  button(ctx,g,{x:235,y:50,w:17,h:14},"X",close);
  drawStationIcon(ctx,id,r.x+9,r.y+29);
  drawText(ctx,"LEVEL "+level+(level>=2?" MAX": " / 2"),r.x+38,r.y+32,"#e8d5b2");
  drawText(ctx,level>=2?"FULLY UPGRADED":("NEXT: "+CAMP_STATIONS[id].benefits[level]),
    r.x+10,r.y+54,"#b8d2c5");
  drawText(ctx,level>=2?"MAX LEVEL":("COST "+stationCost(g,id)+" PINE LOGS"),
    r.x+10,r.y+67,"#e5be86");
  const confirm=g.buildConfirm===id;
  button(ctx,g,STATION_ACTIONS.access,"ACCESS",
    ()=>{g.menuSel=0;rows[0].onDown();},g.menuSel===0);
  button(ctx,g,STATION_ACTIONS.upgrade,confirm?"CONFIRM?":"UPGRADE",
    ()=>{g.menuSel=1;rows[1].onDown();},g.menuSel===1);
  if(id==="bench"&&rows[2]){
    button(ctx,g,STATION_ACTIONS.plans,"BUILD PLANS",
      ()=>{g.menuSel=2;rows[2].onDown();},g.menuSel===2);
  }else{
    drawTextC(ctx,id==="pile"?"ACCESS TO STORE OR TAKE LOGS":"ACCESS TO LIGHT OR STOKE",160,135,"#8ea8ac");
  }
}
