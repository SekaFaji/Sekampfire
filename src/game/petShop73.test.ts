import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngine, drawMenu, handleKey, handlePointer, closeMenu, shopRows
} from "./game";
import { PET_CATALOG, isPetShopItem, openPetProfile, returnToPetGallery,
  selectedPetCatalogItem, switchShopTab } from "./petShop";
import { BINGSU_PET_FIT57, SHOP_BUY51, SHOP_CARD51 } from "./menuScreens";
import { isShopGridScrollable58, wheelShop58, shopMaxScroll58 } from "./shopScroll58";
import { activePet } from "./companion";
import { loadMeta } from "./save";

let store:Map<string,string>;
beforeEach(()=>{
  store=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(k:string)=>store.get(k)??null,
    setItem:(k:string,v:string)=>store.set(k,String(v)),
    removeItem:(k:string)=>store.delete(k)
  });
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
const meta=()=>({ash:90,totalAsh:90,up:{} as Record<string,number>,
  petEquipped:null as "dog"|null,axeEquipped:"stick",guideFx:true,
  museumBuilt:false,collection:{}});
function world(){
  const g=createEngine();g.ui="run";g.menu="shop";g.shopTab=1;
  g.menuSel=0;g.zones=[];g.keys={};g.pointers={};
  return g;
}
function render(g:any,m:any){
  const rectangles:{x:number;y:number;w:number;h:number;color:string}[]=[];
  let color="";
  const ctx:any={
    get fillStyle(){return color;},
    set fillStyle(v:string){color=v;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      rectangles.push({x,y,w,h,color});
    }
  };
  g.zones=[];drawMenu(ctx,g,m);
  return rectangles;
}
function zone(g:any,x:number,y:number){
  return [...g.zones].reverse().find((z:any)=>
    x>=z.x && x<z.x+z.w && y>=z.y && y<z.y+z.h);
}
function tap(g:any,x:number,y:number){
  const hit=zone(g,x,y);
  expect(hit).toBeDefined();
  hit.onDown?.();
}

