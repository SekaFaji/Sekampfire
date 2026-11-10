/** Patch #50 - one REAL active axe, permanent starter Stick, and one pet.
 * Ownership remains in the old verified craft/Ash keys. The equipment
 * selection never creates an item and must not be used to award bonuses.
 */
export type AxeId="stick"|"wood_axe"|"grandpas_axe";
export type PetId="dog";
export type GearCategory="axe"|"pet"|"tools";

export const AXE_STATS:Record<AxeId,{name:string;description:string;chopSeconds:number;tier:0|1|2}> = {
  stick:{name:"WOOD STICK",description:"STARTER TOOL",chopSeconds:1,tier:0},
  wood_axe:{name:"WOOD AXE",description:"0.70S PER SWING",chopSeconds:0.7,tier:1},
  grandpas_axe:{name:"GRANDPA'S AXE",description:"0.55S PER SWING",chopSeconds:0.55,tier:2}
};
export function ownedAxeOptions(g:any,meta:any):AxeId[] {
  const result:AxeId[]=["stick"];
  if(g?.crafts?.maul===true) result.push("wood_axe");
  if((Number(meta?.up?.axe)||0)>0) result.push("grandpas_axe");
  return result;
}
export function ownedPetOptions(meta:any):PetId[] {
  return (Number(meta?.up?.dog)||0)>0?["dog"]:[];
}
/** Older save files did not store axe selection. Preserve their historical
 * stronger-tool behavior on first load, but respect explicit STICK selection
 * on modern files, even if an expensive axe is owned.
 */
export function defaultPermanentAxe(meta:any):"stick"|"grandpas_axe" {
  if((Number(meta?.up?.axe)||0)<=0)return "stick";
  return meta?.axeEquipped==="stick"?"stick":"grandpas_axe";
}
export function normalizeEquippedAxe(raw:unknown,g:any,meta:any):AxeId {
  const options=ownedAxeOptions(g,meta);
  if(typeof raw==="string" && options.includes(raw as AxeId))
    return raw as AxeId;
  // Missing selection: an old run automatically used the strongest owned
  // axe; a new run initializes from the permanent preference separately.
  if(options.includes("grandpas_axe"))return "grandpas_axe";
  if(options.includes("wood_axe"))return "wood_axe";
  return "stick";
}
export function equippedAxe(g:any,meta:any):AxeId {
  if(typeof g?.equippedAxe==="string")
    return normalizeEquippedAxe(g.equippedAxe,g,meta);
  return normalizeEquippedAxe(undefined,g,meta);
}
export function equipAxe(g:any,meta:any,id:AxeId):boolean {
  if(!ownedAxeOptions(g,meta).includes(id))return false;
  g.equippedAxe=id;
  // The run-only crafted Wood Axe must not leak into the next run.
  // The permanent Grandpa's Axe/Stick preference survives future runs.
  if(id==="stick" || id==="grandpas_axe")meta.axeEquipped=id;
  if(g.player?.chopT>0){
    g.player.chopT=0;
    g.player.chopTree=null;
    g.chopBlocked=true;
  }
  return true;
}
export function equipPet(meta:any,id:PetId|null):boolean {
  if(id!==null && !ownedPetOptions(meta).includes(id))return false;
  meta.petEquipped=id;
  return true;
}
export function equippedPet(meta:any):PetId|null {
  return ownedPetOptions(meta).length &&
    meta.petEquipped!==null ? "dog" : null;
}
export function normalizeGearChoice(g:any,meta:any,kind:GearCategory,choice:unknown):string|null {
  if(kind==="axe"){
    const list=ownedAxeOptions(g,meta);
    return typeof choice==="string"&&list.includes(choice as AxeId)?choice:equippedAxe(g,meta);
  }
  if(kind==="pet"){
    const list=ownedPetOptions(meta);
    return typeof choice==="string"&&list.includes(choice as PetId)?choice:list[0]||null;
  }
  return typeof choice==="string" ? choice : null;
}
