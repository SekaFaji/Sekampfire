/** Patch #58 - one source of truth for the Ash Shop's scroll geometry,
 * transient scroll motion and keyboard selection. No save schema changes.
 * Only the upgrade cards scroll; tabs, Bingsu, banked Ash and BUY are fixed. */
/** Patch #60: sidebar occupies x30..79, compact grid x86..264.
 * 2 x 41px tiles with a 3px gap fit completely at y51..135.
 * The separate details and BUY inspector begins at y138. */
export const SHOP_VIEW58={x:85,y:51,w:188,h:85} as const;
export const SHOP_CARD58={x:86,y:51,w:41,h:41,colGap:5,rowGap:3,cols:4} as const;
export const SHOP_SCROLLBAR58={x:270,y:53,w:2,h:81} as const;
const STEP=SHOP_CARD58.h+SHOP_CARD58.rowGap;
export function shopMaxScroll58(count:number):number{
 const n=Number.isFinite(count)?Math.max(0,Math.floor(count)):0;
 const rows=Math.ceil(n/SHOP_CARD58.cols);
 return Math.max(0,rows*SHOP_CARD58.h+Math.max(0,rows-1)*SHOP_CARD58.rowGap-SHOP_VIEW58.h);
}
export function clampShopScroll58(g:any,count:number):number{
 const value=Number(g.shopScroll)||0;
 const next=Math.max(0,Math.min(shopMaxScroll58(count),Number.isFinite(value)?value:0));
 g.shopScroll=next;
 return next;
}
/** Free-scroll, without changing selection or spending Ash. */
export function moveShopScroll58(g:any,delta:number,count:number):number{
 if(!Number.isFinite(delta))return clampShopScroll58(g,count);
 g.shopScroll=(Number(g.shopScroll)||0)+delta;
 return clampShopScroll58(g,count);
}
/** Keyboard navigation keeps each selected card completely in the viewport.
 * An intentional keyboard selection cancels inertia, not ownership. */
export function revealShopCard58(g:any,index:number,count:number):void{
 if(count<=0)return;
 const safe=Math.max(0,Math.min(count-1,Math.floor(index)||0));
 const y=Math.floor(safe/SHOP_CARD58.cols)*STEP;
 const scroll=clampShopScroll58(g,count);
 if(y<scroll)g.shopScroll=y;
 else if(y+SHOP_CARD58.h>scroll+SHOP_VIEW58.h)
   g.shopScroll=y+SHOP_CARD58.h-SHOP_VIEW58.h;
 clampShopScroll58(g,count);
 g.shopVelocity=0;
}
/** Applies a gentle momentum tail while the Shop is open, not the game
 * simulation. Exponentially decays speed and respects hard scroll bounds. */
export function tickShopScroll58(g:any,dt:number,count:number):void{
 if(!Number.isFinite(dt)||dt<=0||g.shopTab!==0||g.menu!=="shop")return;
 const speed=Number(g.shopVelocity)||0;
 if(!Number.isFinite(speed)||Math.abs(speed)<0.2){
   g.shopVelocity=0;clampShopScroll58(g,count);return;
 }
 const duration=Math.min(0.05,dt);
 const moved=moveShopScroll58(g,speed*duration,count);
 const max=shopMaxScroll58(count);
 g.shopVelocity=moved===0&&speed<0||moved===max&&speed>0
   ?0:speed*Math.exp(-duration*12);
}
/** Clamp and scale native wheel deltas in logical game pixels. */
export function wheelShop58(g:any,delta:number,count:number):boolean{
 if(g.menu!=="shop"||g.shopTab!==0||!Number.isFinite(delta))return false;
 g.shopVelocity=0;
 moveShopScroll58(g,Math.max(-48,Math.min(48,delta)),count);
 return true;
}
export function insideShopViewport58(x:number,y:number):boolean{
 return x>=SHOP_VIEW58.x&&x<SHOP_VIEW58.x+SHOP_VIEW58.w&&
   y>=SHOP_VIEW58.y&&y<SHOP_VIEW58.y+SHOP_VIEW58.h;
}
