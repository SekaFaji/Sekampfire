import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { createEngine, titleActions, bankLevelOne, handleKey } from "./game";
import { loadMeta, saveMeta, saveRunSnapshot, loadRunSnapshot, captureRunSnapshot } from "./save";
import {
  ashSummary, grantRunAsh, validatedAshLedger, beginFirstSettlementCompletion,
  canCompleteFirstSettlement, drawCampaignResult, unlockedCampaignLevel,
} from "./campaign44";
let storage: Map<string,string>;
const meta=()=>({ash:12,totalAsh:12,best:0,runs:0,up:{},maxCampaignLevel:1,lastBankedRunId:null});
beforeEach(()=>{
  storage=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(k:string)=>storage.get(k)??null,
    setItem:(k:string,v:string)=>storage.set(k,String(v)),
    removeItem:(k:string)=>storage.delete(k)
  });
});
afterEach(()=>vi.unstubAllGlobals());
function campaign(){
  const g=createEngine();g.ui="run";g.campaignLevel=1;g.campaignRunId="lv1-test-42";
  g.guideLevel=3;g.trees=[];g.pickups=[];g.falling=[];
  g.player.warmth=100;return g;
}

describe("Patch #44: Level 1 completion and safe Ash rewards",()=>{
  it("starts fresh runs as Level 1 without changing older saved run semantics",()=>{
    const g=createEngine();
    const action=titleActions(g,meta()).find((a:any)=>a.label==="START RUN");
    action.act();
    expect(g.ui).toBe("run");
    expect(g.campaignLevel).toBe(1);
    expect(g.campaignRunId).toMatch(/^lv1-/);
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.campaignLevel).toBe(1);
    expect(snap.state.campaignRunId).toBe(g.campaignRunId);
    // A v1 checkpoint without the opt-in campaign field stays legacy.
    expect(canCompleteFirstSettlement({...campaign(),campaignLevel:0})).toBe(false);
  });

  it("itemizes only real earned sources and includes an honest fallback for old saves",()=>{
    const g=campaign();
    grantRunAsh(g,"dawn",4);
    grantRunAsh(g,"aurora",2);
    grantRunAsh(g,"structures",8);
    grantRunAsh(g,"stations",2);
    expect(ashSummary(g)).toEqual({total:16,lines:[
      {label:"DAWNS SURVIVED",amount:4},
      {label:"AURORA NIGHTS",amount:2},
      {label:"CAMP STRUCTURES",amount:8},
      {label:"STATION UPGRADES",amount:2},
    ]});
    const old=campaign();old.ashEarned=11;
    old.ashLedger={dawn:3,aurora:9000000000,structures:-20,unknown:200};
    expect(ashSummary(old)).toEqual({total:11,lines:[
      {label:"DAWNS SURVIVED",amount:3},{label:"AURORA NIGHTS",amount:8},
    ]});
    old.ashLedger={dawn:3};
    expect(ashSummary(old).lines).toContainEqual({label:"EARLIER RUN ASH",amount:8});
    expect(validatedAshLedger({stations:NaN}).stations).toBe(0);
  });

  it("transitions once to a resumable, unbanked completion choice",()=>{
    const g=campaign();const banked=meta();
    grantRunAsh(g,"dawn",4);
    expect(canCompleteFirstSettlement(g)).toBe(true);
    expect(beginFirstSettlementCompletion(g,()=>saveRunSnapshot(g))).toBe(true);
    expect(g.ui).toBe("levelComplete");
    expect(g.levelCompletePending).toBe(true);
    expect(beginFirstSettlementCompletion(g,()=>saveRunSnapshot(g))).toBe(false);
    expect(banked.ash).toBe(12); // no automatic transfer
    const saved=loadRunSnapshot();
    expect(saved.levelCompletePending).toBe(true);
    expect(saved.campaignLevel).toBe(1);
    expect(saved.ashLedger.dawn).toBe(4);
    expect(captureRunSnapshot(g).version).toBe(1);
  });

  it("only completed Level 1 enters the pending result screen",()=>{
    const g=campaign();
    for (const key of ["over","levelCompletePending","victoryPending","endlessMode","longNightActive"]) {
      const test={...g,[key]:true};
      expect(canCompleteFirstSettlement(test)).toBe(false);
    }
    expect(canCompleteFirstSettlement({...g,guideLevel:2})).toBe(false);
    expect(canCompleteFirstSettlement({...g,ui:"title"})).toBe(false);
    expect(canCompleteFirstSettlement({...g,campaignLevel:0,guideLevel:5})).toBe(false);
  });

  it("banks by explicit keyboard/button callback only, then blocks repeat interactions",()=>{
    const g=campaign(), m=meta(), calls:any[]=[];
    grantRunAsh(g,"dawn",4);
    beginFirstSettlementCompletion(g,()=>saveRunSnapshot(g));
    g.cb={end:(kind:string,stats:any)=>{
      calls.push({kind,stats});
      m.ash+=stats.ash;m.totalAsh+=stats.ash;
      m.maxCampaignLevel=2;m.lastBankedRunId=g.campaignRunId;
      saveMeta(m);
      g.ashBanked=true;g.ui="levelBanked";
    }};
    handleKey(g,m,"enter",true);
    expect(calls).toHaveLength(1);
    expect(calls[0].kind).toBe("campaign");
    expect(calls[0].stats.ash).toBe(4);
    expect(m.ash).toBe(16);
    expect(unlockedCampaignLevel(m)).toBe(2);
    bankLevelOne(g,m);
    expect(calls).toHaveLength(1);
    expect(loadMeta().maxCampaignLevel).toBe(2);
    expect(loadMeta().lastBankedRunId).toBe("lv1-test-42");
  });

  it("does not infer an unlocked Level 2 from legacy Long Night completion",()=>{
    const m=meta();m.wonEver=true;
    saveMeta(m);
    expect(loadMeta().maxCampaignLevel).toBe(1);
    expect(unlockedCampaignLevel(m)).toBe(1);
    const old=campaign();old.campaignLevel=0;old.guideLevel=5;
    expect(beginFirstSettlementCompletion(old,()=>{})).toBe(false);
  });

  it("draws safe, click-only 320x180 pending and banked screens",()=>{
    const g=campaign(),m=meta(),rects:any[]=[];
    const ctx={fillStyle:"",fillRect:(x:number,y:number,w:number,h:number)=>{
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
      rects.push({x,y,w,h});
    }};
    const calls:string[]=[];
    const actions={bank:()=>calls.push("bank"),replay:()=>calls.push("replay"),
      shop:()=>calls.push("shop"),main:()=>calls.push("main")};
    beginFirstSettlementCompletion(g,()=>{});
    drawCampaignResult(ctx,g,m,actions);
    expect(rects.length).toBeGreaterThan(30);
    expect(g.zones).toHaveLength(1);
    g.zones[0].onDown();
    expect(calls).toEqual(["bank"]);
    g.ui="levelBanked";g.zones=[];g.lastResult={ash:11};
    drawCampaignResult(ctx,g,{...m,ash:23,maxCampaignLevel:2},actions);
    expect(g.zones).toHaveLength(3);
    g.zones[2].onDown();
    expect(calls).toEqual(["bank","main"]);
  });
});
