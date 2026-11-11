import { drawText, drawTextC, drawTextWrap, textW } from "./font";
import { drawTutorialArt, TUTORIAL_PAGES } from "./tutorial";
import { BINGSU, drawBingsuPortrait } from "./bingsu";
import { drawShopCardIcon51, SHOP_CARD_LABEL51, SHOP_CARD_BENEFIT51, type ShopId51 } from "./shopCards51";
import { SHOP_CARD58,SHOP_VIEW58,SHOP_SCROLLBAR58,clampShopScroll58,shopMaxScroll58 } from "./shopScroll58";

function frame(ctx: any, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "rgba(8,12,26,0.75)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#bb945d";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}
function action(ctx: any, g: any, x: number, y: number, w: number, label: string,
                click: () => void, enabled = true, selected = false) {
  ctx.fillStyle = enabled ? (selected ? "rgba(118,80,43,0.79)" : "rgba(39,58,76,0.61)") : "rgba(33,43,56,0.53)";
  ctx.fillRect(x, y, w, 16);
  ctx.fillStyle = enabled ? "#bb945d" : "#4c5a69";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + 15, w, 1);
  drawTextC(ctx, label, x + w / 2, y + 5, enabled ? "#f9dfa6" : "#68798a");
  if (enabled) g.zones.push({ x, y, w, h: 16, onDown: click });
}
function exit(ctx: any, g: any, close: () => void) {
  action(ctx, g, 278, 13, 17, "X", close);
}
/** A seven-step interactive storyboard using only actual game sprites. */
export function drawIllustratedGuide(ctx: any, g: any, close: () => void) {
  const page = Math.max(0, Math.min(Math.floor(g.helpPage || 0), TUTORIAL_PAGES.length - 1));
  g.helpPage = page;
  const step = TUTORIAL_PAGES[page];
  frame(ctx, 18, 8, 284, 164);
  drawText(ctx, "HOW TO PLAY", 27, 17, "#ffd98a");
  drawText(ctx, (page + 1) + " / " + TUTORIAL_PAGES.length, 234, 17, "#aebcce");
  exit(ctx, g, close);
  drawTutorialArt(ctx, g, page);
  drawTextC(ctx, step.title, 160, 110, "#ffdc91");
  for (let i = 0; i < step.lines.length; i++) {
    drawTextC(ctx, step.lines[i], 160, 120 + i * 8, "#bdc9da");
  }
  action(ctx, g, 29, 150, 57, "BACK",
    () => { g.helpPage = Math.max(0, page - 1); }, page > 0);
  action(ctx, g, 118, 150, 84, "CLOSE", close);
  action(ctx, g, 234, 150, 57, page === TUTORIAL_PAGES.length - 1 ? "DONE" : "NEXT",
    () => { if (page + 1 === TUTORIAL_PAGES.length) close(); else g.helpPage = page + 1; });
}
/** Locked title action with a single pixel-font draw.
 * The 6px padlock and 51px label have separate, nonoverlapping space within
 * the original 74x18 touch target. It only opens the Coming Soon explanation. */
export function drawLockedEndlessButton(ctx: any, g: any, onDown: () => void) {
  const x = 236, y = 85, w = 74, h = 18;
  ctx.fillStyle = "#17202b";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#ad9067";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = "#28313b";
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  // Padlock: shackle, body and keyhole, deliberately left of the label.
  ctx.fillStyle = "#8393a5";
  ctx.fillRect(x + 6, y + 3, 4, 5);
  ctx.fillRect(x + 5, y + 6, 6, 7);
  ctx.fillStyle = "#28313b";
  ctx.fillRect(x + 7, y + 5, 2, 2);
  ctx.fillStyle = "#b5bec7";
  ctx.fillRect(x + 7, y + 9, 2, 2);
  drawText(ctx, "ENDLESS NIGHT", x + 18, y + 7, "#c6ccd2");
  g.zones.push({ x, y, w, h, onDown });
}

/** Scrollable Shop card geometry in the original 320x180 native resolution.
 * The banked balance, three tabs, details pane and separate BUY remain fixed. */
export const SHOP_CARD51=SHOP_CARD58; // Historical alias for card geometry tests.
export const SHOP_DETAILS51 = {x:30,y:119,w:260,h:45} as const;
export const SHOP_BUY51 = {x:210,y:142,w:78,h:18} as const;
/** Native 320x180 layout: the painted bust has 7px horizontal and 3px
 * vertical breathing room inside the original 100x68 bordered pet card. */
export const BINGSU_PET_FIT57 = {
  card:{x:31,y:50,w:100,h:68},
  art:{x:38,y:53,w:86,h:62}
} as const;