describe("Patch #73 - Pets gallery and independent pet preview",()=>{
  it("starts at a pet selection grid with only actually available pets and no BUY hitbox",()=>{
    const g=world(),m=meta();
    expect(PET_CATALOG.map(p=>p.id)).toEqual(["dog"]);
    expect(isPetShopItem("dog")).toBe(true);
    expect(isPetShopItem("future_pet")).toBe(false);
    expect(shopRows(g,m).map((r:any)=>r.id)).toEqual(["dog"]);
    const art=render(g,m);
    const cards=g.zones.filter((z:any)=>z.shopCardIndex58!==undefined);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toEqual(expect.objectContaining({
      x:SHOP_CARD51.x,y:SHOP_CARD51.y,
      w:SHOP_CARD51.w,h:SHOP_CARD51.h
    }));
    expect(art.some(p=>p.color==="#fcf6e8")).toBe(true); // Bingsu portrait thumbnail
    expect(zone(g,SHOP_BUY51.x+6,SHOP_BUY51.y+5)).toBeUndefined();
    expect(g.shopPetDetail).toBeNull();
    expect(m.ash).toBe(90);
  });

  it("tapping a pet thumbnail opens its existing large portrait and explicit BUY without spending",()=>{
    const g=world(),m=meta();
    render(g,m);
    tap(g,106,70);
    expect(g.shopPetDetail).toBe("dog");
    expect(m.ash).toBe(90);
    expect(m.up.dog).toBeUndefined();
    const art=render(g,m);
    expect(art.some(p=>p.x===BINGSU_PET_FIT57.card.x&&p.y===BINGSU_PET_FIT57.card.y&&
      p.w===BINGSU_PET_FIT57.card.w&&p.h===1)).toBe(true);
    expect(zone(g,SHOP_BUY51.x+6,SHOP_BUY51.y+6)).toBeDefined();
    expect(zone(g,57,19)).toBeDefined(); // BACK TO PETS header
    expect(g.zones.some((z:any)=>z.shopCardIndex58!==undefined)).toBe(false);
  });

  it("BACK returns to pet selection without closing Shop, resetting Ash or losing ownership",()=>{
    const g=world(),m=meta();
    render(g,m);tap(g,106,70);render(g,m);
    tap(g,60,19);
    expect(g.shopPetDetail).toBeNull();
    expect(g.menu).toBe("shop");
    expect(g.shopTab).toBe(1);
    expect(g.menuSel).toBe(0);
    expect(m.ash).toBe(90);
    render(g,m);
    expect(zone(g,106,70)).toBeDefined();
    expect(zone(g,SHOP_BUY51.x+5,SHOP_BUY51.y+6)).toBeUndefined();
  });

  it("touch tapping the grid waits until release and cannot accidentally purchase on selection",()=>{
    const g=world(),m=meta();
    render(g,m);
    handlePointer(g,"down",8,106,70);
    expect(g.shopPetDetail).toBeNull();
    expect(m.ash).toBe(90);
    handlePointer(g,"up",8,106,70);
    expect(g.shopPetDetail).toBe("dog");
    render(g,m);
    handlePointer(g,"down",9,64,19);
    expect(g.shopPetDetail).toBeNull();
    expect(g.shopTab).toBe(1);
    expect(g.menu).toBe("shop");
    expect(m.ash).toBe(90);
    handlePointer(g,"up",9,64,19);
  });

  it("only the profile BUY spends 40 banked Ash and unlocks Bingsu, not earned-run Ash",()=>{
    const g=world(),m=meta();
    m.ash=40;
    g.ashEarned=999;
    render(g,m);tap(g,106,70);
    expect(m.ash).toBe(40);
    render(g,m);tap(g,SHOP_BUY51.x+5,SHOP_BUY51.y+5);
    expect(m.ash).toBe(0);
    expect(m.up.dog).toBe(1);
    expect(m.petEquipped).toBe("dog");
    expect(activePet(m)).toBe("dog");
    expect(g.ashEarned).toBe(999);
    expect(loadMeta().up.dog).toBe(1);
    render(g,m);
    expect(zone(g,SHOP_BUY51.x+5,SHOP_BUY51.y+5)).toBeUndefined();
    tap(g,57,19);
    render(g,m);
    expect(g.shopPetDetail).toBeNull();
    expect(shopRows(g,m)[0].maxed).toBe(true);
  });

  it("keyboard Enter opens preview before buying, Escape returns to gallery then closes Shop",()=>{
    const g=world(),m=meta();
    render(g,m);
    handleKey(g,m,"enter",true);
    expect(g.shopPetDetail).toBe("dog");
    expect(m.up.dog).toBeUndefined();
    expect(m.ash).toBe(90);
    render(g,m);
    handleKey(g,m,"escape",true);
    expect(g.shopPetDetail).toBeNull();
    expect(g.menu).toBe("shop");
    handleKey(g,m,"enter",true);
    expect(g.shopPetDetail).toBe("dog");
    handleKey(g,m,"enter",true);
    expect(m.up.dog).toBe(1);
    expect(m.ash).toBe(50);
    handleKey(g,m,"escape",true);
    expect(g.shopPetDetail).toBeNull();
    handleKey(g,m,"escape",true);
    expect(g.menu).toBeNull();
  });

  it("switching tabs resets the preview and top-right X closes the full Shop",()=>{
    const g=world(),m=meta();
    render(g,m);tap(g,106,70);
    expect(g.shopPetDetail).toBe("dog");
    render(g,m);
    tap(g,245,39); // Coming Soon
    expect(g.shopTab).toBe(2);
    expect(g.shopPetDetail).toBeNull();
    render(g,m);tap(g,155,39); // Pets gallery again
    expect(g.shopTab).toBe(1);
    expect(g.shopPetDetail).toBeNull();
    render(g,m);tap(g,106,70);render(g,m);
    tap(g,284,18);
    expect(g.menu).toBeNull();
    expect(g.shopPetDetail).toBeNull();
    expect(m.ash).toBe(90);
  });

  it("supports future pets through the catalog, without creating fake placeholders or purchases",()=>{
    const g=world(),m=meta();
    expect(shopRows(g,m)).toHaveLength(PET_CATALOG.length);
    expect(openPetProfile(g,"not_implemented",shopRows(g,m))).toBe(false);
    expect(openPetProfile(g,"dog",shopRows(g,m))).toBe(true);
    expect(selectedPetCatalogItem(g,shopRows(g,m))?.name).toBe("BINGSU");
    expect(returnToPetGallery(g)).toBe(true);
    expect(g.shopPetDetail).toBeNull();
    expect(isShopGridScrollable58(g)).toBe(true);
    expect(shopMaxScroll58(10)).toBeGreaterThan(0); // same grid accommodates later rows
    expect(wheelShop58(g,20,1)).toBe(true);
    expect(g.shopScroll).toBe(0); // one real pet only
    switchShopTab(g,0);
    expect(isShopGridScrollable58(g)).toBe(true);
    expect(g.shopPetDetail).toBeNull();
    switchShopTab(g,1);
    expect(g.menuSel).toBe(0);
    closeMenu(g);
    expect(g.menu).toBeNull();
  });
});
