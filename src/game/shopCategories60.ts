/** Patch #60: transient Ash Shop category filters.
 * Ownership and prices remain keyed to their real UPGRADES IDs, never the
 * current category or visible tile index. No persistent schema migration. */
export const SHOP_CATEGORIES60=[
  {id:"all",label:"ALL"},
  {id:"survival",label:"SURVIVAL"},
  {id:"equipment",label:"GEAR"},
  {id:"camp",label:"CAMP"}
] as const;
export type ShopCategory60=(typeof SHOP_CATEGORIES60)[number]["id"];
export const SHOP_SIDEBAR60={x:30,y:51,w:50,h:19,gap:3} as const;

/** A full description stays in the fixed details area; square cards only
 * show a short, complete (never clipped) name. */
export const SHOP_TILE_NAME60:Record<string,string>={
  blood:"WARM",flint:"FLINT",pack:"BAG",axe:"AXE",
  blue:"PLANS",scarf:"SCARF",legacy:"LEGACY"
};
export const SHOP_UPGRADE_CATEGORY60:Record<string,Exclude<ShopCategory60,"all">>={
  blood:"survival",flint:"survival",scarf:"survival",
  pack:"equipment",axe:"equipment",
  blue:"camp",legacy:"camp"
};
export function shopCategory60(g:any):ShopCategory60 {
  const value=g?.shopCategory60;
  return SHOP_CATEGORIES60.some(c=>c.id===value)?value:"all";
}
export function visibleShopUpgrades60<T extends {id:string}>(
  items:T[],category:ShopCategory60
):T[] {
  if(category==="all")return items;
  return items.filter(item=>(SHOP_UPGRADE_CATEGORY60[item.id]||"camp")===category);
}
export function chooseShopCategory60(g:any,category:ShopCategory60):void{
  if(!SHOP_CATEGORIES60.some(c=>c.id===category))return;
  if(shopCategory60(g)===category)return;
  g.shopCategory60=category;
  g.menuSel=0;
  g.shopScroll=0;
  g.shopVelocity=0;
  g.upConfirm=null;
  g.shopUpgradeCount58=0; // next render derives the filtered count
}
export function cycleShopCategory60(g:any):ShopCategory60 {
  const index=SHOP_CATEGORIES60.findIndex(c=>c.id===shopCategory60(g));
  const next=SHOP_CATEGORIES60[(index+1)%SHOP_CATEGORIES60.length].id;
  chooseShopCategory60(g,next);
  return next;
}
