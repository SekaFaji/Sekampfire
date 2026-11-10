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
  loyalty:"SHE'D FIGHT TO THE DEATH FOR YOU.",
  ability:"FETCHES UP TO 2 PINE LOGS.",
} as const;

/** Compact illustrated head-and-chest portrait, three-quarter view.
 * No full-body pixel polygon reconstruction. The game-world sprite is
 * intentionally a separate renderer and remains exactly unchanged. */
export { BINGSU_PORTRAIT55 } from "./bingsuPortrait55";
import { drawBingsuPortrait55 } from "./bingsuPortrait55";
export function drawBingsuPortrait(ctx:any,x:number,y:number):void {
  drawBingsuPortrait55(ctx,x,y);
}

export function drawBingsuShopProfile(ctx:any,meta:any):void {
  ctx.fillStyle="rgba(18,36,43,0.90)";
  ctx.fillRect(30,73,260,79);
  ctx.fillStyle="#a2855f";
  ctx.fillRect(30,73,260,1);
  ctx.fillRect(30,151,260,1);
  // Character close-up stays inside the original 260x79 profile panel.
  drawBingsuPortrait(ctx,34,78);
  drawText(ctx,"BINGSU - DOGO ARGENTINO",130,80,"#f6dfae");
  drawText(ctx,BINGSU.personality,130,92,"#e0d5bc");
  drawText(ctx,BINGSU.affection,130,101,"#bfd3c7");
  drawText(ctx,BINGSU.temperament,130,110,"#bfd3c7");
  drawText(ctx,"FEARLESSLY LOYAL.",130,119,"#bfd3c7");
  drawText(ctx,BINGSU.ability,130,130,"#e3bb88");
  const owned=!!meta?.up?.dog;
  drawText(ctx,owned?"BOND: FOREVER":"A COMPANION TO LOVE",130,141,
    owned?"#a5deaa":"#bec4bd");
}
