/** Patch #53 - four successive permanent camp foundations.
 * Purchase ownership is stored ONLY as up.legacy in the existing permanent
 * Ash meta. No run save migration, tutorial skip flags or free resources.
 */
export const CAMP_LEGACY_COSTS53=[35,60,95,140] as const;
export const CAMP_LEGACY_BENEFITS53=[
  "NEW RUNS: LOG STORAGE / LOG PILE BUILT. NO LOGS.",
  "NEW RUNS: WORKBENCH ALREADY BUILT. NO FREE GEAR.",
  "NEW RUNS: BOTH FENCE POSTS ALREADY BUILT.",
  "NEW RUNS: EASTERN CAMP EXPANSION BUILT."
] as const;
export const CAMP_LEGACY_MAX53=4;

export function campLegacyLevel53(meta:any):number {
  const raw=meta?.up?.legacy;
  return typeof raw==="number" && Number.isFinite(raw)
    ?Math.max(0,Math.min(CAMP_LEGACY_MAX53,Math.floor(raw))):0;
}
export function campLegacyNextBenefit53(level:number):string {
  const n=Number.isFinite(level)?Math.max(0,Math.floor(level)):0;
  return CAMP_LEGACY_BENEFITS53[n]??"ALL CAMP STRUCTURES PREBUILT ON NEW RUNS.";
}
/** Apply at the start of a FRESH run only. Old v1 checkpoints are loaded
 * from their own actual camp state, never re-seeded by later Ash purchases.
 * Built stations come empty and UNUPGRADED; fence torches remain unlit.
 * Returns number of inherited foundations for truthful startup messaging. */
export function applyCampLegacy53(g:any,meta:any):number {
  const level=campLegacyLevel53(meta);
  if(level>=1){
    g.builtPile=true;
    g.pileLogs=0;
    g.pileBuildT=-1;
  }
  if(level>=2){
    g.builtBench=true;
    g.benchLogs=0;
    g.benchBuildT=-1;
  }
  if(level>=3){
    g.fenceLeft=true;
    g.fenceRight=true;
  }
  if(level>=4){
    g.campExpansion=1;
  }
  return level;
}
