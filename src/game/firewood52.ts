import { PINE_LOG_ID } from "./inventory";
import { stationKindlingBonus } from "./campProgress";
import { FIRE_BASE_CAPACITY63, fireFuelCapacity63 } from "./fireCapacity63";

/** Patch #52 - each actual species owns its fuel range, separate from
 * material quantity, Museum collectibles and camp build costs. New species
 * can be registered here when corresponding real item/tree/storage support
 * is implemented. Never invent other wood in the current inventory. */
export const WOOD_SPECIES52 = {
  pine_log:{
    itemId:PINE_LOG_ID,
    tree:"PINE TREE",
    label:"PINE LOG",
    weightKg:1,
    fuelMin:5,
    fuelMax:20,
  }
} as const;
export type WoodSpeciesId52=keyof typeof WOOD_SPECIES52;
export type FireActionKind52="lit"|"stoked"|"full"|"no_log";
export type LogSource52="carried"|"storage";
export type FireAction52={
  kind:FireActionKind52;
  wood:WoodSpeciesId52|null;
  source:LogSource52|null;
  roll:number;
  kindlingBonus:number;
  starterBonus:number;
  added:number;
  fuel:number;
};
export const INITIAL_TINDER_BONUS52=20;
export const MAX_FIRE_FUEL52=FIRE_BASE_CAPACITY63; // historical, unupgraded base fuel cap

/** Inclusive integer uniform distribution: Pine provides 5 through 20 fuel
 * per log. The random sample is taken ONLY when a log is actually consumed.
 * Tests can inject a deterministic sample without changing runtime RNG. */
export function rollWoodFuel52(
  id:WoodSpeciesId52,
  random:()=>number=Math.random
):number {
  const species=WOOD_SPECIES52[id];
  if(!species)throw new Error("UNKNOWN WOOD SPECIES");
  const raw=random();
  const sample=typeof raw==="number"&&Number.isFinite(raw)
    ?Math.max(0,Math.min(0.9999999999999999,raw)):0;
  return species.fuelMin+
    Math.floor(sample*(species.fuelMax-species.fuelMin+1));
}

/** Consume one real Pine Log from the canonical backpack (preferred) or
 * the existing Log Storage. Starting tinder assists the FIRST ignition only:
 * it grants +20 fuel but never replaces the required log. Later relights
 * need just one Pine Log and use its real randomized 5-20 burn value.
 *
 * The first ignition does not count as the guide's separate "feed a log"
 * mission. Further stokes count exactly once; when within 1 fuel of the
 * CURRENT cap no wood or RNG is consumed. No log quality is serialized. */
export function useOneFireLog52(
  g:any,random:()=>number=Math.random
):FireAction52 {
  const lit=!!g.fireLit;
  const capacity=fireFuelCapacity63(g);
  const fuel=Number.isFinite(g.fuel)
    ?Math.max(0,Math.min(capacity,g.fuel)):0;
  const source:LogSource52|null=Number(g.player?.wood)>0
    ?"carried":Number(g.stored)>0?"storage":null;
  const empty=(kind:FireActionKind52):FireAction52=>({
    kind,wood:null,source:null,roll:0,kindlingBonus:0,
    starterBonus:0,added:0,fuel
  });
  if(lit && fuel>=capacity-1)return empty("full");
  if(source===null)return empty("no_log");

  // This is the only place in this patch that spends firewood. Check
  // actual resources BEFORE calling the RNG or making any other changes.
  if(source==="carried")g.player.wood-=1;
  else g.stored-=1;

  const roll=rollWoodFuel52(PINE_LOG_ID,random);
  const kindlingBonus=stationKindlingBonus(g);
  const starterBonus=!lit && Number(g.firestarter)>0
    ?INITIAL_TINDER_BONUS52:0;
  const gain=roll+kindlingBonus+starterBonus;
  const newFuel=Math.min(capacity,fuel+gain);
  g.fuel=newFuel;
  if(!lit){
    g.fireLit=true;
    g.everLit=true;
    g.firestarter=0;
  }else g.guideStokes=Math.max(0,Number(g.guideStokes)||0)+1;

  return {
    kind:lit?"stoked":"lit",
    wood:PINE_LOG_ID,
    source,roll,kindlingBonus,starterBonus,
    added:newFuel-fuel,fuel:newFuel
  };
}
