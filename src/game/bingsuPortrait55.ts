/** Patch #56: reframe the APPROVED Bingsu close-up, without changing her look.
 * The image now includes more of her white neck, chest and shoulders from
 * the existing illustration. Cropping, not redesigning, preserves likeness.
 * Pixel data is rendered synchronously on the native canvas without an
 * external asset or save change. Her in-world sprite is unchanged.
 */
export const BINGSU_PORTRAIT55={w:94,h:68} as const;
export const BINGSU_PALETTE55=["#201c1d","#383939","#3d4746","#494b4a","#434f4f","#444f4f","#454f4e","#44504f","#445050","#445051","#445150","#455050","#455150","#47504f","#455151","#455152","#465151","#455252","#465252","#505655","#756966","#8d837e","#a18e87","#a1958e","#aa9b92","#b49e94","#b9aa9f","#c2aea2","#c6b4a7","#cab9ac","#cfbcae","#d3c0b1","#d4c5b7","#dac6b7","#dcc9ba","#e0d0c1","#e7d6c5","#eadac9","#ede0d0","#f1e3d2","#f4e8d8","#f8efdf","#fcf6e8","#fefbf0"] as const;
const CHARS55="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr";
const PIXELS55=[
  // @ROWS56
] as readonly string[];
export function drawBingsuPortrait55(ctx:any,x:number,y:number):void {
  const ox=Math.round(x),oy=Math.round(y);
  for(let j=0;j<BINGSU_PORTRAIT55.h;j++){
    const row=PIXELS55[j];
    for(let i=0;i<BINGSU_PORTRAIT55.w;){
      const key=row[i];let end=i+1;
      while(end<BINGSU_PORTRAIT55.w&&row[end]===key)end++;
      ctx.fillStyle=BINGSU_PALETTE55[CHARS55.indexOf(key)];
      ctx.fillRect(ox+i,oy+j,end-i,1);
      i=end;
    }
  }
}