function shopBox51(ctx:any,x:number,y:number,w:number,h:number,
  ink:string,edge:string):void {
  ctx.fillStyle=ink;ctx.fillRect(x,y,w,h);
  ctx.fillStyle=edge;
  ctx.fillRect(x,y,w,1);ctx.fillRect(x,y+h-1,w,1);
  ctx.fillRect(x,y,1,h);ctx.fillRect(x+w-1,y,1,h);
}
function compact51(str:string,width:number):string {
  let result=String(str).toUpperCase();
  while(result.length>0&&textW(result)>width)
    result=result.slice(0,-1);
  return result;
}
function bankedAsh51(meta:any):number {
  const n=meta?.ash;
  return typeof n==="number"&&Number.isFinite(n)
    ?Math.max(0,Math.floor(n)):0;
}
function shopCardLabel51(row:any):string {
  return SHOP_CARD_LABEL51[row?.id as ShopId51]||String(row?.label||"UPGRADE").toUpperCase();
}
function selectedShopRow51(g:any,rows:any[]):any|null {
  if(!rows.length)return null;
  const index=Math.max(0,Math.min(rows.length-1,Math.floor(g.menuSel||0)));
  return rows[index]||null;
}
/** Patch #59: one complete square per upgrade, with a distinct illustrated
 * icon above centered name/level/price. The bottom inspector holds the
 * verbose effect explanation, so tiles stay clean and easy to scan. */
function drawShopUpgradeCard51(ctx:any,g:any,row:any,index:number,offset:number):void {
  const c=SHOP_CARD58;
  const x=c.x+(index%c.cols)*(c.w+c.colGap);
  const y=c.y+Math.floor(index/c.cols)*(c.h+c.rowGap)-offset;
  const top=Math.max(y,SHOP_VIEW58.y);
  const bottom=Math.min(y+c.h,SHOP_VIEW58.y+SHOP_VIEW58.h);
  if(bottom<=top)return;
  const selected=index===g.menuSel;
  const owned=!!row?.maxed,affordable=!!row?.canBuy;
  const border=selected?"#eac487":owned?"#83a48e":"#66798a";
  shopBox51(ctx,x,y,c.w,c.h,selected?"rgba(90,67,44,0.78)":
    "rgba(29,46,55,0.76)",border);
  // The small inset grounds each original 14x14 illustrated sprite.
  const insetX=x+Math.floor((c.w-19)/2);
  ctx.fillStyle=selected?"#715536":"#273b43";
  ctx.fillRect(insetX,y+3,19,19);
  ctx.fillStyle=selected?"#d3b57d":"#596d70";
  ctx.fillRect(insetX,y+3,19,1);
  const id=row?.id as ShopId51;
  if(id&&SHOP_CARD_LABEL51[id])
    drawShopCardIcon51(ctx,id,x+Math.floor((c.w-14)/2),y+5);
  else {
    ctx.fillStyle="#9bbac3";ctx.fillRect(x+24,y+9,10,10);
  }
  const title=compact51(shopCardLabel51(row),c.w-6);
  drawTextC(ctx,title,x+c.w/2,y+26,selected?"#fff0ca":"#e6dbbc");
  const max=Math.max(1,Number(row?.max)||1);
  const level=Math.max(0,Number(row?.level)||0);
  drawTextC(ctx,owned?"MAX LEVEL":("LV "+level+"/"+max),
    x+c.w/2,y+37,owned?"#a8d9af":"#b7c4ca");
  const price=owned?"OWNED":typeof row?.cost==="number"
    ?row.cost+" ASH":"";
  drawTextC(ctx,compact51(price,c.w-7),x+c.w/2,y+46,
    owned?"#a8d9af":affordable?"#ebcf91":"#9aa9b4");
  // Slim permanent-level bar stays inside all four square cards.
  ctx.fillStyle="#455759";ctx.fillRect(x+4,y+c.h-5,c.w-8,2);
  if(level>0){
    ctx.fillStyle=owned?"#9cd0a9":"#e0b674";
    ctx.fillRect(x+4,y+c.h-5,
      Math.round((c.w-8)*Math.min(1,level/max)),2);
  }
  // Hit zones are clipped separately so swiping past the visible row can
  // never select hidden tiles or the fixed BUY panel underneath.
  g.zones.push({x,y:top,w:c.w,h:bottom-top,shopCardIndex58:index,onDown:()=>{
    g.menuSel=index;
    g.upConfirm=null;
  }});
}
/** Fixed-height card viewport: Canvas clips moving art before we draw the
 * fixed Shop details. The lightweight fake contexts in tests omit clip();
 * production Canvas always provides it. Interactive zones are still cropped
 * in every context. */
