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

/** Bingsu's Pet Shop image is now a full-body native-pixel illustration,
 * with proportions taken directly from the user's supplied photograph. The
 * compact world companion sprite is a different renderer and stays intact.
 */
export { BINGSU_PORTRAIT54 } from "./bingsuPortrait54";
import { drawBingsuPortrait54 } from "./bingsuPortrait54";
export function drawBingsuPortrait(ctx:any,x:number,y:number):void {
  drawBingsuPortrait54(ctx,x,y);
}

export function drawBingsuShopProfile(ctx:any,meta:any):void {
  ctx.fillStyle="rgba(18,36,43,0.90)";
  ctx.fillRect(30,73,260,79);
  ctx.fillStyle="#a2855f";
  ctx.fillRect(30,73,260,1);
  ctx.fillRect(30,151,260,1);
  // Wide full-body portrait has its own shallow, photo-like landscape frame.
  drawBingsuPortrait(ctx,34,80);
  drawText(ctx,"BINGSU - DOGO ARGENTINO",165,80,"#f6dfae");
  drawText(ctx,"SWEET, CALM & LOVING.",165,92,"#e0d5bc");
  drawText(ctx,"ALWAYS READY FOR HUGS.",165,101,"#bfd3c7");
  drawText(ctx,"QUIET, A BIT STUBBORN.",165,110,"#bfd3c7");
  drawText(ctx,"FEARLESSLY LOYAL.",165,119,"#bfd3c7");
  drawText(ctx,BINGSU.ability,165,130,"#e3bb88");
  const owned=!!meta?.up?.dog;
  drawText(ctx,owned?"BOND: FOREVER":"A COMPANION TO LOVE",165,141,
    owned?"#a5deaa":"#bec4bd");
}
