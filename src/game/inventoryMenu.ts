import { drawText, drawTextC, textW } from "./font";
import { INVENTORY_GRID_SLOTS, ITEM_DEFINITIONS, type ItemId,
  availableInventorySlots, occupiedInventorySlots, carriedWeight,
  carriedWeightLimit, inventoryEquipment } from "./inventory";
import { assignQuickSlot } from "./quickSlots";
import { saveMeta } from "./save";
import { ownedAxeOptions, ownedPetOptions, equippedAxe, equippedPet,
  equipAxe, equipPet, AXE_STATS, type AxeId, type GearCategory } from "./equipment50";

export const INVENTORY_MODAL = {x:18,y:8,w:284,h:164} as const;
export const BAG_GRID = {x:29,y:46,cols:5,rows:4,size:22,gap:3} as const;
export const EQUIPMENT_SLOTS50 = {
  axe:{x:165,y:45,w:60,h:41},pet:{x:230,y:45,w:60,h:41}
} as const;
export const EQUIPMENT_ACTION50 = {x:221,y:149,w:69,h:15} as const;

function block(ctx:any,x:number,y:number,w:number,h:number,color:string){
  ctx.fillStyle=color;
  ctx.fillRect(x,y,w,h);
}
function border(ctx:any,x:number,y:number,w:number,h:number,color:string){
  block(ctx,x,y,w,1,color);block(ctx,x,y+h-1,w,1,color);
  block(ctx,x,y,1,h,color);block(ctx,x+w-1,y,1,h,color);
}
function actionable(ctx:any,g:any,x:number,y:number,w:number,h:number,
  label:string,onDown:()=>void,active=false){
  block(ctx,x,y,w,h,active?"rgba(104,81,57,0.78)":"rgba(41,57,74,0.62)");
  border(ctx,x,y,w,h,active?"#dfb77a":"#987950");
  drawTextC(ctx,label,x+w/2,y+4,active?"#ffe3a8":"#d5c8af");
  g.zones.push({x,y,w,h,onDown});
}

/** Original 12x12 icons rendered from pixel rectangles. No emojis, emoji
 * fonts, downloaded assets or scaled HTML components in gameplay HUD. */