function drawScrollableShop58(ctx:any,g:any,rows:any[]):void {
  const v=SHOP_VIEW58;
  g.shopUpgradeCount58=rows.length;
  const offset=clampShopScroll58(g,rows.length);
  ctx.fillStyle="rgba(16,31,38,0.38)";
  ctx.fillRect(v.x,v.y,v.w,v.h);
  const canClip=typeof ctx.save==="function"&&
    typeof ctx.beginPath==="function"&&typeof ctx.rect==="function"&&
    typeof ctx.clip==="function"&&typeof ctx.restore==="function";
  if(canClip){
    ctx.save();ctx.beginPath();ctx.rect(v.x,v.y,v.w,v.h);ctx.clip();
  }
  for(let i=0;i<rows.length;i++){
    const cardY=SHOP_CARD58.y+Math.floor(i/SHOP_CARD58.cols)*
      (SHOP_CARD58.h+SHOP_CARD58.rowGap)-offset;
    if(cardY+SHOP_CARD58.h<=v.y||cardY>=v.y+v.h)continue;
    drawShopUpgradeCard51(ctx,g,rows[i],i,offset);
  }
  if(canClip)ctx.restore();
  // Neutral track and gold thumb communicate position without arrows/pages.
  const max=shopMaxScroll58(rows.length);
  if(max>0){
    const bar=SHOP_SCROLLBAR58;
    ctx.fillStyle="rgba(62,76,79,0.88)";
    ctx.fillRect(bar.x,bar.y,bar.w,bar.h);
    const thumbH=Math.max(12,Math.round(bar.h*v.h/(v.h+max)));
    const thumbY=bar.y+Math.round((bar.h-thumbH)*offset/max);
    ctx.fillStyle="#d4b17c";ctx.fillRect(bar.x,thumbY,bar.w,thumbH);
  }
}
function drawShopDetails51(ctx:any,g:any,meta:any,rows:any[]):void {
  const d=SHOP_DETAILS51;
  shopBox51(ctx,d.x,d.y,d.w,d.h,"rgba(21,37,44,0.72)","#876e53");
  const selected=selectedShopRow51(g,rows);
  if(!selected){
    drawTextC(ctx,"SELECT AN UPGRADE TO LEARN MORE.",160,137,"#9db1be");
    return;
  }
  const id=selected.id as ShopId51;
  const name=shopCardLabel51(selected);
  drawText(ctx,compact51(name,160),d.x+6,d.y+5,"#ffe4b3");
  const level=Number(selected.level)||0,max=Number(selected.max)||1;
  drawText(ctx,selected.maxed?"MAX LEVEL":"LEVEL "+level+"/"+max+"  NEXT "+(level+1),
    d.x+6,d.y+14,selected.maxed?"#a9dab3":"#b9c7c7");
  const benefit=id==="legacy"?selected.desc:(SHOP_CARD_BENEFIT51[id]||selected.desc||"PERMANENT UPGRADE.");
  drawTextWrap(ctx,String(benefit),d.x+6,d.y+24,164,"#bcd0cb",8);
  const canBuy=!!selected.canBuy && !selected.maxed;
  const price=typeof selected.cost==="number"?selected.cost:0;
  const label=selected.maxed?"OWNED":canBuy?"BUY "+price+" ASH":"NEED "+price+" ASH";
  shopBox51(ctx,SHOP_BUY51.x,SHOP_BUY51.y,SHOP_BUY51.w,SHOP_BUY51.h,
    canBuy?"rgba(100,74,40,0.88)":"rgba(49,55,56,0.66)",
    canBuy?"#e7bb78":"#687178");
  drawTextC(ctx,compact51(label,SHOP_BUY51.w-6),
    SHOP_BUY51.x+SHOP_BUY51.w/2,SHOP_BUY51.y+6,
    canBuy?"#fff0c8":"#a6b0ad");
  if(canBuy)g.zones.push({...SHOP_BUY51,onDown:()=>{
    // Central purchase callback recomputes live ownership and banked Ash,
    // preventing stale-price, double-payment or unexpected pet purchases.
    selected.buy?.();
  }});

}
/** Three native Shop tabs, scrollable illustrated upgrades, one pet portrait
 * card, a details inspector, and a single real BUY button. Selecting a card
 * never calls row.onDown (that historical function had double-tap purchase).
 */
