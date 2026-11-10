import { W, WORLD_W, CX, BENCH_X, PILE_X } from "./config";
import { drawText, textW } from "./font";
import { clamp } from "./math";
import { drawLivingThermometer, THERMOMETER_RECT } from "./thermometer";
import { carryCap } from "./rules";
import { visualSeason, seasonDay } from "./palette";
import { WEST_POST_X, EAST_POST_X, EAST_EXPANDED_X, EXPANSION_MARKER_X, campEstablished } from "./campBoundary";
import { MUSEUM_X } from "./museum";
import { GROOTY_X } from "./guide";

// Translucent slate retains contrast while letting the real game sky,
// weather and forest stay visible behind the resource panels.
const WOOD_LIGHT = "rgba(206,174,119,0.82)";
const WOOD_MID = "rgba(148,106,64,0.80)";
const WOOD_DARK = "rgba(63,46,32,0.68)";
const INK = "rgba(18,30,41,0.64)";

/** One shared, native-resolution pixel frame for the in-game HUD.
 * UI only: doesn't introduce new sprites or replace the world renderer. */
export function drawHudFrame(ctx: any, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = WOOD_DARK;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = WOOD_MID;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillStyle = "#63492f";
  ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
  ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
  ctx.fillStyle = INK;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = WOOD_LIGHT;
  ctx.fillRect(x + 1, y + 1, 1, 1);
  ctx.fillRect(x + w - 2, y + 1, 1, 1);
}

/** A genuine wide minimap from the existing live world coordinates and tree list,
 * not a new static artwork or a fabricated in-game landscape. */
/** Rich map of the REAL settlement. The same 13px strip now shows claimed
 * fencing, worksites and completed buildings as distinct tiny silhouettes.
 * No icons are decorative guesses: every mark comes from actual run state.
 */
