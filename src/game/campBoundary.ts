import { CX } from "./config";
import { visualSeason } from "./palette";
import { px } from "./renderUtils";

/** Native world coordinates. Keep the first camp centred on the existing
 * campfire, Grooty, workshop and storage. The later eastward claim reaches the
 * Museum without making a permanent hut part of the tutorial. */
export const WEST_POST_X = CX - 118;
export const EAST_POST_X = CX + 82;
export const EXPANSION_MARKER_X = CX + 102;
export const EAST_EXPANDED_X = CX + 202;
export const EXPANSION_COST = 5;
export const MUSEUM_CLAIM_X = CX + 168;

export function campEstablished(g: any): boolean {
  return g.fenceLeft === true && g.fenceRight === true;
}
export function campClaimBounds(g: any): { west:number; east:number } {
  return { west: WEST_POST_X, east: g.campExpansion >= 1 ? EAST_EXPANDED_X : EAST_POST_X };
}
/** Trees cannot grow inside claimed land, and starting sites stay clear even
 * before posts are built so players don't lose access to either marker. */
export function isCampTreeExcluded(g: any, x: number): boolean {
  if (x >= WEST_POST_X - 5 && x <= EAST_POST_X + 5) return true;
  return g.campExpansion >= 1 && x <= EAST_EXPANDED_X + 5 && x >= EAST_POST_X;
}
/** Give existing trees in newly claimed territory back as ordinary ground
 * pickups, never silently delete a resource or generate a Museum drop. */
export function clearClaimedTrees(g: any): number {
  if (!campEstablished(g)) return 0;
  const {west,east} = campClaimBounds(g);
  const removed = (g.trees || []).filter((t:any) => t.x >= west && t.x <= east);
  if (!removed.length) return 0;
  const removedIds = new Set(removed.map((t:any) => t.id));
  g.trees = g.trees.filter((t:any) => !removedIds.has(t.id));
  if (g.player?.chopTree && removedIds.has(g.player.chopTree.id)) {
    g.player.chopTree = null;
    g.player.chopT = 0;
  }
  for (const t of removed) {
    g.pickups.push({x:t.x, y:t.y, w:Math.max(1,Math.min(3,Math.floor(t.tier||0)+1))});
  }
  return removed.length;
}

/** Interaction spends from the real inventory only. Returning a message avoids
 * coupling the fence rules to audio, toast, or permanent Ash systems. */
export function placeFencePost(g: any, side: "left" | "right"): string {
  const key = side === "left" ? "fenceLeft" : "fenceRight";
  if (g[key]) return "THIS FENCE POST IS ALREADY IN PLACE.";
  if (g.player.wood < 1) return "BRING ONE LOG TO THIS BOUNDARY POST.";
  g.player.wood--;
  g[key] = true;
  if (campEstablished(g)) {
    clearClaimedTrees(g);
    return "CAMP ESTABLISHED! YOU CAN NOW BUILD STRUCTURES.";
  }
  return side === "left" ? "LEFT POST BUILT. NOW BUILD THE RIGHT POST."
    : "RIGHT POST BUILT. NOW BUILD THE LEFT POST.";
}

export function expandCamp(g: any): string {
  if (!campEstablished(g)) return "ESTABLISH BOTH CAMP POSTS FIRST.";
  if (g.campExpansion >= 1) return "THIS TERRITORY IS ALREADY CLAIMED.";
  if (g.player.wood + g.stored < EXPANSION_COST) return "BRING FIVE LOGS TO EXPAND THE CAMP.";
  const fromCarried = Math.min(g.player.wood, EXPANSION_COST);
  g.player.wood -= fromCarried;
  g.stored -= EXPANSION_COST - fromCarried;
  g.campExpansion = 1;
  const cleared = clearClaimedTrees(g);
  return "EASTERN CAMP EXPANDED! " + (cleared ? cleared + " TREES CLEARED." : "NEW GROUND CLAIMED.");
}

