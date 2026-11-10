/** Native pixel icons and verified benefits for permanent Ash cards.
 * Every shop item keeps its original UPGRADES ID, cap and cost in config.ts.
 * No emoji, offscreen scaled image, extra Ash resource or invented effect.
 */
export type ShopId51 = "blood"|"flint"|"pack"|"axe"|"blue"|"scarf"|"dog";
export const SHOP_CARD_LABEL51:Record<ShopId51,string>={
  blood:"WARM BLOOD",
  flint:"OLD FLINT",
  pack:"BACKPACK",
  axe:"GRANDPA AXE",
  blue:"BLUEPRINTS",
  scarf:"WARM SCARF",
  dog:"BINGSU"
};
export const SHOP_CARD_BENEFIT51:Record<ShopId51,string>={
  blood:"COLD DRAINS WARMTH MORE SLOWLY.",
  flint:"BEGIN EACH RUN WITH THE FIRE LIT.",
  pack:"PERMANENTLY CARRY 8 MORE PINE LOGS.",
  axe:"PERMANENT STRONGER CHOPPING AXE.",
  blue:"ALL BUILDINGS COST 20 PERCENT LESS.",
  scarf:"EMBER TORCH LASTS 50S, NOT 30S.",
  dog:"SHE FETCHES UP TO TWO REAL PINE LOGS."
};
export function drawShopCardIcon51(ctx:any,id:ShopId51,x:number,y:number):void{
  const p=(a:number,b:number,w:number,h:number,c:string)=>{
    if(w<=0||h<=0)return;
    ctx.fillStyle=c;ctx.fillRect(x+a,y+b,w,h);
  };
  if(id==="blood"){
    // Double-lobed pixel heart, pale pulse in its center.
    p(1,2,4,4,"#cc5e61");p(7,2,4,4,"#cc5e61");
    p(0,4,12,5,"#ad414d");p(2,9,8,2,"#ad414d");p(4,11,4,2,"#bd5455");
    p(2,5,2,1,"#ffd6bb");p(4,7,2,1,"#ffd6bb");p(6,6,2,1,"#ffd6bb");
  }else if(id==="flint"){
    p(4,8,8,3,"#9b8f7c");p(7,6,5,3,"#d0c7b2");
    p(2,4,3,6,"#df854b");p(3,1,3,6,"#f9c866");
    p(4,0,1,3,"#ffefad");p(1,8,2,2,"#ffb856");
  }else if(id==="pack"){
    p(2,3,9,10,"#674d37");p(3,1,7,3,"#bd9262");
    p(3,4,7,9,"#bd905d");p(4,5,5,7,"#d6ac71");
    p(5,7,3,3,"#765139");p(1,5,2,6,"#513d34");
    p(10,5,2,6,"#513d34");p(4,2,5,1,"#f2d5a0");
  }else if(id==="axe"){
    p(6,1,2,13,"#69492e");p(7,2,1,10,"#b89662");
    p(1,1,7,3,"#c5d2d4");p(0,3,8,4,"#8fa5ab");
    p(1,2,3,1,"#f4f1e5");p(0,5,4,1,"#dde6e2");
    p(5,8,4,2,"#a98d62");
  }else if(id==="blue"){
    p(2,1,9,12,"#b3d9d6");p(3,2,7,10,"#e7e0bd");
    p(4,4,5,1,"#729596");p(4,7,5,1,"#729596");
    p(4,10,3,1,"#729596");p(8,10,1,1,"#729596");
    p(1,1,2,12,"#658589");
  }else if(id==="scarf"){
    p(3,2,7,4,"#8cb2ae");p(2,4,9,4,"#c5dcce");
    p(2,6,4,7,"#7ca7a4");p(5,8,3,4,"#a6c7be");
    p(3,10,1,3,"#dbe9d7");p(5,12,1,1,"#dbe9d7");
  }else if(id==="dog"){
    p(1,5,8,5,"#cdd8d6");p(2,4,8,5,"#f7f6ed");
    p(8,2,4,6,"#e9ede8");p(9,1,2,3,"#b5c3c3");
    p(11,6,1,1,"#333d3e");p(9,5,1,1,"#333d3e");
    p(2,9,2,4,"#c3d0d0");p(7,9,2,4,"#b5c6c6");
    p(0,4,3,2,"#dce4e0");
  }
}
