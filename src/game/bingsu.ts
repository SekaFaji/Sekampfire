import { drawText, drawTextC } from "./font";

/** Bingsu's profile is original native pixel art, not a claim of a currently
 * implemented combat feature. The existing pet still retrieves two real
 * dropped Pine Logs and uses its historical up.dog purchase key. */
export const BINGSU = {
  name:"BINGSU",
  breed:"DOGO ARGENTINO",
  title:"GENTLE GUARDIAN",
  motto:"A SOFT HEART. FEARLESS LOVE.",
  personality:"SWEET, CALM AND LOVING.",
  affection:"ALWAYS READY FOR A HUG.",
  temperament:"RARELY BARKS. A BIT STUBBORN.",
  loyalty:"SHE'D FIGHT TO THE END FOR YOU.",
  ability:"FETCHES UP TO 2 PINE LOGS.",
} as const;

/** New original 54x65 Dogo Argentino portrait.
 * Reference: uncropped broad naturally drooping ears, imposing but gentle
 * square skull, wide black nose, short white coat and sturdy, deep chest.
 * Face is subtly asymmetrical and calm, not puppy-like or fierce. Neither
 * collar nor harness is drawn; gameplay remains 2-log fetching only. */
export function drawBingsuPortrait(ctx:any,x:number,y:number):void{
  const p=(dx:number,dy:number,w:number,h:number,c:string)=>{
    ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h);
  };
  // 54x65 frame; restrained forest slate background.
  p(0,0,54,65,"#1c3038");
  p(0,0,54,1,"#b3905e");p(0,64,54,1,"#77593f");
  p(0,0,1,65,"#a4855f");p(53,0,1,65,"#765944");
  p(3,3,48,59,"#304751");
  p(4,48,46,13,"#273c44");p(9,59,36,2,"#1b2c33");

  // Broad shoulders and deep chest, clearly a muscular ADULT dog.
  p(6,43,43,15,"#aabbb9");
  p(8,40,39,18,"#cfdbd8");
  p(9,39,36,18,"#e9eeea");
  p(12,38,29,19,"#fbfaf2");
  p(8,45,8,11,"#bacbc8");p(40,45,6,12,"#b9c7c5");
  p(17,43,22,13,"#f4f5ef");
  p(22,45,13,11,"#fffdf6");
  // Front legs are far apart and planted, never tiny puppy feet.
  p(10,50,12,12,"#c4d2d0");p(12,48,9,13,"#f1f3ed");
  p(33,50,12,12,"#bfcfcf");p(33,48,10,13,"#eef1e9");
  p(10,60,14,2,"#98a6a4");p(32,60,13,2,"#9eafac");
  p(14,58,7,2,"#f8f8f1");p(33,58,8,2,"#f8f8f1");

  // Muscular white throat naturally continues from the cheek, collar-free.
  p(14,30,28,17,"#c4d1cf");
  p(16,30,25,18,"#ecf0eb");
  p(19,33,19,17,"#fffef7");
  p(14,39,5,8,"#d9e2df");p(38,40,5,8,"#cbd9d5");

  // Uncropped natural ears hang beside the head, left and right not cloned.
  p(9,12,11,18,"#b2c2c1");p(10,14,8,17,"#e9eae4");
  p(12,18,5,11,"#c8d2ce");p(10,26,5,4,"#9faeae");
  p(37,11,9,19,"#aabdbc");p(39,13,8,16,"#e2e9e5");
  p(42,19,4,10,"#c1cdcb");p(42,27,5,3,"#a9b9b8");

  // Broad, strong skull, angular temples and relaxed forehead.
  p(17,8,21,4,"#c7d4d2");
  p(15,11,26,21,"#b6c6c4");
  p(17,10,24,21,"#e7eeea");
  p(19,9,20,21,"#fafaf4");
  p(16,17,26,14,"#e4eae7");
  p(17,18,24,13,"#f7f7f0");
  p(20,12,17,7,"#fffdf5");
  // Brow ridge and almond eyes instead of huge circular cartoon eyes.
  p(17,20,8,2,"#d9dcd5");p(33,19,7,2,"#cbd6d1");
  p(20,22,4,2,"#9d928b");p(21,22,2,2,"#343537");
  p(34,21,4,2,"#afa19a");p(35,22,2,1,"#353638");
  p(21,22,1,1,"#f8f8f1");p(35,21,1,1,"#fafaf4");
  p(18,24,7,2,"#e9e4df");p(33,24,6,2,"#e4e6e1");

  // Thick jowls and the wide, adult Dogo muzzle. Soft pale freckling,
  // black nose with two nostrils and a closed, relaxed mouth.
  p(14,27,28,12,"#c4d2ce");
  p(16,27,26,12,"#e5ebe7");
  p(19,27,21,13,"#f7f7ef");
  p(16,31,8,9,"#e4e8e2");p(34,31,7,9,"#e1e5df");
  p(20,32,18,9,"#fffdf5");
  p(22,27,16,7,"#c5cfcc");
  p(22,28,16,6,"#666a68");
  p(24,28,12,5,"#303537");
  p(25,29,3,2,"#191f22");p(33,29,2,2,"#191f22");
  p(28,31,4,2,"#454a4a");
  p(20,33,3,2,"#e4d4c7");p(37,33,2,2,"#d7cdc3");
  p(28,35,2,4,"#adb4ae");p(25,39,10,1,"#9eaaa4");
  p(27,40,6,2,"#c7d3cc");
  // Tiny fur highlights; no blush/angry snarl/visible teeth.
  p(20,14,7,2,"#fffef7");p(34,14,4,2,"#fffef7");
  p(14,36,3,3,"#f5f7ef");p(40,37,2,3,"#e9efeb");
}

export function drawBingsuShopProfile(ctx:any,meta:any):void {
  ctx.fillStyle="rgba(18,36,43,0.90)";
  ctx.fillRect(30,73,260,79);
  ctx.fillStyle="#a2855f";
  ctx.fillRect(30,73,260,1);
  ctx.fillRect(30,151,260,1);
  drawBingsuPortrait(ctx,35,80);
  drawText(ctx,"BINGSU - DOGO ARGENTINO",100,80,"#f6dfae");
  drawText(ctx,BINGSU.personality,100,93,"#e0d5bc");
  drawText(ctx,BINGSU.temperament,100,103,"#bfd3c7");
  drawText(ctx,BINGSU.loyalty,100,113,"#bfd3c7");
  drawText(ctx,BINGSU.ability,100,126,"#e3bb88");
  const owned=!!meta?.up?.dog;
  drawText(ctx,owned?"BOND: FOREVER":"A COMPANION WORTH EARNING",100,139,
    owned?"#a5deaa":"#bec4bd");
}
