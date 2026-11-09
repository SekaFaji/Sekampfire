import { drawText, drawTextC } from "./font";
import { addStatusMessage } from "./statusMessages";

export type QuickItem = "ember" | null;
export const QUICK_SLOT_HOLD_SECONDS = 0.5;

/** Inventory migration seam: keep stable item IDs, and never allow unowned or
 * unsupported resources into the toolbar. Future crafted active items can
 * extend this small registry without changing touch input or save keys. */
export function normalizeQuickSlots(raw: unknown): QuickItem[] {
  if (!Array.isArray(raw)) return [null,null];
  return [0,1].map(i=>raw[i]==="ember"?"ember":null);
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
  if(item!=="ember" && item!==null) return false;
  // A campfire ember can be configured once learned. It is an existing
  // campfire ACTION, not an invented permanent torch inventory object.
  if(item==="ember" && !g.everLit && !g.fireLit) return false;
  const slots=normalizeQuickSlots(g.quickSlots);
  if(item) slots[1-index]=slots[1-index]===item?null:slots[1-index];
  slots[index]=item;
  g.quickSlots=slots;
  return true;
}
export function useQuickSlot(g:any,index:number):void {
  const item=normalizeQuickSlots(g.quickSlots)[index];
  if(!item){
    addStatusMessage(g,"HOLD AN EMPTY SLOT TO EQUIP.");
    return;
  }
  if(item==="ember"){
    if(g.player.torchT>0){
      addStatusMessage(g,"YOUR EMBER TORCH IS STILL BURNING.");
    }else if(!g.fireLit || g.fuel<=12){
      addStatusMessage(g,"NEED A LIT CAMPFIRE WITH FUEL.");
    }else{
      g.pressT=true; // existing fuel cost, effects and timer remain in game.ts
    }
  }
}

/** Input owns the long-press timer, not the canvas drawing or a browser timer.
 * Works during real game ticks, allows multitouch, never auto-uses on hold,
 * and leaves a normal short tap for a configured slot. */
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

/** Original tiny two-socket equipment rail, sized for water-side touch.
 * Empty sockets have a quiet carved plus. Existing ember use gets a hand
 * drawn 1px torch, not a text-only button or an emoji. */
export function drawQuickSlot(ctx:any,g:any,index:number,x:number,y:number):void {
  const w=47,h=18,item=normalizeQuickSlots(g.quickSlots)[index];
  ctx.fillStyle="rgba(8,16,23,0.35)";ctx.fillRect(x+1,y+2,w,h-1);
  ctx.fillStyle="rgba(26,39,44,0.89)";ctx.fillRect(x,y,w,h);
  ctx.fillStyle="#a78a65";ctx.fillRect(x,y,w,1);
  ctx.fillRect(x,y,1,h);
  ctx.fillStyle="#70573c";ctx.fillRect(x,y+h-1,w,1);
  ctx.fillRect(x+w-1,y+1,1,h-1);
  ctx.fillStyle="rgba(121,104,75,0.28)";ctx.fillRect(x+3,y+3,w-6,h-6);
  ctx.fillStyle="#9e8f6c";ctx.fillRect(x+4,y+3,3,3);
  drawText(ctx,String(index+1),x+4,y+4,"#dac39c");
  if(!item){
    ctx.fillStyle="#91a5a1";ctx.fillRect(x+24,y+5,1,7);
    ctx.fillRect(x+21,y+8,7,1);
    drawTextC(ctx,"HOLD",x+w/2,y+13,"#9eacaa");
  }else{
    const ready=g.fireLit && g.fuel>12 && g.player.torchT<=0;
    const flame=ready?"#f0bb69":"#7a7c79";
    ctx.fillStyle="#875b3b";ctx.fillRect(x+15,y+9,2,6);
    ctx.fillStyle="#d3a778";ctx.fillRect(x+15,y+9,1,5);
    ctx.fillStyle=flame;ctx.fillRect(x+14,y+5,4,5);
    ctx.fillStyle=ready?"#fff0ab":"#83918d";ctx.fillRect(x+15,y+4,2,3);
    ctx.fillStyle=ready?"#ed8e46":"#5b6261";ctx.fillRect(x+14,y+8,4,2);
    drawText(ctx,"EMBER",x+21,y+7,ready?"#f5ddaa":"#90968e");
  }
  g.zones.push({x,y,w,h,quickSlot:index});
}
