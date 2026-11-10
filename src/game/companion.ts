import { clamp } from "./math";
import { carryCap, pileCap } from "./rules";
import { PILE_X, PLAYER_Y, WORLD_W } from "./config";

/** Existing buyers retain Bingsu automatically unless explicitly unequipped.
 * Pet ownership and permanent Ash purchases are unchanged by animation work. */
export function activePet(meta: any): "dog" | null {
  if (!meta?.up?.dog) return null;
  return meta.petEquipped === undefined || meta.petEquipped === "dog" ? "dog" : null;
}

export const BINGSU_FOLLOW_IDLE_RADIUS = 17;
export const BINGSU_FOLLOW_DISTANCE = 13;
export const BINGSU_PICKUP_LEASH = 95;
export const BINGSU_STORAGE_LEASH = 74;

/** A step moves toward a REAL world-space target without ever overshooting.
 * The gait is driven by distance actually walked, not a global animation
 * timer, so his paws stop moving as soon as Bingsu stops. */
function approach(d: any, target: number, dt: number): boolean {
  const dx = target - d.x;
  if (Math.abs(dx) <= 1.5) {
    d.x = target;
    d.phase = "idle";
    d.motion = 0;
    return true;
  }
  const stepTime = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.25);
  const speed = clamp(42 + Math.abs(dx) * 1.25, 42, 132);
  const step = Math.sign(dx) * Math.min(Math.abs(dx), speed * stepTime);
  if (step === 0) {
    d.phase = "idle";
    d.motion = 0;
    return false;
  }
  d.dir = step > 0 ? 1 : -1;
  d.x += step;
  d.gait = ((Number.isFinite(d.gait) ? d.gait : 0) + Math.abs(step) * 0.47) % (Math.PI * 2);
  d.motion = Math.abs(step) / Math.max(stepTime, 0.001);
  if (Math.abs(target - d.x) <= 1.5) {
    d.x = target;
    d.phase = "idle";
    d.motion = 0;
    return true;
  }
  d.phase = "walk";
  return false;
}

/** Follow the PLAYER'S ACTUAL POSITION, not their facing direction. When
 * already standing beside the player, turning around does not send Bingsu
 * sprinting across their body to occupy the other side. */
function followPlayer(d: any, p: any, dt: number): boolean {
  const offset = p.x - d.x;
  if (Math.abs(offset) <= BINGSU_FOLLOW_IDLE_RADIUS) {
    d.phase = "idle";
    d.motion = 0;
    return true;
  }
  const side = Math.sign(offset);
  const behind = clamp(p.x - side * BINGSU_FOLLOW_DISTANCE, 10, WORLD_W - 10);
  return approach(d, behind, dt);
}

/** Only EXISTING dropped Pine Logs may be retrieved. Bingsu carries at most
 * two at once, travels to the rack only while his owner is near camp, and
 * otherwise stays with the player instead of running across the whole world.
 * Equipping/un-equipping never creates or destroys logs. */
export function updateDogCompanion(g: any, meta: any, dt: number): void {
  if (activePet(meta) !== "dog") {
    if (g.dog?.wood > 0) {
      // Preserve cargo even if the pickup array has temporarily reached
      // the cap. The next free position receives his exact carried amount.
      if (g.pickups.length >= 200) { g.dog.hidden = true; return; }
      g.pickups.push({x:g.dog.x,y:152,w:g.dog.wood});
    }
    g.dog = null;
    return;
  }

  const p = g.player;
  if (!g.dog) {
    const startDir = p.dir === -1 ? -1 : 1;
    g.dog = {
      x:clamp(p.x - startDir * BINGSU_FOLLOW_DISTANCE,10,WORLD_W-10),
      y:Number.isFinite(p.y) ? p.y : PLAYER_Y,
      dir:startDir,wood:0,phase:"idle",gait:0,motion:0
    };
  }
  const d = g.dog;
  d.hidden = false;
  d.wood = clamp(Math.floor(Number(d.wood)||0),0,2);
  // Both sprites place their paws on the same ground line.
  d.y = Number.isFinite(p.y) ? p.y : PLAYER_Y;
  if (!Number.isFinite(d.x)) d.x = p.x;
  if (!Number.isFinite(d.gait)) d.gait = 0;
  // Resuming a checkpoint or a genuine player teleport should not leave a
  // dog hundreds of pixels outside the camera. Normal movement never warps.
  if (Math.abs(d.x - p.x) > 320) {
    const side = d.x < p.x ? -1 : 1;
    d.x = clamp(p.x + side * BINGSU_FOLLOW_DISTANCE,10,WORLD_W-10);
    d.phase = "idle";
    d.motion = 0;
  }

  if (d.wood > 0) {
    // A dog who carries real logs can visit the rack only while the PLAYER
    // is nearby. She must not disappear into the distance when the player
    // leaves camp.
    if(g.builtPile && g.stored < pileCap(g)
       && Math.abs(p.x - PILE_X) <= BINGSU_STORAGE_LEASH) {
      if(approach(d,PILE_X,dt)){
        const put=Math.min(d.wood,pileCap(g)-g.stored);
        g.stored+=put;
        d.wood-=put;
      }
    } else if(followPlayer(d,p,dt) && p.wood < carryCap(g,meta)) {
      const give=Math.min(d.wood,carryCap(g,meta)-p.wood);
      p.wood+=give;
      d.wood-=give;
    }
    return;
  }

  // Limit searching to the player and dog, not just the nearest global
  // pickup. Dropped logs a screen away cannot lure him from his owner.
  let closest:any=null,nearest=80;
  for(const drop of g.pickups){
    if(!drop || !Number.isFinite(drop.x) || drop.w<=0) continue;
    if(Math.abs(drop.x-p.x)>BINGSU_PICKUP_LEASH) continue;
    const distance=Math.abs(drop.x-d.x);
    if(distance<nearest){nearest=distance;closest=drop;}
  }
  if(closest){
    if(approach(d,closest.x,dt)){
      const take=Math.min(2-d.wood,closest.w);
      d.wood+=take;closest.w-=take;
      if(closest.w<=0){
        const index=g.pickups.indexOf(closest);
        if(index>=0)g.pickups.splice(index,1);
      }
    }
  }else{
    followPlayer(d,p,dt);
  }
}
