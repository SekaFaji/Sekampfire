/** Native pixel icons and verified benefits for permanent Ash cards.
 * Every Shop item uses its real UPGRADES ID, cap and price in config.ts.
 * No emoji, offscreen scaled image, extra Ash resource or invented effect.
 */
export type ShopId51 = "blood"|"flint"|"pack"|"axe"|"blue"|"scarf"|"dog"|"legacy"|"hearth"|"fence"|"workshop"|"storage"|"firecap";
export const SHOP_CARD_LABEL51:Record<ShopId51,string>={
  blood:"WARM BLOOD",
  flint:"OLD FLINT",
  pack:"BACKPACK",
  axe:"GRANDPA AXE",
  blue:"BLUEPRINTS",
  scarf:"WARM SCARF",
  dog:"BINGSU",
  legacy:"CAMP LEGACY",
  hearth:"HEARTH MASTERY",
  fence:"FENCE REINFORCEMENT",
  workshop:"WORKSHOP MASTERY",
  storage:"STORAGE MASTERY",
  firecap:"FIRE CAPACITY"
};
export const SHOP_CARD_BENEFIT51:Record<ShopId51,string>={
  blood:"LESS COLD WARMTH DRAIN EACH LEVEL.",
  flint:"BEGIN EACH RUN WITH THE FIRE LIT.",
  pack:"EACH LEVEL ADDS 5KG. MAX +25KG.",
  axe:"PERMANENT STRONGER CHOPPING AXE.",
  blue:"ALL BUILDINGS COST 20 PERCENT LESS.",
  scarf:"+15 COLD PROTECTION. SLOWS WARMTH LOSS.",
  dog:"SHE FETCHES 2 LOGS AND WARMS YOU NEARBY.",
  legacy:"AUTO-BUILD LOG PILE, WORKBENCH AND FENCES ON NEW RUNS.",
  hearth:"START NEW RUNS WITH FIREPLACE STATION TIERS.",
  fence:"COLD PROTECTION SLOWS WARMTH LOSS INSIDE FENCES.",
  workshop:"START NEW RUNS WITH WORKBENCH STATION TIERS.",
  storage:"START NEW RUNS WITH STORAGE STATION TIERS.",
  firecap:"+50 MAX FIRE FUEL PER LEVEL. LEVEL 8 HOLDS 500."
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
  }else if(id==="legacy"){
    // Small wooden homestead with two clear palisade posts and a roof.
    p(1,5,2,9,"#62432f");p(10,5,2,9,"#62432f");
    p(1,3,2,10,"#bb9161");p(10,3,2,10,"#bb9161");
    p(3,7,7,6,"#7b5637");p(4,8,5,5,"#ad8255");
    p(2,6,9,2,"#5b3c2c");p(4,3,5,3,"#b88b57");
    p(5,1,3,3,"#d7aa70");p(5,9,2,4,"#453629");
    p(3,13,7,1,"#9ba68f");
  }else if(id==="hearth"){
    // A real warm fireplace bowl and visible flame.
    p(1,8,11,5,"#72513a");p(2,6,9,3,"#a77e55");
    p(3,3,7,4,"#ef913f");p(5,0,3,6,"#ffda7b");
    p(5,8,3,3,"#ffbe61");p(2,12,9,2,"#49382c");
  }else if(id==="fence"){
    // Twin palisade stakes joined by a visible timber crossbeam.
    p(2,2,3,12,"#a78056");p(8,2,3,12,"#a78056");
    p(3,0,1,2,"#e3c18a");p(9,0,1,2,"#e3c18a");
    p(1,5,11,2,"#73513b");p(1,10,11,2,"#73513b");
    p(3,4,1,9,"#e0b67b");p(9,4,1,9,"#e0b67b");
  }else if(id==="workshop"){
    // Hammer over a sturdy woodworking block.
    p(3,1,8,3,"#b8ccd0");p(4,0,6,1,"#f0e4c8");
    p(6,3,2,7,"#856346");p(2,9,9,3,"#a87d52");
    p(3,12,2,2,"#665039");p(9,12,2,2,"#665039");
  }else if(id==="storage"){
    // Three neatly piled logs with warm end-grain rings.
    p(2,3,9,4,"#78543d");p(3,2,7,4,"#b48454");
    p(1,8,6,5,"#926847");p(7,8,5,5,"#926847");
    p(2,9,3,3,"#d6ab72");p(8,9,3,3,"#d6ab72");
    p(3,10,1,1,"#895f42");p(9,10,1,1,"#895f42");
  }else if(id==="firecap"){
    // Larger fire bowl, capped glowing flame and an extra fuel reservoir.
    p(1,9,12,4,"#73513b");p(2,8,10,2,"#a17a58");
    p(4,4,6,5,"#ed853e");p(6,1,2,7,"#ffe08f");
    p(6,10,2,2,"#ffd58a");
    p(1,13,3,1,"#54402e");p(10,13,3,1,"#54402e");
  }else if(id==="dog"){
    p(1,5,8,5,"#cdd8d6");p(2,4,8,5,"#f7f6ed");
    p(8,2,4,6,"#e9ede8");p(9,1,2,3,"#b5c3c3");
    p(11,6,1,1,"#333d3e");p(9,5,1,1,"#333d3e");
    p(2,9,2,4,"#c3d0d0");p(7,9,2,4,"#b5c6c6");
    p(0,4,3,2,"#dce4e0");
  }
}
