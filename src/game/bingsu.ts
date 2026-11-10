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

/** Native 54x65 portrait of Bingsu, our female Dogo Argentino.
 * Broad white muscular shoulders, strong neck, square muzzle, dark nose,
 * short folded ears and calm eyes. Naturally collar-free, no red band or tag.
 * Original rectangles, not an image import or an enlarged emoji. */
export function drawBingsuPortrait(ctx:any,x:number,y:number):void {
  const p=(dx:number,dy:number,w:number,h:number,color:string)=>{
    ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,w,h);
  };
  // Collectible-sized frame, cool backdrop and subtle ground.
  p(0,0,54,65,"#182834");
  p(0,0,54,1,"#b3905e");p(0,64,54,1,"#77593f");
  p(0,0,1,65,"#a4855f");p(53,0,1,65,"#765944");
  p(3,3,48,59,"#344953");
  p(4,48,46,12,"#263941");
  p(8,58,38,3,"#20313a");
  // Wide, unmistakably powerful Dogo chest and shoulders.
  p(8,36,38,20,"#9caeb1");
  p(10,34,34,23,"#d4dddb");
  p(12,35,30,23,"#eff0e9");
  p(15,34,24,22,"#f8f8f1");
  p(11,42,6,17,"#d8e0dd");
  p(37,42,6,17,"#c4d2d1");
  // Sturdy front legs and natural separated paws.
  p(13,48,9,13,"#d2dcd9");
  p(15,46,7,15,"#f3f4ee");
  p(32,48,9,13,"#c7d4d3");
  p(32,46,7,15,"#e9eeeb");
  p(14,59,9,2,"#8c9999");
  p(32,59,9,2,"#9ba9a8");
  // Neck is white, muscular and fully unadorned.
  p(14,26,26,17,"#ced9d6");
  p(17,26,21,19,"#f5f6ef");
  p(19,33,16,13,"#fffef8");
  // Natural folded ears, not fox ears or giant triangles.
  p(11,12,10,15,"#b4c0bf");
  p(13,12,7,14,"#e4e9e5");
  p(35,12,10,15,"#a7b6b6");
  p(36,12,7,13,"#e1e8e5");
  p(12,16,3,8,"#909999");
  p(40,16,3,8,"#9ba5a4");
  // Heavy white brow and square head shape.
  p(17,9,20,5,"#c6d2d0");
  p(17,11,22,19,"#e7eae5");
  p(20,9,16,18,"#f8f8f1");
  p(16,16,25,16,"#d4dfdc");
  p(18,16,22,18,"#f3f5ee");
  p(20,13,17,6,"#fafaf4");
  // Cheek and broad strong jaws; dark eyes sit under brows.
  p(15,23,7,12,"#d7e0dc");
  p(34,23,7,12,"#cad7d5");
  p(18,25,20,13,"#e1e8e3");
  p(20,25,16,13,"#f5f4ed");
  p(19,20,4,2,"#d2d7d2");
  p(33,20,4,2,"#c9d1cd");
  p(20,22,3,2,"#303839");
  p(33,22,3,2,"#303839");
  p(20,22,1,1,"#fafaf7");
  p(33,22,1,1,"#fafaf7");
  // Recognizable strong Dogo muzzle, broad black nose, closed gentle mouth.
  p(20,27,17,10,"#f6f5ee");
  p(23,30,12,7,"#e6e8e3");
  p(23,28,11,5,"#4d5555");
  p(25,29,7,3,"#252e30");
  p(26,32,1,3,"#737b77");
  p(27,36,6,1,"#a6b0aa");
  // Tiny glints emphasize calm rather than aggressive expression.
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
  drawText(ctx,"SHE WOULD RISK EVERYTHING",100,103,"#bfd3c7");
  drawText(ctx,"TO PROTECT HER OWNER.",100,113,"#bfd3c7");
  drawText(ctx,BINGSU.ability,100,126,"#e3bb88");
  const owned=!!meta?.up?.dog;
  drawText(ctx,owned?"BOND: FOREVER":"A COMPANION WORTH EARNING",100,139,
    owned?"#a5deaa":"#bec4bd");
}