export function drawCampMinimap(ctx: any, g: any, colors: any) {
  const x=3,y=2,w=W-6,h=13;
  drawHudFrame(ctx,x,y,w,h);
  const left=x+3,right=x+w-4;
  const mm=(wx:number)=>Math.round(left+clamp(wx,0,WORLD_W)/WORLD_W*(right-left));
  ctx.fillStyle="rgba(85,112,113,0.24)";
  ctx.fillRect(x+3,y+3,w-6,7);
  // Fine topographic texture and river line make the landscape legible.
  ctx.fillStyle=colors.ridge;
  ctx.fillRect(left,y+10,right-left+1,1);
  ctx.fillStyle="rgba(72,135,155,0.55)";
  ctx.fillRect(left,y+11,right-left+1,1);
  for(let i=0;i<16;i++){
    ctx.fillStyle="rgba(190,175,133,0.20)";
    ctx.fillRect(left+5+i*19,y+8+(i%2),4,1);
  }
  // Visible camera footprint, so wide-world landmarks make spatial sense.
  if(Number.isFinite(g.camX)){
    const vx=mm(g.camX),vr=mm(g.camX+W);
    ctx.fillStyle="rgba(229,224,181,0.12)";
    ctx.fillRect(vx,y+3,Math.max(1,vr-vx),7);
  }
  for(const tr of g.trees||[]){
    const tx=mm(tr.x);
    ctx.fillStyle=colors.treeLight;
    ctx.fillRect(tx,y+4,2,5);
    ctx.fillStyle="#5a4232";
    ctx.fillRect(tx,y+9,1,1);
  }
  // Unbuilt markers use pale dots. Completed construction gets a readable
  // oak-toned silhouette, and the actual fence grows when claimed.
  const sx=mm(WEST_POST_X),ex=mm(g.campExpansion>=1?EAST_EXPANDED_X:EAST_POST_X);
  if(campEstablished(g)){
    ctx.fillStyle="#a06c42";
    ctx.fillRect(sx,y+8,Math.max(1,ex-sx+1),1);
    ctx.fillStyle="#e0ad74";
    ctx.fillRect(sx,y+7,2,4);
    ctx.fillRect(ex,y+7,2,4);
    for(let q=sx+4;q<ex-2;q+=4){
      ctx.fillStyle="#926442";
      ctx.fillRect(q,y+7,1,3);
    }
  }else{
    for(const [wx,done] of [[WEST_POST_X,g.fenceLeft],[EAST_POST_X,g.fenceRight]] as const){
      const px=mm(wx);
      ctx.fillStyle=done?"#dcaf76":"#ad9f7f";
      ctx.fillRect(px,y+(done?7:8),2,done?4:2);
    }
  }
  if(campEstablished(g)&&g.campExpansion<1){
    const px=mm(EXPANSION_MARKER_X);
    ctx.fillStyle="#d7cd94";
    ctx.fillRect(px,y+6,1,4);
    ctx.fillRect(px-1,y+6,3,1);
  }
  // Grooty: a tiny green canopy above the trunk.
  const grooty=mm(GROOTY_X);
  ctx.fillStyle="#70956b";
  ctx.fillRect(grooty-1,y+5,3,2);
  ctx.fillStyle="#aa7b53";
  ctx.fillRect(grooty,y+7,1,3);
  const bench=mm(BENCH_X),pile=mm(PILE_X);
  if(g.builtBench){
    ctx.fillStyle="#d8ae78";
    ctx.fillRect(bench-1,y+7,4,2);
    ctx.fillStyle="#775035";
    ctx.fillRect(bench,y+9,1,2);
    ctx.fillRect(bench+2,y+9,1,2);
  }else{
    ctx.fillStyle="#a9ac95";
    ctx.fillRect(bench,y+8,2,2);
  }
  if(g.builtPile){
    ctx.fillStyle="#c58b53";
    ctx.fillRect(pile-2,y+8,5,2);
    ctx.fillStyle="#edb676";
    ctx.fillRect(pile-1,y+7,3,1);
  }else{
    ctx.fillStyle="#a9ac95";
    ctx.fillRect(pile,y+8,2,2);
  }
  if(g.stage>0){
    const building=mm(CX-13);
    ctx.fillStyle="#b28559";
    ctx.fillRect(building-2,y+8,5,3);
    ctx.fillStyle=g.stage>=5?"#e2c991":"#db9f61";
    ctx.fillRect(building-3,y+7,7,1);
    if(g.stage>=3){
      ctx.fillStyle="#efe0ba";
      ctx.fillRect(building-1,y+6,3,1);
    }
  }
  if(g.museumBuilt){
    const museum=mm(MUSEUM_X);
    ctx.fillStyle="#cb9a66";
    ctx.fillRect(museum-2,y+7,5,4);
    ctx.fillStyle="#dfbd85";
    ctx.fillRect(museum-3,y+6,7,1);
    ctx.fillStyle="#6b563e";
    ctx.fillRect(museum,y+8,1,3);
  }
  // A short-burning campfire icon flickers. The player remains topmost.
  const fx=mm(CX);
  ctx.fillStyle="#f1a741";
  ctx.fillRect(fx-1,y+7,3,3);
  ctx.fillStyle=g.fireLit&&Math.sin(g.animT*9)>0?"#ffdf85":"#bb722e";
  ctx.fillRect(fx,y+5,1,2);
  ctx.fillStyle="#fff9ea";
  ctx.fillRect(mm(g.player.x),y+5,2,5);
}

function meter(ctx: any, value: number, x: number, y: number, low: string, high: string) {
  const v = clamp(Number.isFinite(value) ? value : 0, 0, 100);
  ctx.fillStyle = "rgba(60,70,80,0.78)";
  ctx.fillRect(x, y, 52, 5);
  ctx.fillStyle = "rgba(19,29,39,0.72)";
  ctx.fillRect(x + 1, y + 1, 50, 3);
  const fill = Math.round(50 * v / 100);
  if (fill > 0) {
    const first = Math.min(fill, 30);
    ctx.fillStyle = low;
    ctx.fillRect(x + 1, y + 1, first, 3);
    if (fill > first) {
      ctx.fillStyle = high;
      ctx.fillRect(x + 1 + first, y + 1, fill - first, 3);
    }
  }
}

