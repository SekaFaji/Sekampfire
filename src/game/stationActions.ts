import { CX, BENCH_X, PILE_X } from "./config";
import { AUDIO } from "./audio";
import { useOneFireLog52 } from "./firewood52";
import { pileCap, carryCap } from "./rules";
import { stationLevel, stationCost } from "./campProgress";
import { stationUpgradeRow } from "./buildingMenu";
import { selectedStation, dismissStationSelection, type NearbyStation, type StationAction } from "./proximity45";
import { addStatusMessage } from "./statusMessages";

/** Physical station entry, firewood and storage operations, and station
 * action row wiring. Keep the original reach gates, resource costs, menu
 * transitions and confirmation semantics without depending on game.ts. */
/** Station interaction is permitted only at a physical camp position.
 * First construction remains on-site, so the Workbench can be built from
 * scratch without requiring its own build menu. Never open remote plans. */
export function openStation(g:any,id:"hearth"|"bench"|"pile"):boolean {
  const x=id==="hearth"?CX:id==="bench"?BENCH_X:PILE_X;
  if(g.ui!=="run" || g.over || Math.abs(g.player.x-x)>=22) return false;
  if(id==="bench"&&!g.builtBench || id==="pile"&&!g.builtPile) return false;
  g.stationId=id;
  g.stationFrom=false;
  g.menu="station";
  g.menuSel=0;
  g.buildConfirm=null;
  g.craftConfirm=null;
  g.keys.act=false;
  g.pressE=false;
  return true;
}

/** ACCESS from the real Fireplace. The first ignition, every subsequent
 * relight and each ordinary feeding consume exactly ONE legitimate Pine Log.
 * A real firestarter is tinder (+20 only on first ignition), not free fuel.
 * Every Pine Log rolls 5-20 fuel at use; Kindling Bundle adds +5 per log.
 * The pre-lit Old Flint Ash upgrade remains untouched. */
export function accessHearth(g:any):void {
  const result=useOneFireLog52(g);
  if(result.kind==="no_log"){
    addStatusMessage(g,g.fireLit?"BRING ONE PINE LOG TO STOKE THE FIRE."
      :"NEED ONE PINE LOG TO LIGHT THE FIRE.");
    return;
  }
  if(result.kind==="full"){
    addStatusMessage(g,"THE CAMPFIRE IS ALREADY WELL FED.");
    return;
  }
  if(result.kind==="lit"){
    AUDIO.effect("light");
    const tinder=result.starterBonus>0?" (STARTER TINDER +20)":"";
    addStatusMessage(g,"1 PINE LOG LIT THE FIRE. +"+result.added+" FUEL"+tinder+".");
  }else {
    const extra=result.kindlingBonus>0?" (+5 KINDLING)":"";
    addStatusMessage(g,"PINE LOG BURNED FOR +"+result.added+" FUEL"+extra+".");
  }
}
export function accessStorage(g:any,meta:any,direction?:"store"|"take"):void {
  const p=g.player,capacity=pileCap(g);
  const move=direction||(p.wood>0?"store":"take");
  if(move==="store"){
    if(p.wood<=0){addStatusMessage(g,"BRING PINE LOGS TO STORE.");return;}
    const add=Math.min(p.wood,capacity-g.stored);
    if(add<=0)addStatusMessage(g,"THE LOG STORAGE IS FULL.");
    else{
      g.stored+=add;p.wood-=add;
      addStatusMessage(g,"Stored "+add+" pine logs on the pile.");
    }
  }else if(g.stored>0){
    const take=Math.min(g.stored,Math.max(0,carryCap(g,meta)-p.wood));
    if(take<=0)addStatusMessage(g,"YOU CANNOT CARRY ANY MORE.");
    else{
      p.wood+=take;g.stored-=take;
      addStatusMessage(g,"Took "+take+" pine logs from storage.");
    }
  }else addStatusMessage(g,"THE LOG STORAGE IS EMPTY.");
}

/** The world-space station buttons and ACT use precisely the same
 * authoritative station actions. No generic ACCESS/UPGRADE popup is opened. */
export function performStationAction(g:any,meta:any,id:NearbyStation,action:StationAction):boolean {
  if(g.ui!=="run" || g.over || g.menu || selectedStation(g)!==id) return false;
  if(action==="take" && id!=="pile" || action==="plans" && id!=="bench")return false;
  g.stationId=id;
  // Log storage deliberately has TWO different transfer directions now.
  // ACT/the left button always STORES; the middle TAKE button only TAKES.
  // Reuse the exact carrying and storage capacity rules from accessStorage.
  if(id==="pile" && (action==="primary"||action==="take")){
    g.pressE=false;g.keys.act=false;g.buildConfirm=null;
    accessStorage(g,meta,action==="take"?"take":"store");
    return true;
  }
  const rowIndex=action==="primary"?0:action==="upgrade"?1:2;
  const row=stationRows(g,meta)[rowIndex];
  if(!row || row.enabled===false) {
    if(action==="upgrade") addStatusMessage(g,stationLevel(g,id)>=2
      ? "THIS STATION IS FULLY UPGRADED."
      : "NEED "+stationCost(g,id)+" PINE LOGS TO UPGRADE.");
    return false;
  }
  g.pressE=false;
  g.keys.act=false;
  row.onDown();
  // Crafting and blueprints are genuine detailed menus; closing them returns
  // to the world, never to the removed station confirmation popup.
  if(g.menu==="bench" || g.menu==="build") g.stationFrom=false;
  if(g.menu) dismissStationSelection(g);
  return true;
}

/** Uses existing authoritative purchaseStation / stationUpgradeRow, so
 * station costs and Ash rewards cannot diverge across UI surfaces. */
export function stationRows(g:any,meta:any):any[]{
  const id:"hearth"|"bench"|"pile"=
    g.stationId==="bench"||g.stationId==="pile"?g.stationId:"hearth";
  const upgrade=stationUpgradeRow(g,id);
  const rows:any[]=[
    {
      label:"ACCESS",right:"",desc:id==="bench"?"CRAFT GEAR":id==="pile"?"STORE OR TAKE LOGS":"LIGHT OR STOKE FIRE",
      h:15,enabled:true,
      onDown:()=>{
        g.buildConfirm=null;
        if(id==="bench"){
          g.menu="bench";g.stationFrom=true;g.craftTab=0;
          g.menuSel=0;g.craftConfirm=null;g.keys.act=false;
        }else{
          if(id==="hearth")accessHearth(g);else accessStorage(g,meta);
          g.menu=null;g.keys.act=false;
        }
      },
    },
    {...upgrade,label:"UPGRADE"},
  ];
  if(id==="bench"){
    rows.push({
      label:"BUILD PLANS",right:"",desc:"CONSTRUCT NEW CAMP STRUCTURES",
      h:15,enabled:true,
      onDown:()=>{
        if(!g.builtBench || Math.abs(g.player.x-BENCH_X)>=22){
          addStatusMessage(g,"VISIT THE WORKBENCH FOR BUILDING PLANS.");return;
        }
        g.menu="build";g.stationFrom=true;g.buildTab=0;
        g.menuSel=0;g.buildConfirm=null;g.keys.act=false;
      },
    });
  }
  return rows;
}

