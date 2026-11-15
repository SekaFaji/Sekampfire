import { BINGSU, drawBingsuPortrait } from "./bingsu";

/** The Pets tab has its own catalog, separate from permanent Ash upgrades.
 * Every entry must also have a real matching UPGRADES ID. Future pets only
 * need a catalog entry and their own implemented gameplay/upgrade data. */
export type PetCatalogItem = {
  id: string;
  name: string;
  breed: string;
  profileLines: readonly string[];
  drawPortrait: (ctx:any,x:number,y:number,w:number,h:number)=>void;
};
export const PET_CATALOG: readonly PetCatalogItem[] = [
  {
    id: "dog",
    name: BINGSU.name,
    breed: BINGSU.breed,
    profileLines: [
      "SWEET, CALM & LOVING",
      "ALWAYS READY FOR HUGS",
      "RARELY BARKS. STUBBORN",
      "FEARLESSLY LOYAL"
    ],
    drawPortrait: drawBingsuPortrait
  }
];
export function isPetShopItem(id:string):boolean {
  return PET_CATALOG.some(p=>p.id===id);
}
export function selectedPetCatalogItem(g:any, rows: readonly {id:string}[]):PetCatalogItem|null {
  if(g.shopTab!==1 || typeof g.shopPetDetail!=="string")return null;
  const pet=PET_CATALOG.find(p=>p.id===g.shopPetDetail);
  return pet && rows.some(row=>row.id===pet.id) ? pet : null;
}
export function openPetProfile(g:any, id:string, rows:readonly {id:string}[]):boolean {
  if(g.menu!=="shop" || g.shopTab!==1)return false;
  const index=rows.findIndex(row=>row.id===id);
  if(index<0 || !isPetShopItem(id))return false;
  g.shopPetDetail=id;
  g.menuSel=index;
  g.upConfirm=null;
  g.shopVelocity=0;
  return true;
}
export function returnToPetGallery(g:any):boolean {
  if(g.menu!=="shop" || g.shopTab!==1 || !g.shopPetDetail)return false;
  g.shopPetDetail=null;
  g.upConfirm=null;
  g.shopVelocity=0;
  return true;
}
export function switchShopTab(g:any, tab:number):void {
  g.shopTab=Math.max(0,Math.min(2,Math.floor(tab)));
  g.shopPetDetail=null;
  g.menuSel=0;
  g.shopScroll=0;
  g.shopVelocity=0;
  g.upConfirm=null;
}