export function drawInventoryItemIcon(ctx:any,id:ItemId,x:number,y:number,scale=1):void{
  const p=(dx:number,dy:number,w:number,h:number,color:string)=>
    block(ctx,x+dx*scale,y+dy*scale,w*scale,h*scale,color);
  if(id==="pine_log"){
    p(1,4,10,6,"#523421");
    p(2,3,9,6,"#9e6540");
    p(2,4,7,1,"#d59a61");
    p(3,7,6,1,"#714329");
    p(8,4,3,5,"#dbab73");
    p(9,5,1,3,"#9c6641");
    p(2,2,8,1,"#ad7b48");
    p(0,7,3,2,"#603e29");
    p(4,4,2,1,"#edbf7d");
  }else if(id==="ember_torch"){
    // Flame, hand grip and solid metal collar.
    p(5,4,3,7,"#755036");
    p(6,5,1,6,"#bc8457");
    p(4,3,5,2,"#4d4c45");
    p(4,2,5,3,"#e8874c");
    p(5,1,3,3,"#f6c46e");
    p(6,0,1,3,"#fff0aa");
  }else if(id==="wood_axe"){
    p(5,1,2,10,"#70462d");
    p(6,2,1,8,"#c8935e");
    p(2,1,6,2,"#718b96");
    p(1,2,7,3,"#b3c7c7");
    p(2,4,5,2,"#819ea5");
    p(1,3,1,2,"#dce2d7");
  }else if(id==="stick"){
    p(5,1,2,11,"#5d432d");p(6,2,1,9,"#b98b58");
    p(4,0,4,2,"#d1ab72");p(3,8,2,3,"#8a5c35");
  }else if(id==="grandpas_axe"){
    p(6,1,2,11,"#6b432d");p(7,1,1,10,"#c29a68");
    p(2,0,7,2,"#9cb3bf");p(1,1,7,4,"#c9d8d9");
    p(1,3,6,2,"#718991");p(2,1,2,1,"#eef2eb");
    p(5,5,2,2,"#ccad74");
  }else if(id==="bingsu"){
    // Compact original white Dogo Argentino icon (not an emoji).
    p(1,5,8,4,"#a8b8b9");p(2,4,8,4,"#e9ede8");
    p(8,2,3,5,"#f8f8ed");p(9,1,2,2,"#8d9291");
    p(10,5,2,1,"#3b4445");p(9,4,1,1,"#3b4445");
    p(1,8,2,3,"#b6c3c3");p(6,8,2,3,"#b6c3c3");
    p(8,6,1,2,"#b2644e");p(0,4,2,2,"#bdc8c8");
  }else if(id==="warm_boots"){
    p(2,2,4,6,"#8d6247");
    p(6,3,4,5,"#73513e");
    p(1,7,6,3,"#5c3d2b");
    p(5,8,6,2,"#503c32");
    p(3,3,2,2,"#c9a079");
    p(7,4,2,2,"#b18c6a");
  }else if(id==="timber_pack"){
    p(2,2,8,9,"#644832");
    p(3,3,6,7,"#b68b53");
    p(4,4,4,4,"#d2aa6a");
    p(2,4,1,5,"#4d3730");
    p(9,4,1,5,"#4d3730");
    p(4,1,4,2,"#ad926c");
    p(4,8,4,1,"#7a5439");
  }else{
    p(3,2,6,8,"#6b5040");
    p(4,3,4,6,"#ad8b5b");
    p(5,1,2,3,"#eebc69");
    p(4,4,1,1,"#f7d68c");
    p(7,4,1,1,"#c87949");
  }
}

export function inventorySelection(g:any,meta:any):{id:ItemId;qty:number;source:string}|null{
  if(g.inventoryTab===1){
    const gear=inventoryEquipment(g,meta);
    const value=gear[g.inventoryEquipSel||0];
    return value?{...value,qty:1}:null;
  }
  const stack=g.inventory?.slots?.[g.inventorySel||0];
  return stack?.id&&ITEM_DEFINITIONS[stack.id as ItemId]
    ?{id:stack.id,qty:stack.qty,source:"BACKPACK"}:null;
}

/** The Backpack stays on the LEFT and live Axe/Pet slots stay on the
 * RIGHT. All visual and hit-test coordinates use the same native 320x180
 * viewport; no HTML overlay, emoji, phantom item stacks or remote crafts. */
