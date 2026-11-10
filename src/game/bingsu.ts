import { drawText, drawTextC } from "./font";

/** Bingsu's profile is original native pixel art, not a claim of a currently
 * implemented combat feature. The existing pet still retrieves two real
 * dropped Pine Logs and uses its historical up.dog purchase key. */
export const BINGSU = {
  name:"BINGSU",
  breed:"DOGO ARGENTINO",
  title:"LOYAL COMPANION",
  motto:"A FRIEND TO THE VERY END.",
  ability:"FETCHES UP TO 2 PINE LOGS.",
} as const;

export function drawBingsuPortrait(ctx:any,x:number,y:number):void {
  const p=(dx:number,dy:number,w:number,h:number,color:string)=>{
    ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,w,h);
  };
  // Framed collectible portrait with snow-white coat, broad head, heavy
  // jaw, dark nose, folded ears, distinctive warm leather collar.
  p(0,0,54,65,"#182834");p(0,0,54,1,"#b3905e");
  p(0,64,54,1,"#77593f");p(0,0,1,65,"#a4855f");
  p(53,0,1,65,"#765944");
  p(3,3,48,59,"#344953");
  p(4,44,46,16,"#293e47");
  p(8,53,38,5,"#24353f");
  p(8,30,38,25,"#bac3c3");
  p(12,33,30,22,"#e8e9e3");
  p(8,41,7,13,"#c0c9c9");
  p(39,41,7,13,"#c0c9c9");
  p(14,48,7,12,"#e7e4dc");
  p(33,48,7,12,"#e7e4dc");
  p(12,33,30,4,"#f2f1e9");
  // Distinctively sturdy chest and deep shoulders.
  p(17,38,21,15,"#f1f0ea");
  p(20,44,15,11,"#e2e6e1");
  // Short folded ears rather than generic upright puppy triangles.
  p(12,10,11,14,"#d4d8d3");
  p(34,10,9,14,"#ced3d0");
  p(15,13,6,9,"#9b9691");
  p(36,13,5,9,"#aaa6a0");
  // Broad Dogo head with big muzzle, dark attentive eyes and black nose.
  p(17,10,22,22,"#e7e9e5");
  p(20,8,16,22,"#f3f2ec");
  p(14,22,29,12,"#e5e8e6");
  p(19,24,19,11,"#f3f0e9");
  p(20,20,3,3,"#35393b");p(33,20,3,3,"#35393b");
  p(21,20,1,1,"#fffdf2");p(34,20,1,1,"#fffdf2");
  p(24,27,9,5,"#34383a");
  p(26,28,5,2,"#22282a");
  p(25,33,8,1,"#777979");
  // Loyal, personal collar (not combat armor).
  p(16,35,27,4,"#a95745");
  p(21,36,17,2,"#d47e63");
  p(28,37,3,4,"#e2c47b");
  // A warm glimmer gives the portrait the same handmade feel as the game.
  p(8,8,3,1,"#5b7480");p(45,8,2,1,"#627d83");
}

export function drawBingsuShopProfile(ctx:any,meta:any):void {
  ctx.fillStyle="rgba(18,36,43,0.90)";
  ctx.fillRect(30,73,260,79);
  ctx.fillStyle="#a2855f";
  ctx.fillRect(30,73,260,1);
  ctx.fillRect(30,151,260,1);
  drawBingsuPortrait(ctx,35,80);
  drawText(ctx,"BINGSU - DOGO ARGENTINO",100,80,"#f6dfae");
  drawText(ctx,"LOYAL. BRAVE. YOUR BEST FRIEND.",100,93,"#e0d5bc");
  drawText(ctx,"HE WOULD RISK EVERYTHING",100,103,"#bfd3c7");
  drawText(ctx,"TO PROTECT HIS OWNER.",100,113,"#bfd3c7");
  drawText(ctx,BINGSU.ability,100,126,"#e3bb88");
  const owned=!!meta?.up?.dog;
  drawText(ctx,owned?"BOND: FOREVER":"A COMPANION WORTH EARNING",100,139,
    owned?"#a5deaa":"#bec4bd");
}