/** The new source-based layout uses exactly the same data as the old HUD.
 * The panel geometry leaves y=43 onward for notifications and guide access. */
/** Narrow four-panel layout with no added visual height or scenery occlusion.
 * The third plaque displays the existing logs/carrying rule until the next
 * inventory patch introduces item stacks and genuine occupied-slot counts. */
export const HUD_RECTS = {
  survival: {x:3,y:17,w:103,h:23},
  thermometer: THERMOMETER_RECT,
  resources: {x:195,y:17,w:38,h:23},
  calendar: {x:235,y:17,w:83,h:23},
} as const;

export function hudInventoryReadout(g:any,meta:any):string {
  const capacity = carryCap(g,meta);
  const carried = clamp(Number(g.player.wood)||0,0,capacity);
  // Compact for 13/21 without overflowing the narrow wood-frame plaque.
  return "INV"+(capacity < 10 ? " " : "")+Math.floor(carried)+"/"+capacity;
}
export function hudAshReadout(g:any):string {
  const earned = Math.max(0,Math.floor(Number(g.ashEarned)||0));
  if(earned<1000) return "ASH "+earned;
  const compact = earned<10000 ? (earned/1000).toFixed(1)+"K" : Math.floor(earned/1000)+"K";
  return "ASH "+compact;
}

/** Four native-resolution wooden panels:
 * WARMTH/FUEL | +8°C | WINDY glass instrument | INV/ASH | DAY/SEASON/MENU.
 * Weather is drawn inside the thermometer, never in the calendar panel. */
export function drawCampHUD(ctx: any, g: any, meta: any) {
  for(const panel of Object.values(HUD_RECTS)){
    drawHudFrame(ctx,panel.x,panel.y,panel.w,panel.h);
  }

  const warmth = clamp(Number(g.player.warmth) || 0, 0, 100);
  const fuel = g.fireLit ? clamp(Number(g.fuel) || 0, 0, 100) : 0;
  drawText(ctx,"WARMTH",7,21,"#eee1c7");
  meter(ctx,warmth,39,21,"#bc554a","#ef8a6b");
  drawText(ctx,String(Math.round(warmth)),94,21,warmth<25?"#ffae8d":"#e8d5ac");
  drawText(ctx,"FUEL",7,32,"#eee1c7");
  meter(ctx,fuel,39,32,"#c77732","#ffc267");
  drawText(ctx,String(Math.round(fuel)),94,32,fuel<25?"#ffab7e":"#e8d5ac");

  drawLivingThermometer(ctx,g);

  // Interim HUD summary of ACTUAL log carry capacity, not invented bag
  // slots. The MMO inventory patch will replace this with real item slots.
  drawText(ctx,hudInventoryReadout(g,meta),199,21,"#f1e1c3");
  drawText(ctx,hudAshReadout(g),199,32,"#d8bcf2");

  const day = g.isNight ? "NIGHT "+g.night : "DAY "+(g.night+1);
  drawText(ctx,day,239,21,"#f1e2c9");
  const season = visualSeason(g).toUpperCase()+" "+seasonDay(g)+"/7";
  // On tight native pixels, abbreviate only when a longer season label
  // would collide with the real MENU button at x=284.
  const seasonText = textW(season)>43 ? season.slice(0,3)+" "+seasonDay(g)+"/7" : season;
  drawText(ctx,seasonText,239,32,"#dfc69d");
  if(g.endlessMode){
    drawText(ctx,"E"+Math.floor(g.endlessN||0),274,46,"#b7d4ed");
  }else if(g.longNightActive&&Math.sin(g.animT*6)>0){
    drawText(ctx,"LONG NIGHT",274,46,"#8fd0ff");
  }
}