function drawPost(ctx:any,x:number,y:number,completed:boolean) {
  // Preview stakes show obvious physical interaction points, not giant signs.
  if (!completed) {
    px(ctx,x-2,y-5,4,10,"#644b37");
    px(ctx,x-1,y-8,2,4,"#bd9b6c");
    px(ctx,x-4,y+4,8,2,"#957348");
    px(ctx,x-4,y-13,8,3,"#e0ca89");
    px(ctx,x-3,y-12,6,1,"#624a34");
  } else {
    px(ctx,x-4,y-25,8,27,"#4b3527");
    px(ctx,x-3,y-23,6,23,"#8e6540");
    px(ctx,x-2,y-24,4,22,"#b48855");
    px(ctx,x-4,y-26,8,2,"#b38b59");
    px(ctx,x-2,y-29,4,3,"#b38b59");
    px(ctx,x-1,y-30,2,2,"#d9b67c");
    px(ctx,x-2,y-11,4,2,"#503525");
  }
}

/** Low side-view palisade: irregular pointed log planks, quiet rope rails,
 * readable knots and slight seasonal frosting. Rendered BEHIND world objects
 * and player. No collisions, camera changes, image assets or shaders. */
function drawPalisade(ctx:any,g:any,west:number,east:number){
  const season=visualSeason(g);
  const colors=["#6d4a31","#805838","#946744","#745036","#876244"];
  for(let x=west+2,i=0; x<east-2; x+=6,i++){
    const jitter=[0,2,1,3,0,1,2][i%7], top=118+jitter;
    const main=colors[i%colors.length];
    px(ctx,x,top+3,6,148-(top+3), "#493324");
    px(ctx,x+1,top+3,5,146-(top+3),main);
    px(ctx,x+1,top+2,4,2,main);
    px(ctx,x+2,top,2,3,"#b28a5a");
    px(ctx,x+1,top+5,1,20,"rgba(210,160,96,0.27)");
    if(i%4===0){
      px(ctx,x+3,top+13,1,3,"#563a29");
      px(ctx,x+2,top+18,2,1,"#ae8351");
    }
    if(season==="winter"&&i%3===0)px(ctx,x+1,top+2,4,1,"#d8e5e9");
  }
  // Two thin rear timber crossbeams tie the slats together, rather than
  // producing a solid wall in front of the camp buildings.
  for(const y of [135,143]){
    px(ctx,west+2,y,east-west-4,2,"#4d3528");
    px(ctx,west+2,y,east-west-4,1,"#9a7047");
  }
  drawPost(ctx,west,147,true);
  drawPost(ctx,east,147,true);
}

/** Soft, seasonal cleared ground and sparse stepping-stone cues indicate
 * claimed territory. The existing continuous shoreline and water remain. */
export function drawCampGround(ctx:any,g:any,colors:any){
  if (!campEstablished(g)) return;
  const {west,east}=campClaimBounds(g);
  ctx.fillStyle=visualSeason(g)==="winter"?"rgba(186,202,211,0.15)":"rgba(195,158,102,0.13)";
  ctx.fillRect(west+4,143,east-west-8,9);
  ctx.fillStyle=colors.speckle;
  for(let x=west+12,i=0;x<east-9;x+=17,i++){
    px(ctx,x,150+(i%2),5,1,"rgba(115,94,65,0.42)");
    px(ctx,x+2,151+(i%2),2,1,"rgba(195,165,110,0.25)");
  }
}
export function drawCampFence(ctx:any,g:any){
  if (!campEstablished(g)) {
    if (!g.fenceLeft) drawPost(ctx,WEST_POST_X,147,false);
    else drawPost(ctx,WEST_POST_X,147,true);
    if (!g.fenceRight) drawPost(ctx,EAST_POST_X,147,false);
    else drawPost(ctx,EAST_POST_X,147,true);
    return;
  }
  const {west,east}=campClaimBounds(g);
  drawPalisade(ctx,g,west,east);
  if (g.campExpansion < 1) {
    // Place the expansion stake beyond the established eastern boundary.
    drawPost(ctx,EXPANSION_MARKER_X,147,false);
  }
}
