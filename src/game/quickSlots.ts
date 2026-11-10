import { drawText } from "./font";
import { addStatusMessage } from "./statusMessages";

export type QuickItem = "ember" | "ember_torch" | null;
export const QUICK_SLOT_HOLD_SECONDS = 0.5;
export const QUICK_SLOT_SIZE = 22;
export const QUICK_SLOT_HIT_SIZE = {w:28,h:26} as const;

/** Two genuine run-scoped equipment sockets. The old "ember" action remains
 * valid for existing v1 save slots, while the crafted Ember Torch is now a
 * real equipment entry. IDs in checkpoints are sanitized independently. */
export function normalizeQuickSlots(raw: unknown): QuickItem[] {
  if (!Array.isArray(raw)) return [null,null];
  const slots:QuickItem[]=[null,null];
  for(let i=0;i<2;i++){
    const value=raw[i];
    if(value==="ember"||value==="ember_torch"){
      if(!slots.includes(value))slots[i]=value;
    }
  }
  return slots;
}
export function quickItemAvailable(g:any,item:QuickItem):boolean {
  if(item==="ember")return !!(g.everLit||g.fireLit);
  if(item==="ember_torch")return g.crafts?.torch===true;
  return false;
}
export function openQuickSlotPicker(g:any,index:number,origin:"run"|"toolbar"="run"):void {
  g.quickSlotIndex=index===1?1:0;
  g.quickSlotFrom=origin;
  g.menu="quickslot";
  g.menuSel=0;
  g.keys.act=false;
}
export function assignQuickSlot(g:any,index:number,item:QuickItem):boolean {
  if(index!==0&&index!==1) return false;
  if(item!==null && item!=="ember" && item!=="ember_torch")return false;
  if(item!==null && !quickItemAvailable(g,item))return false;
  const slots=normalizeQuickSlots(g.quickSlots);
  if(item)slots[1-index]=slots[1-index]===item?null:slots[1-index];
  slots[index]=item;
  g.quickSlots=slots;
  return true;
}

/** The two light sources call the existing real ember action: it requires a
 * live campfire with sufficient fuel and respects its current duration,
 * buffs and resource cost. A Torch is reusable gear, not free fuel. */
export function useQuickSlot(g:any,index:number):void {
  const item=normalizeQuickSlots(g.quickSlots)[index];
  if(!item){
    addStatusMessage(g,"HOLD A SLOT TO EQUIP A TOOL.");
    return;
  }
  if(!quickItemAvailable(g,item)){
    addStatusMessage(g,"CRAFT OR UNLOCK THIS TOOL FIRST.");
    return;
  }
  if(g.player.torchT>0){
    addStatusMessage(g,"YOUR EMBER IS STILL BURNING.");
  }else if(!g.fireLit || g.fuel<=12){
    addStatusMessage(g,"NEED A LIT CAMPFIRE WITH FUEL.");
  }else{
    g.pressT=true;
  }
}

/** Uses the existing actual game tick rather than browser timers so long
 * presses cannot fire twice, do not use tools on release, and remain safe
 * with simultaneous movement pointer captures. */
export function tickQuickSlotHolds(g:any,dt:number):void {
  if(g.menu || g.ui!=="run" || g.over) return;
  for(const pt of Object.values(g.pointers||{}) as any[]){
    if(pt.quickSlot===undefined || pt.longHeld || pt.cancelled) continue;
    pt.held=(Number(pt.held)||0)+Math.max(0,dt);
    if(pt.held>=QUICK_SLOT_HOLD_SECONDS){
      pt.longHeld=true;
      openQuickSlotPicker(g,pt.quickSlot,"run");
      break;
    }
  }
}

/** Compact 22x22 ORIGINAL pixel equipment socket; hit area is slightly
 * bigger (28x26) for fingers. The large central ACT button is untouched.
 * This is NOT a reskinned rectangular text button. */
export function drawQuickSlot(ctx:any,g:any,index:number,x:number,y:number):void {
  const w=QUICK_SLOT_SIZE,h=QUICK_SLOT_SIZE,item=normalizeQuickSlots(g.quickSlots)[index];
  const ready=item!==null && quickItemAvailable(g,item)
    && g.fireLit && g.fuel>12 && g.player.torchT<=0;
  ctx.fillStyle="rgba(8,16,23,0.35)";ctx.fillRect(x+1,y+2,w,h-1);
  ctx.fillStyle="rgba(26,39,44,0.59)";ctx.fillRect(x,y,w,h);
  ctx.fillStyle="#b39467";ctx.fillRect(x,y,w,1);
  ctx.fillRect(x,y,1,h);
  ctx.fillStyle="#725638";ctx.fillRect(x,y+h-1,w,1);
  ctx.fillRect(x+w-1,y+1,1,h-1);
  ctx.fillStyle="rgba(138,117,80,0.21)";ctx.fillRect(x+2,y+2,w-4,h-4);
  ctx.fillStyle="#ddbe8c";ctx.fillRect(x+3,y+3,2,2);
  // Index engraving inside the socket rather than a permanent text label.
  drawText(ctx,String(index+1),x+3,y+3,"#d9c29a");
  if(!item){
    ctx.fillStyle="#829895";ctx.fillRect(x+11,y+7,1,9);
    ctx.fillRect(x+7,y+11,9,1);
  }else{
    // Hand-drawn torch shaft, shaded metal ferrule and flickering flame.
    ctx.fillStyle=ready?"#bd8051":"#655a4b";
    ctx.fillRect(x+10,y+12,3,6);
    ctx.fillStyle=ready?"#e8b77b":"#8d8476";
    ctx.fillRect(x+11,y+12,1,6);
    ctx.fillStyle="#655547";ctx.fillRect(x+9,y+10,5,2);
    ctx.fillStyle=ready?"#e58546":"#7b8586";
    ctx.fillRect(x+9,y+7,5,4);
    ctx.fillStyle=ready?"#f7bd68":"#9eaaa5";
    ctx.fillRect(x+10,y+5,3,5);
    ctx.fillStyle=ready?"#fff0a3":"#b5bec0";
    ctx.fillRect(x+11,y+4,1,4);
    if(item==="ember_torch"){
      ctx.fillStyle="#c4a66b";
      ctx.fillRect(x+8,y+13,2,1);
      ctx.fillRect(x+13,y+13,2,1);
    }
  }
  // Real touch zones extend 3px around both squares but NEVER touch ACT.
  g.zones.push({x:x-3,y:y-2,w:QUICK_SLOT_HIT_SIZE.w,h:QUICK_SLOT_HIT_SIZE.h,quickSlot:index});
}
