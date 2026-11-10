import { drawText, drawTextC, textW } from "./font";
import { INVENTORY_GRID_SLOTS, ITEM_DEFINITIONS, type ItemId,
  availableInventorySlots, occupiedInventorySlots, carriedWeight,
  carriedWeightLimit, inventoryEquipment } from "./inventory";

export const INVENTORY_MODAL = {x:18,y:8,w:284,h:164} as const;
export const BAG_GRID = {x:29,y:53,cols:5,rows:4,size:22,gap:3} as const;

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
  block(ctx,x,y,w,h,active?"#685139":"#29394a");
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
  }else if(id==="wood_axe"){
    p(5,1,2,10,"#70462d");
    p(6,2,1,8,"#c8935e");
    p(2,1,6,2,"#718b96");
    p(1,2,7,3,"#b3c7c7");
    p(2,4,5,2,"#819ea5");
    p(1,3,1,2,"#dce2d7");
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

/** MMO-like item grid, source-of-truth slots + separate equipped gear page.
 * It is read-only by design for this migration patch; the world remains the
 * place to store, craft and use resources. Interactive selection reveals real
 * details without duplicating crafting actions or spending wood remotely. */
export function drawInventoryMenu(ctx:any,g:any,meta:any,close:()=>void):void{
  const {x,y,w,h}=INVENTORY_MODAL;
  g.menuRect={x,y,w,h};
  block(ctx,x,y,w,h,"rgba(13,24,34,0.97)");
  border(ctx,x,y,w,h,"#bd9761");
  block(ctx,x+2,y+2,w-4,h-4,"rgba(31,44,50,0.92)");
  drawText(ctx,"INVENTORY",x+9,y+8,"#ffdf9a");
  const used=occupiedInventorySlots(g),capacity=availableInventorySlots(g,meta);
  const header=g.inventoryTab===1?"EQUIPPED":"SLOTS "+used+"/"+capacity;
  drawText(ctx,header,192,y+8,"#d5c5a6");
  actionable(ctx,g,278,13,16,14,"X",close);
  actionable(ctx,g,27,29,76,15,"BACKPACK",()=>{
    g.inventoryTab=0;g.inventorySel=0;
  },g.inventoryTab!==1);
  actionable(ctx,g,111,29,89,15,"EQUIPMENT",()=>{
    g.inventoryTab=1;g.inventoryEquipSel=0;
  },g.inventoryTab===1);

  const equipment=inventoryEquipment(g,meta);
  const bagLimit=availableInventorySlots(g,meta);
  const selectedIndex=g.inventoryTab===1?(g.inventoryEquipSel||0):(g.inventorySel||0);
  for(let i=0;i<INVENTORY_GRID_SLOTS;i++){
    const col=i%BAG_GRID.cols,row=Math.floor(i/BAG_GRID.cols);
    const sx=BAG_GRID.x+col*(BAG_GRID.size+BAG_GRID.gap);
    const sy=BAG_GRID.y+row*(BAG_GRID.size+BAG_GRID.gap);
    const locked=g.inventoryTab!==1&&i>=bagLimit;
    const item=g.inventoryTab===1?equipment[i]:g.inventory?.slots?.[i];
    block(ctx,sx,sy,22,22,locked?"#222a2e":"#25343c");
    border(ctx,sx,sy,22,22,selectedIndex===i?"#e9be78":locked?"#45535b":"#6b756e");
    block(ctx,sx+2,sy+2,18,18,locked?"#242c31":"#35434b");
    if(locked){
      block(ctx,sx+8,sy+9,6,1,"#59656a");
      block(ctx,sx+10,sy+7,2,1,"#59656a");
    }else if(item){
      const id=item.id as ItemId;
      if(ITEM_DEFINITIONS[id]){
        drawInventoryItemIcon(ctx,id,sx+4,sy+3);
        const qty=g.inventoryTab===1?1:item.qty;
        if(qty>1){
          const count=String(qty);
          drawText(ctx,count,sx+20-textW(count),sy+16,"#ffe5b5");
        }
      }
    }else{
      block(ctx,sx+3,sy+3,1,1,"#51636b");
    }
    if(!locked){
      g.zones.push({x:sx,y:sy,w:22,h:22,onDown:()=>{
        if(g.inventoryTab===1)g.inventoryEquipSel=i;
        else g.inventorySel=i;
      }});
    }
  }

  // Selection pane stays fully within the modal; original pixel item
  // silhouettes look substantially larger here without smoothing.
  const detailsX=166;
  block(ctx,detailsX,49,125,102,"#202d36");
  border(ctx,detailsX,49,125,102,"#776a55");
  const selected=inventorySelection(g,meta);
  if(selected){
    const item=ITEM_DEFINITIONS[selected.id];
    drawInventoryItemIcon(ctx,selected.id,detailsX+7,56,2);
    drawText(ctx,item.name,detailsX+37,56,"#f1dcac");
    drawText(ctx,item.category.toUpperCase(),detailsX+37,66,"#a9c9c0");
    const quantity="QTY "+selected.qty;
    drawText(ctx,quantity,detailsX+7,87,"#dbc2a0");
    for(let i=0;i<item.description.length;i++){
      drawText(ctx,item.description[i],detailsX+7,101+i*9,"#bdccd0");
    }
    if(g.inventoryTab===0){
      drawText(ctx,"WEIGHT "+item.weight+"/EA",detailsX+7,137,"#b9ab93");
    }else{
      drawText(ctx,selected.source,detailsX+7,137,"#dfc390");
    }
  }else{
    drawText(ctx,g.inventoryTab===1?"NO GEAR SELECTED":"EMPTY SLOT",detailsX+9,61,"#e1cda5");
    drawText(ctx,g.inventoryTab===1?"CRAFT AT WORKBENCH":"SELECT AN ITEM",detailsX+9,79,"#98aeb5");
    drawText(ctx,"TO SEE DETAILS",detailsX+9,89,"#98aeb5");
  }

  const weight=carriedWeight(g),maxWeight=carriedWeightLimit(g,meta);
  drawText(ctx,"WEIGHT "+weight+"/"+maxWeight,29,158,"#d5c29e");
  drawText(ctx,"PINE LOGS STACK",166,158,"#a3b4b7");
}
