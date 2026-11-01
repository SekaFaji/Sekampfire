import { describe, expect, it } from "vitest";
import { textW } from "./font";
import { addStatusMessage, tickStatusMessages, statusMessageLines, drawStatusMessages } from "./statusMessages";
import { drawGuideShortcut } from "./guide";
import { createEngine } from "./game";

function canvas(){
  const rects: Array<{x:number;y:number;w:number;h:number}> = [];
  const ctx:any={
    fillStyle: "", globalAlpha:1,
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      rects.push({x,y,w,h});
    }
  };
  return {ctx,rects};
}
describe("Patch #27 compact message flow",()=>{
  it("shows only one temporary message in a fixed top-center strip",()=>{
    const g=createEngine();g.ui="run";g.menu=null;
    addStatusMessage(g,"Tree felled. 3 wood on the ground.");
    addStatusMessage(g,"Workbench built.");
    tickStatusMessages(g,0.20);
    const {ctx,rects}=canvas();
    drawStatusMessages(ctx,g);
    const bar=rects.find(r=>r.y===43&&r.h>=13);
    expect(bar).toBeDefined();
    expect(bar!.x).toBeGreaterThanOrEqual(50);
    expect(bar!.x+bar!.w).toBeLessThanOrEqual(270);
    expect(rects.filter(r=>r.y===43&&r.h>=13)).toHaveLength(1);
    expect(g.toasts).toHaveLength(2);
    tickStatusMessages(g,4);
    expect(g.toasts[0].text).toBe("Workbench built.");
    expect(g.toasts).toHaveLength(1);
    // The second message is displayed only after the first expires.
    tickStatusMessages(g,0.22);
    const second=canvas();
    drawStatusMessages(second.ctx,g);
    expect(second.rects.some(r=>r.y===43)).toBe(true);
  });
  it("breaks long event text into at most two bounded lines",()=>{
    for(const message of [
      "MUSEUM DISCOVERY: FIGURE-8 LOG (LEGENDARY)",
      "GROOTY: ALL LESSONS DONE! PREPARE FOR THE LONG NIGHT.",
      "UPGRADE FIREPLACE WORKBENCH AND LOG STORAGE TO LEVEL ONE BEFORE BUILDING",
      "SUPERCALIFRAGILISTICEXPIALIDOCIOUSSUPERCALIFRAGILISTICEXPIALIDOCIOUS"
    ]){
      const lines=statusMessageLines(message);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.length).toBeLessThanOrEqual(2);
      expect(lines.every(line=>textW(line)<=194)).toBe(true);
    }
  });
  it("only appears during open gameplay and leaves a tiny independent guide shortcut",()=>{
    const g=createEngine();g.ui="run";g.menu=null;
    addStatusMessage(g,"Tree felled");
    tickStatusMessages(g,0.2);
    const v=canvas();
    drawGuideShortcut(v.ctx,g);
    expect(g.zones).toHaveLength(1);
    expect(g.zones[0]).toMatchObject({x:8,y:45,w:17,h:16});
    const overlay=v.rects.slice();
    expect(overlay.every(r=>r.w<200&&r.h<25)).toBe(true);
    drawStatusMessages(v.ctx,g);
    const bar=v.rects.find(r=>r.y===43&&r.w>=78);
    expect(bar).toBeDefined();
    expect(bar!.x).toBeGreaterThan(25);
    g.zones[0].onDown();
    expect(g.menu).toBe("guide");
    const held=canvas();
    drawStatusMessages(held.ctx,g);
    expect(held.rects).toHaveLength(0);
    g.ui="title";g.menu=null;
    drawStatusMessages(held.ctx,g);
    expect(held.rects).toHaveLength(0);
  });
  it("keeps event bursts bounded instead of expanding into a stack",()=>{
    const g=createEngine();g.ui="run";
    ["a","b","c","d","e"].forEach(s=>addStatusMessage(g,s));
    expect(g.toasts.map((x:any)=>x.text)).toEqual(["c","d","e"]);
    tickStatusMessages(g,3.5);
    expect(g.toasts.map((x:any)=>x.text)).toEqual(["d","e"]);
    tickStatusMessages(g,3.5);
    expect(g.toasts.map((x:any)=>x.text)).toEqual(["e"]);
  });
});
