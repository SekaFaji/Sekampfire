import { carryCap } from "./rules";

export const INVENTORY_GRID_SLOTS = 20;
export const INVENTORY_START_SLOTS = 5;
export const INVENTORY_PACK_BONUS_SLOTS = 5;
export const PINE_LOG_ID = "pine_log";

export type ItemCategory = "material" | "tool" | "clothing" | "backpack" | "camp";
export type ItemId = "pine_log" | "wood_axe" | "warm_boots" | "timber_pack" |
  "fire_reflector" | "kindling_bundle" | "ember_lantern";
export type ItemDef = {
  id: ItemId; name: string; category: ItemCategory;
  description: string[]; weight: number; maxStack: number; sprite: "log" | "axe" | "boots" | "pack" | "camp";
};
export type InventoryStack = {id: ItemId; qty: number};
export type InventoryState = {slots: (InventoryStack | null)[]};

/** Data-driven definitions, distinct from item ownership. Only Pine Logs
 * currently enter the backpack: equipment is shown on a separate page and
 * its original crafting flags remain the source of truth. */
export const ITEM_DEFINITIONS: Record<ItemId, ItemDef> = {
  pine_log: {
    id:"pine_log", name:"PINE LOGS", category:"material", weight:1,maxStack:99,sprite:"log",
    description:["COMMON SOFTWOOD FROM", "PINE TREES.", "USED AS FUEL AND", "CAMP BUILDING MATERIAL."]
  },
  wood_axe: {
    id:"wood_axe", name:"WOOD AXE", category:"tool", weight:0,maxStack:1,sprite:"axe",
    description:["CRAFTED AT WORKBENCH.", "CHOP PINE TREES FASTER."]
  },
  warm_boots: {
    id:"warm_boots", name:"WARM BOOTS", category:"clothing", weight:0,maxStack:1,sprite:"boots",
    description:["CRAFTED WINTER BOOTS.", "MOVE FASTER AND KEEP WARM."]
  },
  timber_pack: {
    id:"timber_pack", name:"TIMBER PACK", category:"backpack", weight:0,maxStack:1,sprite:"pack",
    description:["CRAFTED BACKPACK.", "CARRY MORE MATERIALS.", "ADDS FIVE BAG SLOTS."]
  },
  fire_reflector: {
    id:"fire_reflector",name:"FIRE REFLECTOR",category:"camp",weight:0,maxStack:1,sprite:"camp",
    description:["CRAFTED CAMP DEVICE.", "HELPS THE FIRE LAST LONGER."]
  },
  kindling_bundle: {
    id:"kindling_bundle",name:"KINDLING BUNDLE",category:"camp",weight:0,maxStack:1,sprite:"camp",
    description:["IMPROVES EACH LOG", "ADDED TO THE FIRE."]
  },
  ember_lantern: {
    id:"ember_lantern",name:"EMBER LANTERN",category:"tool",weight:0,maxStack:1,sprite:"camp",
    description:["EXTENDS EMBER TORCH", "DURATION WHEN CRAFTED."]
  }
};
const GEAR_CRAFT_IDS: {craft:string;id:ItemId}[] = [
  {craft:"maul",id:"wood_axe"},
  {craft:"boots",id:"warm_boots"},
  {craft:"pack",id:"timber_pack"},
  {craft:"refl",id:"fire_reflector"},
  {craft:"kindling",id:"kindling_bundle"},
  {craft:"lantern",id:"ember_lantern"},
];

const cleanQuantity=(value:unknown,max:number):number=>{
  const n=Number(value);
  return typeof value==="number" && Number.isFinite(n)
    ? Math.max(0,Math.min(max,Math.floor(n))):0;
};

export function emptyInventory():InventoryState {
  return { slots:Array.from({length:INVENTORY_GRID_SLOTS},()=>null) };
}

/** Sanitizes new checkpoint data; old checkpoints fall back to player.wood.
 * The first real item is Pine Logs. No fabricated second resource can be
 * injected into the current wood-only world or bypass resource costs. */
