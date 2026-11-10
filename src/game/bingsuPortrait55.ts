/** Patch #55: real 90x68 color-indexed image art for Bingsu's Pets Shop bust.
 * A reviewed dog portrait is rasterized to a fixed pixel grid. It avoids the
 * previous awkward polygon-dog anatomy and needs no remote image fetch.
 * Bingsu's original little in-world companion sprite remains unchanged.
 */
export const BINGSU_PORTRAIT55={w:90,h:68} as const;
export const BINGSU_PALETTE55=["#45504f","#455150","#444f4e","#44504f","#b6a297","#d9c6b7","#cab9ab","#f6ebda","#d5c2b3","#a4938b","#fdf8ea","#eedfcf","#c6b2a5","#746462","#baaca2","#cfbeb0","#e9daca","#a89b93","#dccbbc","#968c87","#faf2e4","#495251","#8c807c","#333a3a","#f0e5d5","#7e726f","#2c2829","#e5d5c4","#fffdf5","#edddcc","#413b3b","#131214","#e2cfbf","#455050","#a78b83","#414b4b","#585958","#4f4b4a","#45514f","#45504e","#44504e","#445050","#445150","#43504f","#48514f"] as const;
const CHARS55="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs";
const PIXELS55=[
  // @ROWS55
] as readonly string[];
/** Draw contiguous indexed spans at 1 native pixel high, with no smoothing. */
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
