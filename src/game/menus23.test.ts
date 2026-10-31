import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { createEngine, update, titleActions, pauseRows, shopRows, goEndless, benchRows, buildRows, closeMenu } from "./game";
import { captureRunSnapshot, loadRunSnapshot, loadMeta, saveMeta } from "./save";
import { drawShopTabs } from "./menuScreens";
import { DAY_LEN, LONG_NIGHT_LEN } from "./config";

const meta = () => ({ ash: 15, totalAsh: 80, up: {dog:1}, best: 6, runs: 2 });
let storage: Map<string,string>;
beforeEach(() => {
  storage = new Map();
  vi.stubGlobal("localStorage", {
    getItem:(k:string)=>storage.get(k)??null,
    setItem:(k:string,v:string)=>storage.set(k,v),
    removeItem:(k:string)=>storage.delete(k)
  });
});
afterEach(()=>vi.unstubAllGlobals());

describe("clear Ash banking and resumable victory", () => {
  it("does not bank Ash automatically when the Long Night ends", () => {
    const g = createEngine(), m=meta(), banked:any[]=[];
    g.ui="run";g.night=6;g.time=DAY_LEN+LONG_NIGHT_LEN-0.01;
    g.isNight=true;g.longNightActive=true;g.ashEarned=30;
    g.trees=[];g.pickups=[];g.falling=[];g.cb={end:(...a:any[])=>banked.push(a)};
    update(g,m,0.12,{end:(...a:any[])=>banked.push(a),toast:()=>{}});
    expect(g.ui).toBe("win");
    expect(g.victoryPending).toBe(true);
    expect(g.ashEarned).toBe(130);
    expect(banked).toHaveLength(0);
    expect(m.ash).toBe(15);
    expect(loadRunSnapshot()?.victoryPending).toBe(true);
    expect(loadRunSnapshot()?.ashEarned).toBe(130);
    const restored=createEngine();
    restored.resumeData=loadRunSnapshot();
    restored.cb={end:(...a:any[])=>banked.push(a)};
    titleActions(restored,m)[0].act();
    expect(restored.ui).toBe("win");
    expect(restored.ashEarned).toBe(130);
    expect(restored.cb).toBeDefined();
    goEndless(restored);
    expect(restored.victoryPending).toBe(false);
    expect(restored.ui).toBe("run");
    expect(restored.ashEarned).toBe(130);
    expect(loadRunSnapshot()?.victoryPending).toBe(false);
  });
  it("shows an explicit double-tap confirmation when retiring and preserves current rewards", () => {
    const g=createEngine(), m=meta();g.ui="run";g.menu="pause";g.ashEarned=48;
    const events:any[]=[];g.cb={end:(kind:string,stats:any)=>events.push({kind,stats})};
    let rows=pauseRows(g,m);
    expect(rows[2].right).toBe("+48 ASH");
    rows[2].onDown();
    expect(events).toHaveLength(0);
    expect(pauseRows(g,m)[2].right).toBe("CONFIRM?");
    pauseRows(g,m)[2].onDown();
    expect(events).toEqual([{kind:"retired",stats:{nights:0,ash:48}}]);
    closeMenu(g);
    expect(g.endRunConfirm).toBe(false);
  });
  it("old checkpoints remain loadable with no victory flags", () => {
    const g=createEngine();g.ui="run";g.trees=[];g.pickups=[];
    const snap=captureRunSnapshot(g);
    delete snap.state.won;delete snap.state.victoryPending;
    const restored=createEngine();restored.resumeData=snap.state;
    titleActions(restored,meta())[0].act();
    expect(restored.ui).toBe("run");
    expect(restored.victoryPending).toBe(false);
  });
});

describe("menus split without hiding ownership or overlapping exit", () => {
  it("moves Good Dog to Pets while preserving the existing ownership key", () => {
    const g=createEngine(),m=meta();
    g.shopTab=0;
    expect(shopRows(g,m).map((x:any)=>x.label)).not.toContain("GOOD DOG");
    expect(shopRows(g,m)).toHaveLength(6);
    g.shopTab=1;
    expect(shopRows(g,m)).toHaveLength(1);
    expect(shopRows(g,m)[0].right).toBe("EQUIPPED");
    g.shopTab=2;
    expect(shopRows(g,m)).toHaveLength(0); // placeholder tab displays no rows
    expect(m.up.dog).toBe(1);
  });
  it("Shop header remains clear of all three tabs and close hit target", () => {
    const ctx:any={
      fillRect:()=>{}, set fillStyle(_x:any){}, get fillStyle(){return "";}
    },g=createEngine(),m=meta();
    g.zones=[];g.shopTab=0;
    drawShopTabs(ctx,g,m,shopRows(g,m),()=>{});
    const close=g.zones.find((z:any)=>z.x===278&&z.y===13);
    expect(close).toBeDefined();
    const tabs=g.zones.filter((z:any)=>z.y===33&&z.h===16);
    expect(tabs).toHaveLength(3);
    expect(tabs.map((z:any)=>z.x)).toEqual([30,116,202]);
    expect(tabs.every((z:any)=>z.y>=close.y+close.h)).toBe(true);
    tabs[1].onDown();expect(g.shopTab).toBe(1);
    tabs[2].onDown();expect(g.shopTab).toBe(2);
  });
  it("separates Build structures/upgrades and Craft tools/supplies", () => {
    const g=createEngine(),m=meta();
    g.builtBench=true;g.builtPile=true;g.menu="build";
    g.buildTab=0;
    expect(buildRows(g,m)).toHaveLength(2);
    expect(buildRows(g,m)[1].label).toBe("BUILD LOG MUSEUM");
    g.buildTab=1;
    expect(buildRows(g,m)).toHaveLength(3);
    g.menu="bench";g.craftTab=0;
    expect(benchRows(g,m)).toHaveLength(3);
    g.craftTab=1;
    expect(benchRows(g,m)).toHaveLength(4);
  });
});
