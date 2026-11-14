import { WEST_POST_X, EAST_POST_X, EAST_EXPANDED_X, campClaimBounds, campEstablished } from "./campBoundary";
import { px } from "./renderUtils";

/** Fence torches are temporary RUN buildings, not a permanent Ash upgrade.
 * Each one burns for seven completed dawns after construction. */
export const FENCE_TORCH_COST = 2;
export const FENCE_TORCH_DAWNS = 7;
export const FENCE_TORCH_POST_RADIUS = 16;
export const FENCE_TORCH_WARMTH_RADIUS = 48;
export const FENCE_TORCH_LIGHT_RADIUS = 57;
/** Stable physical post IDs. The inner EAST post never moves when the
 * palisade expands; the third OUTER post is a separate construction site. */
export type FenceTorchSide = "left"|"right"|"outer";
export type FenceTorchState = Record<FenceTorchSide,number>;

function remaining(raw:unknown):number {
  return Number.isFinite(raw)?Math.max(0,Math.min(FENCE_TORCH_DAWNS,Math.floor(raw as number))):0;
}

/** P47 saved only left/right. In an ALREADY-expanded P47 checkpoint its
 * "right" flame was drawn at the outer edge. Move that remaining lifetime to
 * the outer post once, preserving what the player actually saw and bought.
 * A new 3-post snapshot is unambiguous and never moves existing flames. */
export function normalizeFenceTorches(raw:unknown,legacyExpanded=false):FenceTorchState {
  const input=raw && typeof raw==="object" && !Array.isArray(raw) ? raw as any:{};
  const left=remaining(input.left),right=remaining(input.right);
  const hasOuter=Object.prototype.hasOwnProperty.call(input,"outer");
  return legacyExpanded && !hasOuter
    ? {left,right:0,outer:right}
    : {left,right,outer:remaining(input.outer)};
}
export function torchPostX(_g:any,side:FenceTorchSide):number {
  return side==="left"?WEST_POST_X:side==="right"?EAST_POST_X:EAST_EXPANDED_X;
}
export function torchPostAvailable(g:any,side:FenceTorchSide):boolean {
  return campEstablished(g) && (side!=="outer" || (Number(g.campExpansion)||0)>=1);
}
export function activeFenceTorch(g:any,side:FenceTorchSide):boolean {
  return torchPostAvailable(g,side) && remaining(g.fenceTorches?.[side])>0;
}
export function availableFencePosts(g:any):FenceTorchSide[] {
  if(!campEstablished(g)) return [];
  return (Number(g.campExpansion)||0)>=1?["left","right","outer"]:["left","right"];
}
export function nearestFenceTorchPost(g:any):FenceTorchSide|null {
  if(!campEstablished(g) || !Number.isFinite(g.player?.x))return null;
  const posts=availableFencePosts(g);
  const sorted=posts.sort((a,b)=>Math.abs(g.player.x-torchPostX(g,a))
    -Math.abs(g.player.x-torchPostX(g,b)));
  const best=sorted[0];
  return best && Math.abs(g.player.x-torchPostX(g,best))<FENCE_TORCH_POST_RADIUS
    ? best : null;
}

/** Spending is on-site and uses only real carried logs. All three physical
 * posts have independent seven-dawn leases and can be relit after burnout. */
export function buildFenceTorch(g:any,side:FenceTorchSide):string {
  if(!campEstablished(g))return "ESTABLISH BOTH FENCE POSTS FIRST.";
  if(!torchPostAvailable(g,side))return "BUILD THE OUTER FENCE FIRST.";
  if(nearestFenceTorchPost(g)!==side)return "STAND BESIDE THIS FENCE POST.";
  if(activeFenceTorch(g,side))
    return "FENCE TORCH: "+remaining(g.fenceTorches?.[side])+" DAWNS LEFT.";
  if((Number(g.player?.wood)||0)<FENCE_TORCH_COST)
    return "BRING 2 PINE LOGS TO BUILD A FENCE TORCH.";
  g.player.wood-=FENCE_TORCH_COST;
  if(!g.fenceTorches)g.fenceTorches=normalizeFenceTorches(null);
  g.fenceTorches[side]=FENCE_TORCH_DAWNS;
  return "FENCE TORCH LIT! -50% WARMTH LOSS IN SHELTER FOR 7 DAWNS.";
}

/** All built corners tick once at sunrise, never per frame. */
export function advanceFenceTorchDawn(g:any):FenceTorchSide[] {
  g.fenceTorches=normalizeFenceTorches(g.fenceTorches);
  const expired:FenceTorchSide[]=[];
  for(const side of ["left","right","outer"] as const){
    if(g.fenceTorches[side]<=0)continue;
    g.fenceTorches[side]--;
    if(g.fenceTorches[side]===0)expired.push(side);
  }
  return expired;
}

/** Partial Warmth-loss shelter follows actual lit fence sections, not invented spotlights.
 * Adjacent active posts shelter their segment; isolated flames protect only
 * nearby ground inside the fence. The expansion requires its own outer torch
 * for the extension to become fully sheltered. */
export function protectedByFenceTorches(g:any):boolean {
  if(!campEstablished(g) || !Number.isFinite(g.player?.x))return false;
  const x=g.player.x;
  const {west,east}=campClaimBounds(g);
  if(x<west || x>east)return false;
  if(activeFenceTorch(g,"left") && activeFenceTorch(g,"right")
    && x>=WEST_POST_X && x<=EAST_POST_X)return true;
  if(activeFenceTorch(g,"right") && activeFenceTorch(g,"outer")
    && x>=EAST_POST_X && x<=EAST_EXPANDED_X)return true;
  return availableFencePosts(g).some(side=>activeFenceTorch(g,side)
    && Math.abs(x-torchPostX(g,side))<=FENCE_TORCH_WARMTH_RADIUS);
}
export function fenceTorchLights(g:any):{x:number;y:number;side:FenceTorchSide}[] {
  return availableFencePosts(g).filter(side=>activeFenceTorch(g,side))
    .map(side=>({x:torchPostX(g,side),y:112,side}));
}
/** A cooler pale amber/icy flame is distinct from the warm orange firepit.
 * The small colored wick remains visibly mounted above the wooden post. */
export function drawFenceTorches(ctx:any,g:any):void {
  for(const t of fenceTorchLights(g)){
    const x=t.x,y=t.y;
    const phase=(Number(g.animT)||0)*7+(t.side==="left"?0:t.side==="right"?1.1:2.2);
    const sway=Math.sin(phase)>0.4?1:Math.sin(phase)<-0.4?-1:0;
    px(ctx,x-3,y+4,6,3,"#4d3d33");
    px(ctx,x-2,y+2,4,4,"#8f8469");
    px(ctx,x-1,y-2,2,5,"#b9b59a");
    px(ctx,x-3+sway,y-7,6,5,"#87afb0");
    px(ctx,x-2+sway,y-9,4,5,"#c6d9c2");
    px(ctx,x-1+sway,y-12,2,6,"#f0ecc9");
    px(ctx,x+sway,y-13,1,4,"#f8f2cf");
    if(g.isNight){
      px(ctx,x-4,y-5,1,1,"rgba(176,216,215,0.70)");
      px(ctx,x+4,y-9,1,1,"rgba(195,213,194,0.60)");
    }
  }
}