export function drawShopTabs(ctx:any,g:any,meta:any,rows:any[],close:()=>void):void {
  frame(ctx,24,8,272,164);
  drawText(ctx,"ASH SHOP",32,13,"#ffd98a");
  const ash="BANKED "+bankedAsh51(meta)+" ASH";
  drawText(ctx,compact51(ash,134),270-textW(compact51(ash,134)),13,"#e6d2a2");
  exit(ctx,g,close);
  const tab=Math.max(0,Math.min(2,g.shopTab||0));
  for(const [id,label,x] of [[0,"UPGRADES",30],[1,"PETS",116],[2,"COMING SOON",202]] as const)
    action(ctx,g,x,33,82,label,()=>{
      g.shopTab=id;g.menuSel=0;g.shopScroll=0;g.shopVelocity=0;g.upConfirm=null;
    },true,tab===id);
  if(tab===2){
    drawTextC(ctx,"MORE TO DISCOVER",160,78,"#e6cf98");
    drawTextC(ctx,"COMING SOON",160,96,"#aab7ca");
    drawTextC(ctx,"NOTHING TO BUY HERE YET.",160,113,"#8496b2");
  }else if(tab===1){
    // Bingsu has one personal featured card with her authentic Dogo portrait.
    if(rows.length){
      const chosen=(g.menuSel||0)===0;
      // The approved artwork previously drew flush against and over the
      // frame edge. Keep a visible border and even matting all around it.
      // Nearest-neighbor fit preserves the complete 94x68 image, not a crop.
      const card=BINGSU_PET_FIT57.card,art=BINGSU_PET_FIT57.art;
      shopBox51(ctx,card.x,card.y,card.w,card.h,
        "rgba(26,45,52,0.64)",chosen?"#eac487":"#61798b");
      ctx.fillStyle="#455150";
      ctx.fillRect(card.x+2,card.y+2,card.w-4,card.h-4);
      drawBingsuPortrait(ctx,art.x,art.y,art.w,art.h);
      g.zones.push({...card,onDown:()=>{
        g.menuSel=0;g.upConfirm=null;
      }});
      drawText(ctx,"BINGSU",137,56,"#f9e8c7");
      drawText(ctx,"DOGO ARGENTINO",137,66,"#bed2cd");
      drawText(ctx,"SWEET, CALM & LOVING",137,77,"#e6d9ba");
      drawText(ctx,"ALWAYS READY FOR HUGS",137,86,"#e6d9ba");
      drawText(ctx,"RARELY BARKS. STUBBORN",137,95,"#e6d9ba");
      drawText(ctx,"FEARLESSLY LOYAL",137,104,"#e6d9ba");
      drawText(ctx,rows[0].maxed?"OWNED - EQUIP IN BAG":"UNLOCK WITH ASH",
        137,113,rows[0].maxed?"#a7dcb8":"#e6c792");
      g.menuSel=0;
      drawShopDetails51(ctx,g,meta,rows);
    }else{
      drawTextC(ctx,"NO PETS YET.",160,100,"#93aabb");
    }
  }else{
    g.menuSel=Math.max(0,Math.min(rows.length-1,g.menuSel||0));
    drawScrollableShop58(ctx,g,rows);
    drawShopDetails51(ctx,g,meta,rows);
  }
  drawTextC(ctx,tab===1?"OWN PETS FOREVER. EQUIP FROM INVENTORY."
    :"ONLY BANKED ASH CAN BE SPENT.",160,165,"#9dafb9");
}

/** Informational preview only. This is NOT a playable mode or an unlock;
 * the normal campaign Long Night and its finish/continue options are unchanged.
 */
export function drawEndlessNightPreview(ctx: any, g: any, close: () => void) {
  frame(ctx, 24, 8, 272, 164);
  drawText(ctx, "ENDLESS NIGHT", 34, 17, "#ffd98a");
  exit(ctx, g, close);

  ctx.fillStyle = "#182633";
  ctx.fillRect(34, 36, 252, 100);
  ctx.fillStyle = "#5b7689";
  ctx.fillRect(34, 36, 252, 1);

  // A small original moon-and-stars motif fits the existing pixel UI.
  ctx.fillStyle = "#e5d2a5";
  ctx.fillRect(153, 46, 13, 13);
  ctx.fillStyle = "#182633";
  ctx.fillRect(160, 43, 10, 13);
  ctx.fillStyle = "#96b4c5";
  for (const [x, y] of [[135, 53], [185, 57], [147, 65], [177, 47]] as const) {
    ctx.fillRect(x, y, 1, 3);
    ctx.fillRect(x - 1, y + 1, 3, 1);
  }

  drawTextC(ctx, "COMING SOON", 160, 74, "#ffd98a");
  drawTextC(ctx, "A SEPARATE SURVIVAL CHALLENGE.", 160, 92, "#d7e3ea");
  drawTextC(ctx, "KEEP THE CAMPFIRE BURNING.", 160, 102, "#d7e3ea");
  drawTextC(ctx, "SURVIVE AS LONG AS YOU CAN.", 160, 112, "#d7e3ea");
  drawTextC(ctx, "DETAILS STILL BEING PLANNED.", 160, 126, "#93aaba");
  action(ctx, g, 103, 145, 114, "BACK TO MENU", close);
}
