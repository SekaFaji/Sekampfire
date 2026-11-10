import { drawText, drawTextC, drawBig } from "./font";

/** Patch #44: every Ash displayed here comes from the existing simulation.
 * Categories are optional in older v1 checkpoints; unattributed Ash stays
 * visible instead of being discarded or silently counted twice. */
export type AshSource = "dawn" | "aurora" | "structures" | "stations" | "longNight";
const SOURCES: { id: AshSource; label: string }[] = [
  {id:"dawn",label:"DAWNS SURVIVED"},
  {id:"aurora",label:"AURORA NIGHTS"},
  {id:"structures",label:"CAMP STRUCTURES"},
  {id:"stations",label:"STATION UPGRADES"},
  {id:"longNight",label:"THE LONG NIGHT"},
];
const whole = (v: unknown): number => Number.isFinite(v) ?
  Math.max(0, Math.min(10000000, Math.floor(v as number))) : 0;

/** Run-scoped Ash is pending until the existing terminal callback banks it. */
export function grantRunAsh(g:any,source:AshSource,rawAmount:number):number {
  const amount=whole(rawAmount);
  if (!amount) return 0;
  g.ashEarned=whole(g.ashEarned)+amount;
  if (!g.ashLedger || typeof g.ashLedger!=="object" || Array.isArray(g.ashLedger)) g.ashLedger={};
  g.ashLedger[source]=whole(g.ashLedger[source])+amount;
  return amount;
}
export function validatedAshLedger(raw:any):Record<AshSource,number> {
  const out={} as Record<AshSource,number>;
  for(const s of SOURCES) out[s.id]=whole(raw?.[s.id]);
  return out;
}
/** Never display an itemized sum larger than the actual pending balance. */
export function ashSummary(g:any):{total:number;lines:{label:string;amount:number}[]} {
  const total=whole(g.ashEarned), ledger=validatedAshLedger(g.ashLedger);
  let remaining=total;
  const lines:{label:string;amount:number}[]=[];
  for(const source of SOURCES){
    const amount=Math.min(remaining,ledger[source.id]);
    if(amount){lines.push({label:source.label,amount});remaining-=amount;}
  }
  if(remaining)lines.push({label:"EARLIER RUN ASH",amount:remaining});
  return {total,lines};
}
export function canCompleteFirstSettlement(g:any):boolean {
  return g.ui==="run" && !g.over && g.campaignLevel===1 &&
    g.guideLevel>=3 && !g.levelCompletePending &&
    !g.victoryPending && !g.longNightActive && !g.endlessMode;
}
/** Saves pending completion before leaving run UI. This lets Android/browser
 * reload restore the unbanked reward choice without double-paying Ash. */
export function beginFirstSettlementCompletion(g:any,save:()=>void):boolean {
  if(!canCompleteFirstSettlement(g))return false;
  g.levelCompletePending=true;
  g.keys={};g.pleft=false;g.pright=false;g.pressE=false;
  g.menu=null;
  save();
  g.ui="levelComplete";
  return true;
}
export function unlockedCampaignLevel(meta:any):number {
  return meta?.maxCampaignLevel===2?2:1;
}
function rect(ctx:any,x:number,y:number,w:number,h:number,fill:string){
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);
}
function button(ctx:any,g:any,x:number,y:number,w:number,label:string,action:()=>void){
  rect(ctx,x,y,w,16,"#293c49");
  rect(ctx,x,y,w,1,"#c5a06a");
  rect(ctx,x,y+15,w,1,"#685339");
  rect(ctx,x,y,1,16,"#ad8759");
  rect(ctx,x+w-1,y,1,16,"#75583b");
  drawTextC(ctx,label,x+w/2,y+5,"#ffdfa5");
  g.zones.push({x,y,w,h:16,onDown:action});
}
/** Native 320x180 original-pixel summary. No extra asset or modal overlay. */
export function drawCampaignResult(ctx:any,g:any,meta:any,
  actions:{bank:()=>void;replay:()=>void;shop:()=>void;main:()=>void}):void {
  rect(ctx,0,0,320,180,"rgba(5,11,19,0.83)");
  rect(ctx,21,8,278,164,"#152633");
  rect(ctx,21,8,278,1,"#c19a65");
  rect(ctx,21,171,278,1,"#735638");
  rect(ctx,21,8,1,164,"#c19a65");
  rect(ctx,298,8,1,164,"#735638");
  const banked=g.ui==="levelBanked";
  drawBig(ctx,"LEVEL 1 COMPLETE",160,16,2,"#f5d596");
  drawTextC(ctx,"THE FIRST SETTLEMENT",160,37,"#e1c49a");
  if(banked){
    const amount=whole(g.lastResult?.ash);
    drawTextC(ctx,"+"+amount+" ASH BANKED",160,52,"#ffe09c");
    drawTextC(ctx,"BANKED ASH "+whole(meta?.ash),160,65,"#d3e0e2");
    drawTextC(ctx,"LEVEL 2 UNLOCKED!",160,82,"#acd8a3");
    drawTextC(ctx,"NEW CHALLENGES ARRIVE IN THE NEXT UPDATE.",160,96,"#b9c8d5");
    drawTextC(ctx,"PERMANENT UPGRADES AND MUSEUM ARE SAVED.",160,109,"#adbcce");
    button(ctx,g,35,130,112,"REPLAY LEVEL 1",actions.replay);
    button(ctx,g,173,130,112,"ASH SHOP",actions.shop);
    button(ctx,g,93,150,134,"MAIN MENU",actions.main);
    return;
  }
  const summary=ashSummary(g);
  drawText(ctx,"ASH EARNED THIS RUN",32,51,"#f9dca9");
  let y=63;
  for(const line of summary.lines.slice(0,5)){
    drawText(ctx,line.label,36,y,"#bad0db");
    drawTextC(ctx,"+"+line.amount,259,y,"#ffe4a3");
    y+=9;
  }
  drawTextC(ctx,"RUN ASH +"+summary.total+"    BANKED "+whole(meta?.ash),160,110,"#ffe2ab");
  drawTextC(ctx,"BANK TO UNLOCK LEVEL 2 AND RESET THIS CAMP.",160,120,"#d1d9df");
  button(ctx,g,54,135,212,"BANK ASH + FINISH LEVEL",actions.bank);
  drawTextC(ctx,"ASH BUYS PERMANENT UPGRADES IN THE SHOP.",160,157,"#a8bccc");
  drawTextC(ctx,"NEW LEVEL 2 CONTENT IS STILL IN DEVELOPMENT.",160,166,"#899daf");
}
