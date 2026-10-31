import { clamp } from "./math";
import { carryCap, pileCap } from "./rules";
import { PILE_X } from "./config";

/** Existing buyers retain Good Dog automatically, unless explicitly unequipped.
 * The stable up.dog ownership bit is never renamed.
 */
export function activePet(meta: any): "dog" | null {
  if (!meta?.up?.dog) return null;
  return meta.petEquipped === undefined || meta.petEquipped === "dog" ? "dog" : null;
}

function approach(d: any, target: number, dt: number): boolean {
  const dx = target - d.x;
  if (Math.abs(dx) <= 3) { d.x = target; d.phase = "idle"; return true; }
  d.dir = dx > 0 ? 1 : -1;
  d.x += clamp(dx, -110 * dt, 110 * dt);
  d.phase = "walk";
  return false;
}

/** Converts only EXISTING dropped wood to carried wood. The old dog silently
 * created two sticks by visiting trees; this system cannot mint resources.
 * A pending two-log load remains visible on the dog and is checkpointed.
 */
export function updateDogCompanion(g: any, meta: any, dt: number): void {
  if (activePet(meta) !== "dog") {
    if (g.dog?.wood > 0) {
      // Unequipping never destroys or duplicates wood. If the pickup array is
      // full, hold it invisibly until a drop slot becomes available.
      if (g.pickups.length >= 200) { g.dog.hidden = true; return; }
      g.pickups.push({x:g.dog.x,y:152,w:g.dog.wood});
    }
    g.dog = null;
    return;
  }
  const p = g.player;
  if (!g.dog) g.dog = {x:clamp(p.x - p.dir*13,10,1590),y:156,dir:p.dir,wood:0,phase:"idle"};
  const d = g.dog;
  d.hidden = false;
  d.wood = Math.max(0, Math.min(2, Math.floor(d.wood || 0)));
  d.y = 156;
  // In a wide world, the dog can catch up after a long teleport or resume.
  if (Math.abs(d.x - p.x)>320) d.x = clamp(p.x - p.dir*20,10,1590);

  if (d.wood > 0) {
    if (g.builtPile && g.stored < pileCap(g)) {
      if (approach(d, PILE_X, dt)) {
        const put = Math.min(d.wood, pileCap(g)-g.stored);
        g.stored += put;
        d.wood -= put;
      }
    } else {
      // Before the rack is built or when it is full, hand logs to the player
      // when they have room. Otherwise keep them safely on the dog's back.
      const follow = clamp(p.x-p.dir*12,10,1590);
      if (approach(d, follow, dt) && p.wood < carryCap(g,meta)) {
        const give = Math.min(d.wood, carryCap(g,meta)-p.wood);
        p.wood += give;d.wood -= give;
      }
    }
    return;
  }

  // Only chase actual world pickups that the player has left behind.
  // A short radius keeps the companion near its owner instead of wandering
  // across the map as the old dog did.
  let closest: any=null, nearest=90;
  for (const drop of g.pickups) {
    if (!drop || drop.w<=0 || Math.abs(drop.x-p.x)>105) continue;
    const distance=Math.abs(drop.x-d.x);
    if(distance<nearest){nearest=distance;closest=drop;}
  }
  if (closest) {
    if (approach(d,closest.x,dt)) {
      const take=Math.min(2-d.wood,closest.w);
      d.wood+=take;closest.w-=take;
      if(closest.w<=0){
        const index=g.pickups.indexOf(closest);
        if(index>=0)g.pickups.splice(index,1);
      }
    }
  } else {
    approach(d,clamp(p.x-p.dir*12,10,1590),dt);
  }
}
