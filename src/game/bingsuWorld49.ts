/** Original low-resolution world sprite for Bingsu, the white Dogo Argentino.
 * One world pixel = one pixel rectangle. Mirroring the SAME artwork guarantees
 * legs, ears and muzzle face the direction of travel, without duplicating
 * inconsistent left/right drawings or stretching a bitmap.
 *
 * World silhouette: about 23 x 15 pixels including the animated tail/logs;
 * the player is about 25 pixels tall. Paws align with the player's ground.
 * Portrait/shop art intentionally remains a separate, larger illustration.
 */
export const BINGSU_WORLD_BOUNDS = {
  minX:-11,maxX:12,minY:-15,maxY:0
} as const;

export function drawBingsuWorldSprite(ctx:any,d:any,animT=0):void {
  if(!d || d.hidden || !Number.isFinite(d.x) || !Number.isFinite(d.y))return;
  const x=Math.round(d.x),y=Math.round(d.y);
  const dir=d.dir===-1?-1:1;
  const time=Number.isFinite(animT)?animT:0;
  const walk=d.phase==="walk" && (Number(d.motion)||0)>1;
  const gait=Number.isFinite(d.gait)?d.gait:0;
  // A stride is controlled by WORLD DISTANCE, not time, so idle legs never
  // cycle. The upper body has a gentle 1px breathing/walking weight shift.
  const step=Math.sin(gait),opposing=Math.sin(gait+Math.PI);
  const leftLift=walk && step>0.25?1:0;
  const rightLift=walk && opposing>0.25?1:0;
  const bodyLift=walk?(Math.sin(gait*2)>0.55?-1:0)
    :(Math.sin(time*2.0)>0.92?-1:0);
  const tail= Math.sin(time*(walk?9:3.5))>0.35?-1:0;
  const coat="#e9ede8",light="#faf9ef",shade="#b4c2c2";
  const ink="#53595a",paw="#8d9a99";

  const px=(dx:number,dy:number,w:number,h:number,color:string)=>{
    if(w<=0 || h<=0)return;
    // Horizontal reflection at x, not inversion of the dog's world facing.
    const left=dir===1?dx:-dx-w+1;
    ctx.fillStyle=color;
    ctx.fillRect(x+left,y+dy,w,h);
  };
  // Quiet ground shadow remains attached to her planted paws.
  px(-8,-1,18,1,"rgba(19,24,33,0.25)");

  // Far legs are shaded behind the torso, planted without sliding on idle.
  px(-4,-5-leftLift,2,5,shade);
  px(2,-5-rightLift,2,5,shade);
  px(-4,-1-leftLift,3,1,paw);
  px(2,-1-rightLift,3,1,paw);

  // Tail: short, relaxed and lightly wagging. No oversized fox curl.
  px(-9,-8+tail,2,2,shade);
  px(-11,-9+tail,3,2,coat);

  // Compact solid torso, shaded underside and small muscular shoulder.
  px(-7,-10+bodyLift,13,6,ink);
  px(-6,-10+bodyLift,12,6,shade);
  px(-6,-9+bodyLift,12,4,coat);
  px(-5,-10+bodyLift,8,2,light);
  px(-5,-5+bodyLift,10,1,"#cdd5d1");
  px(2,-10+bodyLift,4,5,light);
  px(4,-8+bodyLift,3,4,coat);

  // Near legs overlap body, moving in opposite phase to the far pair.
  px(-6,-5-rightLift,2,5,coat);
  px(4,-5-leftLift,2,5,coat);
  px(-7,-1-rightLift,3,1,shade);
  px(4,-1-leftLift,3,1,shade);

  // Her powerful neck is entirely white. No collar, tag, or harness.
  px(4,-10+bodyLift,2,5,coat);
  px(4,-10+bodyLift,1,3,light);

  // A square Dogo Argentino jaw, white muscular cheek and short muzzle.
  px(5,-12+bodyLift,5,7,shade);
  px(5,-12+bodyLift,5,5,coat);
  px(6,-12+bodyLift,3,2,light);
  px(6,-7+bodyLift,4,2,light);
  // A low folded ear and a single readable eye.
  px(5,-14+bodyLift,2,3,ink);
  px(5,-14+bodyLift,1,3,shade);
  const blink=Math.sin(time*1.1)>0.997;
  px(8,-10+bodyLift,1,1,blink?"#a7aeb0":"#333a3d");
  // Short square muzzle and dark nose; remain symmetric on left facing.
  px(9,-8+bodyLift,3,3,coat);
  px(10,-7+bodyLift,2,1,light);
  px(11,-7+bodyLift,1,2,"#333a3b");

  // Genuine one/two Pine Logs ride on her BACK instead of enlarging her.
  const cargo=Math.max(0,Math.min(2,Math.floor(Number(d.wood)||0)));
  for(let i=0;i<cargo;i++){
    px(-5+i*4,-13+bodyLift,4,2,"#553824");
    px(-4+i*4,-13+bodyLift,3,1,"#d3a064");
    px(-5+i*4,-12+bodyLift,1,1,"#efc28b");
  }
}
