import { drawText, drawTextC, textW } from "./font";
import { px } from "./renderUtils";
import { LOG_RELICS, MUSEUM_X, museumFound, museumHasBuilding, normalizeMuseum, type LogRelicId } from "./logMuseum";

/** Original compact pixel silhouettes. Every specimen has an actual distinct
 * outline; no placeholder recolour and no fetched external art.
 */
export function drawRelicIcon(ctx: any, id: LogRelicId, x: number, y: number): void {
  const dark = "#422c21", bark = "#825430", edge = "#b67e48", grain = "#d9a56d";
  if (id === "ordinary") {
    px(ctx,x+2,y+7,22,7,dark);
    px(ctx,x+3,y+6,21,5,bark);
    px(ctx,x+4,y+6,19,1,edge);
    px(ctx,x+3,y+8,3,4,grain);
    px(ctx,x+6,y+9,13,1,"#684027");
    px(ctx,x+21,y+7,3,5,"#deb980");
    px(ctx,x+22,y+9,1,2,dark);
  } else if (id === "twisted") {
    // Zig-zag taper and separated bark ridges, never the straight basic log.
    px(ctx,x+1,y+13,7,4,dark);
    px(ctx,x+5,y+9,8,5,bark);
    px(ctx,x+10,y+5,8,6,edge);
    px(ctx,x+16,y+3,7,5,bark);
    px(ctx,x+20,y+4,4,4,grain);
    px(ctx,x+4,y+12,4,1,grain);
    px(ctx,x+9,y+9,4,1,dark);
    px(ctx,x+13,y+6,5,1,grain);
    px(ctx,x+2,y+14,4,1,edge);
  } else if (id === "hand") {
    // Four upper branches and a splayed thumb, like a wooden hand.
    px(ctx,x+8,y+10,13,7,dark);
    px(ctx,x+9,y+11,11,5,bark);
    px(ctx,x+5,y+8,8,5,bark);
    px(ctx,x+5,y+7,4,3,edge);
    px(ctx,x+10,y+3,3,9,edge);
    px(ctx,x+14,y+1,3,12,bark);
    px(ctx,x+18,y+2,3,11,edge);
    px(ctx,x+22,y+5,3,10,bark);
    px(ctx,x+10,y+13,9,1,grain);
    px(ctx,x+16,y+4,1,6,grain);
  } else {
    // Connected figure-eight wooden loop with two true empty centres.
    for (const [cx,cy] of [[9,7],[18,7]]) {
      px(ctx,x+cx-4,y+cy-5,8,3,dark);
      px(ctx,x+cx-6,y+cy-2,4,7,bark);
      px(ctx,x+cx+2,y+cy-2,4,7,dark);
      px(ctx,x+cx-4,y+cy+5,8,3,edge);
      px(ctx,x+cx-3,y+cy-4,6,2,grain);
    }
    px(ctx,x+11,y+6,6,4,bark);
    px(ctx,x+12,y+7,4,2,grain);
    px(ctx,x+6,y+6,5,5,"#18202b");
    px(ctx,x+18,y+6,5,5,"#18202b");
  }
}

/** Permanent small gallery by the right edge of the campsite. */
export function drawLogMuseumWorld(ctx: any, meta: any): void {
  if (!museumHasBuilding(meta)) return;
  const x = MUSEUM_X, y=151;
  px(ctx,x-16,y-22,32,20,"#65432d");
  px(ctx,x-14,y-20,28,18,"#916741");
  for(let i=0;i<5;i++) px(ctx,x-13+i*6,y-18,2,15,"#714c30");
  px(ctx,x-18,y-25,36,3,"#523529");
  px(ctx,x-16,y-27,32,2,"#c59a5d");
  px(ctx,x-12,y-15,24,10,"#2c2730");
  px(ctx,x-10,y-12,20,2,"#b38d59");
  px(ctx,x-10,y-7,20,2,"#b38d59");
  // A tiny carved log emblem identifies the permanent museum.
  drawRelicIcon(ctx,"ordinary",x-12,y-25);
  px(ctx,x-17,y-1,34,2,"#513927");
  px(ctx,x-13,y-3,26,2,"#9c7141");
}

/** Full collection viewer fits the game's original 320x180 canvas. */
export function drawLogMuseumMenu(ctx: any, g: any, meta: any, close: () => void): void {
  const collection=normalizeMuseum(meta?.museum);
  ctx.fillStyle="rgba(10,14,27,0.96)";
  ctx.fillRect(18,10,284,160);
  ctx.fillStyle="#bb945d";
  ctx.fillRect(18,10,284,2); ctx.fillRect(18,168,284,2);
  ctx.fillRect(18,10,2,160);ctx.fillRect(300,10,2,160);
  drawText(ctx,"LOG MUSEUM",27,18,"#ffdb97");
  const completion=museumFound(collection)+"/4 DISCOVERED";
  drawText(ctx,completion,278-textW(completion),18,"#c8d3e0");
  ctx.fillStyle="#29384a"; ctx.fillRect(277,13,17,15);
  drawTextC(ctx,"X",285,17,"#f1d9a5");
  g.zones.push({x:276,y:12,w:19,h:17,onDown:close});
  if(!collection.built) {
    drawTextC(ctx,"UNLOCKED AFTER YOUR FIRST CAMP",160,67,"#bfc8d8");
    drawTextC(ctx,"BUILD THE MUSEUM FOR 15 WOOD",160,83,"#ffd597");
    drawTextC(ctx,"IN BUILD > STRUCTURES",160,95,"#9aaec1");
    drawTextC(ctx,"SPECIAL LOGS WILL APPEAR WHILE CHOPPING",160,119,"#a8b9ce");
    return;
  }
  LOG_RELICS.forEach((relic,i)=>{
    const x=26+(i%2)*136,y=36+Math.floor(i/2)*56;
    ctx.fillStyle="rgba(48,59,72,0.75)";ctx.fillRect(x,y,130,51);
    ctx.fillStyle=collection.found[relic.id]?"#a38250":"#516071";
    ctx.fillRect(x,y,130,1);ctx.fillRect(x,y+50,130,1);
    if(collection.found[relic.id]){
      drawRelicIcon(ctx,relic.id,x+5,y+12);
      drawText(ctx,relic.name,x+36,y+9,"#f1e0be");
      drawText(ctx,relic.rarity,x+36,y+19,relic.color);
      drawText(ctx,"FOUND "+collection.found[relic.id],x+36,y+30,"#9eafbf");
    } else {
      drawTextC(ctx,"?",x+17,y+21,"#72869a");
      drawText(ctx,"UNKNOWN LOG",x+36,y+12,"#7e90a4");
      drawText(ctx,relic.rarity,x+36,y+23,"#697a8d");
    }
  });
  drawTextC(ctx,"RARE LOGS ARE COLLECTIBLES, NOT FIREWOOD",160,156,"#9aacc0");
}
