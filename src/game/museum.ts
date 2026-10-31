import { CX } from "./config";
import { px } from "./renderUtils";
import { drawText, drawTextC } from "./font";

/** Permanent collectible wood types; keep IDs stable across future runs. */
export const LOG_COLLECTION = [
  { id:"ordinary", name:"ORDINARY LOG", rarity:"COMMON", color:"#b89974" },
  { id:"twisted", name:"TWISTED LOG", rarity:"UNCOMMON", color:"#b2c992" },
  { id:"hand", name:"HAND LOG", rarity:"RARE", color:"#a7c7ee" },
  { id:"eight", name:"FIGURE-8 LOG", rarity:"LEGENDARY", color:"#efd28b" }
] as const;
export type MuseumLogId = typeof LOG_COLLECTION[number]["id"];
export const MUSEUM_COST = 20;
export const MUSEUM_X = CX+88;

export function cleanLogCollection(value: any): Record<MuseumLogId, boolean> {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {ordinary:input.ordinary===true,twisted:input.twisted===true,
    hand:input.hand===true,eight:input.eight===true};
}
export function museumCount(meta: any): number {
  const coll=cleanLogCollection(meta.collection);
  return LOG_COLLECTION.filter(log=>coll[log.id]).length;
}

/** The first felled log is Common; later trees can reveal unusual wood.
 * Odds are provisional to be rebalanced after actual playtests.
 * Does not alter normal wood drops, Ash or inventory.
 */
export function discoverLog(meta: any, random: () => number = Math.random): MuseumLogId | null {
  if (!meta.collection || typeof meta.collection !== "object") meta.collection=cleanLogCollection(null);
  if (!meta.collection.ordinary) { meta.collection.ordinary=true;return "ordinary"; }
  if (random()>=0.08) return null;
  const chance=random();
  const id: MuseumLogId = chance<0.82?"twisted":chance<0.98?"hand":"eight";
  if (meta.collection[id]) return null;
  meta.collection[id]=true;
  return id;
}

/** Procedurally authored original small 16-bit-style sprites. Never treat
 * collectibles as ordinary fuel and never touch the wood resource stacks. */
export function drawMuseumLog(ctx: any, type: MuseumLogId, x: number, y: number): void {
  const dark="#4c3020", bark="#8a603e", light="#c29761", end="#d3b17b";
  if (type==="ordinary") {
    px(ctx,x-12,y-5,22,9,dark);px(ctx,x-11,y-4,21,6,bark);
    px(ctx,x-9,y-3,17,2,light);px(ctx,x+8,y-4,3,8,end);
    px(ctx,x+9,y-2,1,4,dark);px(ctx,x-8,y,10,1,"#674529");
  } else if (type==="twisted") {
    // Uneven spiral curve, visible knots and bending grain.
    px(ctx,x-12,y-1,7,7,dark);px(ctx,x-9,y-6,6,8,bark);
    px(ctx,x-6,y-9,10,7,dark);px(ctx,x-4,y-8,10,5,bark);
    px(ctx,x+3,y-5,8,7,dark);px(ctx,x+5,y-4,7,5,light);
    px(ctx,x-5,y-6,6,1,end);px(ctx,x,y-4,6,1,light);
    px(ctx,x-8,y,2,2,dark);px(ctx,x+9,y-2,2,4,end);
  } else if(type==="hand") {
    // Forked palm with five distinct twig-fingers.
    px(ctx,x-6,y-2,13,7,dark);px(ctx,x-5,y-1,11,5,bark);
    for(let i=0;i<5;i++){
      const ht=[5,8,10,7,4][i];
      px(ctx,x-6+i*3,y-1-ht,2,ht+1,dark);
      px(ctx,x-5+i*3,y-1-ht,1,ht,light);
    }
    px(ctx,x-10,y+2,6,2,bark);
    px(ctx,x+3,y+1,3,1,end);
  } else {
    // Unusual double-ring figure-eight wood, with two hollow centers.
    for(const cy of [y-6,y+5]){
      px(ctx,x-6,cy-6,12,3,dark);px(ctx,x-8,cy-3,4,8,dark);
      px(ctx,x+4,cy-3,4,8,dark);px(ctx,x-6,cy+5,12,3,dark);
      px(ctx,x-5,cy-5,10,2,light);px(ctx,x-7,cy-2,2,6,bark);
      px(ctx,x+5,cy-2,2,6,end);
      px(ctx,x-4,cy+5,8,1,bark);
    }
    px(ctx,x-3,y-1,6,3,bark);
  }
}

