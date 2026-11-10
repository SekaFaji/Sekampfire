import { CX } from "./config";
import { campClaimBounds, campEstablished } from "./campBoundary";
import { px } from "./renderUtils";

/** Fence torches are temporary RUN buildings, not a permanent Ash upgrade.
 * Each one burns for seven completed dawns after construction. */
export const FENCE_TORCH_COST = 2;
export const FENCE_TORCH_DAWNS = 7;
export const FENCE_TORCH_POST_RADIUS = 16;
export const FENCE_TORCH_WARMTH_RADIUS = 48;
export const FENCE_TORCH_LIGHT_RADIUS = 57;
export type FenceTorchSide = "left"|"right";
export type FenceTorchState = Record<FenceTorchSide,number>;

function remaining(raw:unknown):number {
  return Number.isFinite(raw)?Math.max(0,Math.min(FENCE_TORCH_DAWNS,Math.floor(raw as number))):0;
}
export function normalizeFenceTorches(raw:unknown):FenceTorchState {
  const input=raw && typeof raw==="object" && !Array.isArray(raw) ? raw as any:{};
  return {left:remaining(input.left),right:remaining(input.right)};
}
export function torchPostX(g:any,side:FenceTorchSide):number {
  const bounds=campClaimBounds(g);
  return side==="left"?bounds.west:bounds.east;
}
export function activeFenceTorch(g:any,side:FenceTorchSide):boolean {
  return campEstablished(g) && remaining(g.fenceTorches?.[side])>0;
}
export function nearestFenceTorchPost(g:any):FenceTorchSide|null {
  if(!campEstablished(g) || !Number.isFinite(g.player?.x))return null;
  const leftDist=Math.abs(g.player.x-torchPostX(g,"left"));
  const rightDist=Math.abs(g.player.x-torchPostX(g,"right"));
  const best=leftDist<=rightDist?"left":"right";
  return Math.min(leftDist,rightDist)<FENCE_TORCH_POST_RADIUS?best:null;
}

/** Spending is on-site and uses only real carried logs. Rebuilding an
 * expired torch starts another seven-dawn lease. Active torches can't
 * silently consume resources or extend themselves when ACT is pressed. */
export function buildFenceTorch(g:any,side:FenceTorchSide):string {
  if(!campEstablished(g))return "ESTABLISH BOTH FENCE POSTS FIRST.";
  if(nearestFenceTorchPost(g)!==side)return "STAND BESIDE THIS FENCE POST.";
  if(activeFenceTorch(g,side))
    return "FENCE TORCH: "+remaining(g.fenceTorches?.[side])+" DAWNS LEFT.";
  if((Number(g.player?.wood)||0)<FENCE_TORCH_COST)
    return "BRING 2 PINE LOGS TO BUILD A FENCE TORCH.";
  g.player.wood-=FENCE_TORCH_COST;
  if(!g.fenceTorches)g.fenceTorches=normalizeFenceTorches(null);
  g.fenceTorches[side]=FENCE_TORCH_DAWNS;
  return "FENCE TORCH LIT! PROTECTS CAMP FOR 7 DAWNS.";
}

/** Called once at every sunrise, never per render or per real-world day. */
export function advanceFenceTorchDawn(g:any):FenceTorchSide[] {
  g.fenceTorches=normalizeFenceTorches(g.fenceTorches);
  const expired:FenceTorchSide[]=[];
  for(const side of ["left","right"] as const){
    if(g.fenceTorches[side]<=0)continue;
    g.fenceTorches[side]--;
    if(g.fenceTorches[side]===0)expired.push(side);
  }
  return expired;
}
/** One post keeps its own nearby area safe; lighting BOTH makes the entire
 * fenced interior safe. The protection stops at the boundary. A torch is
 * pale and comparatively cool: it cannot restore Warmth like a campfire. */
export function protectedByFenceTorches(g:any):boolean {
  if(!campEstablished(g) || !Number.isFinite(g.player?.x))return false;
  const x=g.player.x;
  const {west,east}=campClaimBounds(g);
  if(x<west || x>east)return false;
  const left=activeFenceTorch(g,"left"),right=activeFenceTorch(g,"right");
  if(left && right)return true;
  return (left && x<=west+FENCE_TORCH_WARMTH_RADIUS)
    || (right && x>=east-FENCE_TORCH_WARMTH_RADIUS);
}
export function fenceTorchLights(g:any):{x:number;y:number;side:FenceTorchSide}[] {
  if(!campEstablished(g))return [];
  return (["left","right"] as const).filter(side=>activeFenceTorch(g,side))
    .map(side=>({x:torchPostX(g,side),y:112,side}));
}
/** A cooler pale amber/icy flame is distinct from the warm orange firepit.
 * The small colored wick remains visibly mounted above the wooden post. */
export function drawFenceTorches(ctx:any,g:any):void {
  for(const t of fenceTorchLights(g)){
    const x=t.x,y=t.y;
    const phase=(Number(g.animT)||0)*7+(t.side==="left"?0:1.1);
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