function fit(s:string,max:number):string {
  while(s.length>0 && textW(s)>max)s=s.slice(0,-1);
  return s;
}
function gearList50(g:any,meta:any,kind:GearCategory):ItemId[] {
  if(kind==="axe")return ownedAxeOptions(g,meta);
  if(kind==="pet")return ownedPetOptions(meta).map(()=>"bingsu" as const);
  return inventoryEquipment(g,meta).map(x=>x.id)
    .filter(id=>!["wood_axe","grandpas_axe","bingsu"].includes(id));
}
function optionKey(id:ItemId):string {
  return id==="grandpas_axe"?"GRAND":id==="wood_axe"?"WOOD":
    id==="ember_torch"?"TORCH":id==="ember_lantern"?"LANTERN":
    id==="timber_pack"?"PACK":id==="warm_boots"?"BOOTS":
    id==="fire_reflector"?"REFL":id==="kindling_bundle"?"KINDLE":
    id==="bingsu"?"BINGSU":"STICK";
}
export function chooseEquipmentCategory50(g:any,meta:any,kind:GearCategory):void {
  g.inventoryTab=1;
  g.inventoryGearType=kind;
  g.inventoryGearPage=0;
  g.inventoryGearChoice=kind==="axe"?equippedAxe(g,meta)
    :kind==="pet"?(equippedPet(meta)?"bingsu":gearList50(g,meta,"pet")[0]||null)
    :gearList50(g,meta,"tools")[0]||null;
  g.inventoryEquipSel=0;
}
export function navigateEquipment50(g:any,meta:any,dx:number,dy:number):void {
  let kind:GearCategory=["axe","pet","tools"].includes(g.inventoryGearType)
    ?g.inventoryGearType:"axe";
  if(dy!==0){
    const categories:GearCategory[]=["axe","pet","tools"];
    kind=categories[(categories.indexOf(kind)+(dy>0?1:2))%3];
    chooseEquipmentCategory50(g,meta,kind);
    return;
  }
  const items=gearList50(g,meta,kind);
  if(!items.length)return;
  const cur=items.indexOf(g.inventoryGearChoice);
  const next=Math.max(0,Math.min(items.length-1,(cur<0?0:cur)+dx));
  g.inventoryGearChoice=items[next];
  g.inventoryEquipSel=next;
  g.inventoryGearPage=Math.floor(next/3);
}
export function activateEquipment50(g:any,meta:any):boolean {
  const kind:GearCategory=g.inventoryGearType||"axe";
  const choice=g.inventoryGearChoice;
  if(kind==="axe"){
    const options=ownedAxeOptions(g,meta);
    if(!options.includes(choice))return false;
    const next=equippedAxe(g,meta)===choice && choice!=="stick"?"stick":choice;
    if(!equipAxe(g,meta,next as AxeId))return false;
    saveMeta(meta);
    return true;
  }
  if(kind==="pet"){
    if(choice!=="bingsu" || !ownedPetOptions(meta).length)return false;
    if(!equipPet(meta,equippedPet(meta)==="dog"?null:"dog"))return false;
    saveMeta(meta);
    return true;
  }
  return false; // quick-slot assignment uses its separate real SLOT buttons
}
function drawSlot50(ctx:any,g:any,meta:any,kind:"axe"|"pet"):void {
  const r=EQUIPMENT_SLOTS50[kind];
  const isActive=g.inventoryTab===1 && (g.inventoryGearType||"axe")===kind;
  block(ctx,r.x,r.y,r.w,r.h,"rgba(27,43,50,0.64)");
  border(ctx,r.x,r.y,r.w,r.h,isActive?"#ecc78e":"#856c51");
  drawText(ctx,kind==="axe"?"AXE":"PET",r.x+4,r.y+3,"#d4b990");
  const id=kind==="axe"?equippedAxe(g,meta):equippedPet(meta)?"bingsu":null;
  if(id)drawInventoryItemIcon(ctx,id as ItemId,r.x+4,r.y+14);
  else drawText(ctx,"-",r.x+10,r.y+19,"#8c9999");
  const label=id?optionKey(id as ItemId):"EMPTY";
  drawText(ctx,fit(label,r.w-23),r.x+20,r.y+18,"#efddbb");
  if(id && id!=="stick")drawText(ctx,"ON",r.x+43,r.y+30,"#a4dcb5");
  g.zones.push({...r,onDown:()=>chooseEquipmentCategory50(g,meta,kind)});
}
function optionChip50(ctx:any,g:any,meta:any,id:ItemId,x:number,y:number,chosen:boolean):void {
  const r={x,y,w:39,h:24};
  block(ctx,x,y,r.w,r.h,chosen?"rgba(113,84,49,0.72)":"rgba(29,45,52,0.65)");
  border(ctx,x,y,r.w,r.h,chosen?"#e6c38b":"#6e746d");
  drawInventoryItemIcon(ctx,id,x+13,y+1);
  drawTextC(ctx,fit(optionKey(id),r.w-3),x+r.w/2,y+16,"#eed9b6");
  g.zones.push({...r,onDown:()=>{
    g.inventoryTab=1;g.inventoryGearChoice=id;
    g.inventoryEquipSel=gearList50(g,meta,g.inventoryGearType||"axe").indexOf(id);
  }});
}
function drawEquipmentPane50(ctx:any,g:any,meta:any):void {
  drawSlot50(ctx,g,meta,"axe");
  drawSlot50(ctx,g,meta,"pet");
  const kind:GearCategory=["axe","pet","tools"].includes(g.inventoryGearType)
    ?g.inventoryGearType:"axe";
  const options=gearList50(g,meta,kind);
  const categoryLabel=kind==="axe"?"CHOOSE AXE":kind==="pet"?"CHOOSE PET":"OTHER GEAR";
  drawText(ctx,categoryLabel,167,91,"#efd39a");
  // The old equipment tab is now an on-demand view within this same
  // right-hand pane: crafted torches are still assignable to Quick Slots.
  actionable(ctx,g,251,88,40,13,kind==="tools"?"BACK":"TOOLS",()=>{
    chooseEquipmentCategory50(g,meta,kind==="tools"?"axe":"tools");
  },kind==="tools");
  const preferred=kind==="axe"?equippedAxe(g,meta)
    :kind==="pet"?(equippedPet(meta)?"bingsu":options[0]||null):options[0]||null;
  if(!options.includes(g.inventoryGearChoice))g.inventoryGearChoice=preferred;
  const index=options.indexOf(g.inventoryGearChoice);
  const page=Math.max(0,Math.min(Math.ceil(options.length/3)-1,
    Math.floor((index<0?0:index)/3)));
  g.inventoryGearPage=page;
  const current=options.slice(page*3,page*3+3);
  if(!options.length) {
    drawText(ctx,kind==="pet"?"UNLOCK BINGSU IN SHOP":"CRAFT GEAR AT BENCH",
      168,111,"#aabbbb");
  }else {
    for(let i=0;i<current.length;i++)
      optionChip50(ctx,g,meta,current[i],168+i*41,104,
        current[i]===g.inventoryGearChoice);
  }
  if(options.length>3){
    // Tiny page controls share the option title row, not the close button.
    actionable(ctx,g,222,88,12,13,"<",()=>navigateEquipment50(g,meta,-1,0));
    actionable(ctx,g,236,88,12,13,">",()=>navigateEquipment50(g,meta,1,0));
  }
  const selected=(options.includes(g.inventoryGearChoice)
    ?g.inventoryGearChoice:null) as ItemId|null;
  if(selected){
    const def=ITEM_DEFINITIONS[selected];
    drawText(ctx,fit(def.name,121),168,132,"#f1d8a9");
    const desc=kind==="axe" ? AXE_STATS[selected as AxeId].description
      :kind==="pet"?"RETRIEVES 2 REAL LOGS"
      :def.description[0];
    drawText(ctx,fit(desc,123),168,140,"#a9c9bd");
  }
  if(kind==="axe" && selected){
    const isOn=equippedAxe(g,meta)===selected;
    const label=isOn?(selected==="stick"?"DEFAULT":"UNEQUIP"):"EQUIP";
    if(label!=="DEFAULT"){
      actionable(ctx,g,EQUIPMENT_ACTION50.x,EQUIPMENT_ACTION50.y,
        EQUIPMENT_ACTION50.w,EQUIPMENT_ACTION50.h,label,
        ()=>activateEquipment50(g,meta),false);
    }else drawText(ctx,"STICK ALWAYS READY",167,153,"#e2cc9e");
  }else if(kind==="pet" && selected){
    actionable(ctx,g,EQUIPMENT_ACTION50.x,EQUIPMENT_ACTION50.y,
      EQUIPMENT_ACTION50.w,EQUIPMENT_ACTION50.h,
      equippedPet(meta)==="dog"?"UNEQUIP":"EQUIP",
      ()=>activateEquipment50(g,meta),false);
  }else if(kind==="tools"&&selected==="ember_torch"){
    // Keep the old direct inventory assignment of the real Ember Torch.
    actionable(ctx,g,168,149,57,15,"SLOT 1",()=>assignQuickSlot(g,0,"ember_torch"),
      g.quickSlots?.[0]==="ember_torch");
    actionable(ctx,g,233,149,57,15,"SLOT 2",()=>assignQuickSlot(g,1,"ember_torch"),
      g.quickSlots?.[1]==="ember_torch");
  }else if(kind==="tools"&&selected)
    drawText(ctx,"OWNED GEAR",168,153,"#abc9b8");
  else if(kind==="pet")
    drawText(ctx,"NO PET EQUIPPED",168,153,"#a2b8b9");
}
export function drawInventoryMenu(ctx:any,g:any,meta:any,close:()=>void):void{
  const {x,y,w,h}=INVENTORY_MODAL;
  g.menuRect={x,y,w,h};
  block(ctx,x,y,w,h,"rgba(13,24,34,0.73)");
  border(ctx,x,y,w,h,"#bd9761");
  block(ctx,x+2,y+2,w-4,h-4,"rgba(31,44,50,0.35)");
  drawText(ctx,"INVENTORY",x+9,y+8,"#ffdf9a");
  const used=occupiedInventorySlots(g),capacity=availableInventorySlots(g,meta);
  drawText(ctx,"SLOTS "+used+"/"+capacity,169,y+8,"#d5c5a6");
  actionable(ctx,g,278,13,16,14,"X",close);
  drawText(ctx,"BACKPACK",29,33,"#e8d09a");
  drawText(ctx,"EQUIPMENT",166,33,"#e8d09a");
  block(ctx,159,32,1,119,"rgba(196,163,112,0.52)");
  const bagLimit=availableInventorySlots(g,meta);
  for(let i=0;i<INVENTORY_GRID_SLOTS;i++){
    const col=i%BAG_GRID.cols,row=Math.floor(i/BAG_GRID.cols);
    const sx=BAG_GRID.x+col*(BAG_GRID.size+BAG_GRID.gap);
    const sy=BAG_GRID.y+row*(BAG_GRID.size+BAG_GRID.gap);
    const locked=i>=bagLimit,item=g.inventory?.slots?.[i];
    block(ctx,sx,sy,22,22,locked?"#222a2e":"rgba(37,52,60,0.72)");
    border(ctx,sx,sy,22,22,g.inventoryTab===0&&g.inventorySel===i
      ?"#e9be78":locked?"#45535b":"#6b756e");
    block(ctx,sx+2,sy+2,18,18,locked?"#242c31":"rgba(53,67,75,0.75)");
    if(locked){
      block(ctx,sx+8,sy+9,6,1,"#59656a");
      block(ctx,sx+10,sy+7,2,1,"#59656a");
    }else if(item && ITEM_DEFINITIONS[item.id as ItemId]){
      drawInventoryItemIcon(ctx,item.id as ItemId,sx+4,sy+3);
      if(item.qty>1){
        const qty=String(item.qty);
        drawText(ctx,qty,sx+20-textW(qty),sy+16,"#ffe5b5");
      }
    }else block(ctx,sx+3,sy+3,1,1,"#51636b");
    if(!locked)g.zones.push({x:sx,y:sy,w:22,h:22,onDown:()=>{
      g.inventoryTab=0;g.inventorySel=i;
    }});
  }
  const bagSelected=inventorySelection({...g,inventoryTab:0},meta);
  if(bagSelected)drawText(ctx,fit(bagSelected.id==="pine_log"
      ?"PINE LOGS: 5-20 FUEL":ITEM_DEFINITIONS[bagSelected.id].name,123),
    29,149,"#e4d3ad");
  else drawText(ctx,"SELECT A SLOT",29,149,"#9fb3b7");
  const weight=carriedWeight(g),limit=carriedWeightLimit(g,meta);
  drawText(ctx,"WEIGHT "+weight+"/"+limit+"KG",29,159,"#d5c29e");
  if(!g.inventoryGearType)g.inventoryGearType="axe";
  drawEquipmentPane50(ctx,g,meta);
}