/** World-visible permanent structure once built; does not change collisions
 * or camera movement. */
export function drawMuseumHut(ctx: any): void {
  const x=MUSEUM_X-15,y=149;
  px(ctx,x,y-19,30,19,"#61462f");
  px(ctx,x+3,y-16,24,15,"#332d29");
  px(ctx,x-3,y-24,36,4,"#543a2e");
  px(ctx,x-2,y-25,34,2,"#b08a59");
  px(ctx,x+1,y-20,2,19,"#8e6743");
  px(ctx,x+27,y-20,2,19,"#8e6743");
  px(ctx,x+5,y-7,20,2,"#bd9160");
  // Glass-backed display with a little framed ordinary log.
  px(ctx,x+7,y-16,16,8,"#776c55");
  px(ctx,x+8,y-15,14,6,"#253e45");
  px(ctx,x+10,y-12,9,2,"#bb8a52");
  px(ctx,x+17,y-13,2,4,"#dbb87d");
  px(ctx,x-1,y,32,2,"#4b3224");
}

export function drawMuseumPage(ctx: any, g: any, meta: any, close:()=>void): void {
  const ox=19,oy=7,pw=282,ph=166,found=museumCount(meta);
  ctx.fillStyle="rgba(8,13,25,0.96)";ctx.fillRect(ox,oy,pw,ph);
  ctx.fillStyle="#bb945d";
  ctx.fillRect(ox,oy,pw,1);ctx.fillRect(ox,oy+ph-1,pw,1);
  ctx.fillRect(ox,oy,1,ph);ctx.fillRect(ox+pw-1,oy,1,ph);
  drawText(ctx,"LOG MUSEUM",ox+9,oy+7,"#ffd98a");
  drawText(ctx,found+"/4",ox+191,oy+7,"#cbd9e6");
  ctx.fillStyle="#384556";ctx.fillRect(ox+254,oy+4,19,16);
  drawTextC(ctx,"X",ox+264,oy+9,"#ffe0ac");
  g.zones.push({x:ox+254,y:oy+4,w:19,h:16,onDown:close});

  if (!meta.museumBuilt) {
    drawTextC(ctx,"PERMANENT BUILDING NOT BUILT",160,36,"#e5d4b5");
    drawTextC(ctx,"OPEN BUILD > STRUCTURES",160,49,"#ced9e4");
    drawTextC(ctx,"COST: "+MUSEUM_COST+" WOOD (ONCE)",160,60,"#ffdc91");
  }
  const coll=cleanLogCollection(meta.collection);
  LOG_COLLECTION.forEach((log,i)=>{
    const x=ox+9+(i%2)*135, y=oy+ (meta.museumBuilt?27:63) +Math.floor(i/2)*51;
    const unlocked=coll[log.id];
    ctx.fillStyle=unlocked?"#29323d":"#202734";ctx.fillRect(x,y,127,47);
    ctx.fillStyle=unlocked?"#927047":"#546171";ctx.fillRect(x,y,127,1);
    if (unlocked) drawMuseumLog(ctx,log.id,x+25,y+18);
    else {
      ctx.fillStyle="#44505d";ctx.fillRect(x+13,y+12,24,13);
      drawTextC(ctx,"?",x+25,y+15,"#a7b4c6");
    }
    drawText(ctx,unlocked?log.name:"UNKNOWN LOG",x+44,y+10,unlocked?"#e5d7c2":"#8797ac");
    drawText(ctx,unlocked?log.rarity:"NOT FOUND",x+44,y+22,unlocked?log.color:"#67768b");
  });
  if (meta.museumBuilt) drawTextC(ctx,"FIND UNIQUE LOGS BY CHOPPING TREES",160,160,"#9eafbf");
}