export function normalizeInventory(raw:unknown,legacyWood=0):InventoryState {
  const bag=emptyInventory();
  const candidate=raw && typeof raw==="object" && !Array.isArray(raw)
    ? (raw as any).slots:undefined;
  if (Array.isArray(candidate) && candidate.length===INVENTORY_GRID_SLOTS) {
    let count=0;
    for(const item of candidate){
      if(item?.id==="pine_log") count+=cleanQuantity(item.qty,99);
    }
    const qty=Math.min(count,26);
    if(qty>0) bag.slots[0]={id:"pine_log",qty};
  }else{
    const qty=cleanQuantity(legacyWood,26);
    if(qty>0) bag.slots[0]={id:"pine_log",qty};
  }
  return bag;
}

/** Compatibility bridge: old wood/fire, crafting, dog, storage and tutorials
 * now read/write the REAL backpack Pine Logs stack through this accessor.
 * Neither parallel counters nor a frame-by-frame copy can go out of sync. */
export function installInventory(g:any,raw?:unknown,legacyWood?:number):void {
  const qty=legacyWood??g.player?.wood??0;
  g.inventory=normalizeInventory(raw,qty);
  Object.defineProperty(g.player,"wood",{
    enumerable:true,configurable:true,
    get:()=>itemQuantity(g.inventory,PINE_LOG_ID),
    set:(v:unknown)=>setPineLogs(g.inventory,v),
  });
}

export function itemQuantity(inventory:InventoryState,id:ItemId):number {
  return inventory.slots.reduce((sum,slot)=>sum+(slot?.id===id ? slot.qty:0),0);
}
export function setPineLogs(inventory:InventoryState,value:unknown):number {
  const qty=cleanQuantity(value,99);
  // Currently there are no competing materials; slot 0 is the canonical
  // Pine Logs stack. This API remains valid once additional IDs are added.
  const index=inventory.slots.findIndex(slot=>slot?.id===PINE_LOG_ID);
  if(qty===0){
    if(index>=0) inventory.slots[index]=null;
    return 0;
  }
  const dest=index>=0?index:inventory.slots.findIndex(slot=>!slot);
  if(dest<0)return 0;
  inventory.slots[dest]={id:PINE_LOG_ID,qty};
  return qty;
}
export function occupiedInventorySlots(g:any):number {
  return (g.inventory?.slots||[]).filter((s:any)=>s&&s.qty>0).length;
}
export function availableInventorySlots(g:any,meta:any):number {
  const extra=(g.crafts?.pack?1:0)+(meta?.up?.pack?1:0);
  return Math.min(INVENTORY_GRID_SLOTS,INVENTORY_START_SLOTS+extra*INVENTORY_PACK_BONUS_SLOTS);
}
export function carriedWeight(g:any):number {
  return (g.inventory?.slots||[]).reduce((sum:number,s:any)=>
    sum+(s?.id==="pine_log"?s.qty*ITEM_DEFINITIONS.pine_log.weight:0),0);
}
export function carriedWeightLimit(g:any,meta:any):number {
  return carryCap(g,meta); // old 5/13/21 wood capacity is preserved verbatim
}
export function inventoryEquipment(g:any,meta:any):{id:ItemId;source:string}[] {
  const result:{id:ItemId;source:string}[] = [];
  for(const row of GEAR_CRAFT_IDS){
    if(g.crafts?.[row.craft]===true) result.push({id:row.id,source:"CRAFTED"});
  }
  if(meta?.up?.axe>0&&!g.crafts?.maul)result.push({id:"wood_axe",source:"ASH GEAR"});
  if(meta?.up?.pack>0&&!g.crafts?.pack)result.push({id:"timber_pack",source:"ASH GEAR"});
  return result;
}
export function snapshotInventory(g:any):InventoryState {
  return normalizeInventory(g.inventory,g.player?.wood??0);
}
