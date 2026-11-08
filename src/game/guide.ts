import { CX } from "./config";
import { drawText, drawTextC } from "./font";
import { px } from "./renderUtils";
import { stationLevel } from "./campProgress";
import { campEstablished } from "./campBoundary";
import { visualSeason } from "./palette";

/** Grooty is a fixed world NPC, never a harvestable tree or an inventory item. */
export const GROOTY_X = CX - 92;
type Objective = { label: string; hint: string; met: (g: any) => boolean };
type Level = { title: string; greeting: string; goals: Objective[] };
export const GUIDE_LEVELS: Level[] = [
  { title: "FIRST CAMP", greeting: "WELCOME! LET US CLAIM A PLACE TO CALL HOME.", goals: [
    { label: "CHOP ONE TREE", hint: "HOLD ACT NEAR A TREE. KEEP STILL!", met: g => (g.guideChops || 0) >= 1 },
    { label: "BUILD THE LEFT FENCE POST", hint: "PLACE ONE LOG AT THE LEFT CAMP MARKER.", met: g => !!g.fenceLeft },
    { label: "BUILD THE RIGHT FENCE POST", hint: "PLACE ONE LOG AT THE RIGHT CAMP MARKER.", met: g => !!g.fenceRight },
    { label: "LIGHT THE CAMPFIRE", hint: "PRESS ACT BESIDE THE FIRE PIT.", met: g => !!g.everLit },
    { label: "FEED ONE LOG TO THE FIRE", hint: "BRING WOOD TO THE LIT FIRE AND PRESS ACT.", met: g => (g.guideStokes || 0) >= 1 },
    { label: "SURVIVE YOUR FIRST NIGHT", hint: "STAY WARM UNTIL THE SUN RISES.", met: g => g.night >= 1 && !g.isNight },
  ] },
  { title: "LOG STORAGE", greeting: "FIVE LOGS CAN CLAIM MORE LAND TO THE EAST.", goals: [
    { label: "EXPAND YOUR CAMP FOR 5 LOGS", hint: "FIND THE EAST FENCE MARKER AND PRESS ACT.", met: g => campEstablished(g) && g.campExpansion >= 1 },
    { label: "BUILD LOG STORAGE", hint: "CARRY 15 LOGS TO THE PILE SITE AND USE ACT.", met: g => !!g.builtPile },
    { label: "STORE 10 LOGS", hint: "TAKE LOGS TO THE FINISHED PILE AND PRESS ACT.", met: g => !!g.guideStoredTen || g.stored >= 10 },
    { label: "UPGRADE STORAGE TO LV1", hint: "OPEN BUILD, THEN UPGRADES.", met: g => stationLevel(g, "pile") >= 1 },
  ] },
  { title: "TOOLS OF THE TRADE", greeting: "SMART CAMPERS BUILD SMARTER TOOLS.", goals: [
    { label: "BUILD THE WORKBENCH", hint: "ADD 15 LOGS TO THE WORKBENCH SITE.", met: g => !!g.builtBench },
    { label: "CRAFT THE TIMBER PACK", hint: "VISIT THE BENCH, THEN CRAFT > TOOLS.", met: g => !!g.crafts?.pack },
  ] },
  { title: "A WARMER HOME", greeting: "NOW LET US MAKE THIS CAMP COSY.", goals: [
    { label: "BUILD WOOD RING AND LOG BENCH", hint: "OPEN BUILD > STRUCTURES.", met: g => g.stage >= 2 },
    { label: "UPGRADE FIREPLACE TO LV1", hint: "OPEN BUILD > UPGRADES.", met: g => stationLevel(g, "hearth") >= 1 },
  ] },
  { title: "THE HOMESTEAD", greeting: "A REAL HOME WILL WEATHER THE WINTER.", goals: [
    { label: "BUILD THROUGH CABIN WALLS", hint: "KEEP BUILDING SHELTER UNDER STRUCTURES.", met: g => g.stage >= 5 },
    { label: "ALL THREE STATIONS TO LV1", hint: "UPGRADE FIREPLACE, BENCH AND STORAGE.", met: g => ["hearth","bench","pile"].every(id => stationLevel(g, id as "hearth" | "bench" | "pile") >= 1) },
    { label: "COMPLETE CABIN AND HEARTH", hint: "FINISH THE LAST STRUCTURE IN BUILD.", met: g => g.stage >= 6 },
  ] },
];

/** The completed levels are run-local. Building legacy upgrades can eventually
 * satisfy objectives from the restored structure state, without persisting levels. */
export function guideProgress(g: any) {
  const index = Math.max(0, Math.min(GUIDE_LEVELS.length, Math.floor(g.guideLevel || 0)));
  if (index === GUIDE_LEVELS.length) return { index, level: null, done: 0, total: 0, next: null };
  const level = GUIDE_LEVELS[index];
  const done = level.goals.filter(goal => goal.met(g)).length;
  const next = level.goals.find(goal => !goal.met(g)) || null;
  return { index, level, done, total: level.goals.length, next };
}

export function advanceGuide(g: any, notify: (message: string) => void) {
  let climbed = 0;
  while (g.guideLevel < GUIDE_LEVELS.length) {
    const p = guideProgress(g);
    if (!p.level || p.next) break;
    g.guideLevel++;
    climbed++;
  }
  if (climbed) {
    if (g.guideLevel === GUIDE_LEVELS.length) notify("GROOTY: ALL LESSONS DONE! PREPARE FOR THE LONG NIGHT.");
    else notify("GROOTY: WELL DONE! LEVEL " + (g.guideLevel + 1) + " - " + GUIDE_LEVELS[g.guideLevel].title);
  }
}

/** Original pixel shapes: seasonal leaves, friendly carved face and subtle blink. */
export function drawGrooty(ctx: any, g: any) {
  const x = GROOTY_X, y = 150, season = visualSeason(g);
  const leaves = season === "autumn" ? ["#b56d38","#d19a4e","#e9ba68"]
    : season === "winter" ? ["#5d8790","#8db4b8","#dde9e8"]
    : season === "spring" ? ["#608f5f","#87b66c","#aed388"]
    : ["#367858","#518f53","#7fae62"];
  const wave = Math.round(Math.sin((g.animT || 0) * 1.4));
  px(ctx,x-10,y-1,20,2,"rgba(25,27,35,0.22)");
  px(ctx,x-5,y-25,10,24,"#4b3428");
  px(ctx,x-4,y-25,8,23,"#785237");
  px(ctx,x-2,y-24,2,21,"#a07648");
  px(ctx,x-8,y-5,4,5,"#63442f");px(ctx,x+4,y-5,4,5,"#63442f");
  px(ctx,x-16,y-23,11,3,"#62462d");px(ctx,x+5,y-27,10,3,"#62462d");
  px(ctx,x-19,y-30+wave,10,11,leaves[0]);px(ctx,x+9,y-33-wave,11,12,leaves[0]);
  px(ctx,x-14,y-43,28,20,leaves[0]);px(ctx,x-11,y-46,23,18,leaves[1]);
  px(ctx,x-6,y-48,13,9,leaves[2]);px(ctx,x-19,y-28,8,6,leaves[1]);
  px(ctx,x+12,y-29,7,8,leaves[1]);
  px(ctx,x-5,y-26,10,12,"#b4895a");
  px(ctx,x-4,y-25,8,10,"#c49a69");
  const blink = Math.sin((g.animT || 0) * 0.83) > 0.992;
  px(ctx,x-3,y-22,2,blink?1:3,"#342b29");
  px(ctx,x+2,y-22,2,blink?1:3,"#342b29");
  px(ctx,x-1,y-16,3,1,"#69432d");
  px(ctx,x,y-15,3,1,"#513421");
}

/** The full checklist lives in Grooty's dialogue; only a tiny help
 * shortcut remains on the game screen. It stays outside the event bar. */
export function drawGuideShortcut(ctx: any, g: any) {
  if (g.menu || g.ui !== "run") return;
  const x=8,y=45,w=17,h=16;
  ctx.fillStyle="rgba(35,54,48,0.90)";
  ctx.fillRect(x,y,w,h);
  ctx.fillStyle="#b69a71";
  ctx.fillRect(x,y,w,1);
  ctx.fillRect(x,y,1,h);
  ctx.fillRect(x+w-1,y,1,h);
  drawTextC(ctx,"?",x+9,y+5,"#ffe0a8");
  g.zones.push({x,y,w,h,onDown:()=>{g.menu="guide";g.keys.act=false;}});
}

export function drawGuideDialog(ctx: any, g: any, close: () => void) {
  const p = guideProgress(g), x=22, y=8, w=276, h=162;
  ctx.fillStyle="rgba(9,16,26,0.97)";ctx.fillRect(x,y,w,h);
  ctx.fillStyle="#b38a54";
  ctx.fillRect(x,y,w,1);ctx.fillRect(x,y+h-1,w,1);ctx.fillRect(x,y,1,h);ctx.fillRect(x+w-1,y,1,h);
  drawText(ctx,"GROOTY - YOUR CAMP GUIDE",32,16,"#f5d69a");
  ctx.fillStyle="#405368";ctx.fillRect(268,13,21,16);
  drawTextC(ctx,"X",278,18,"#ffdfb0");
  g.zones.push({x:268,y:13,w:21,h:16,onDown:close});
  if (!p.level) {
    drawTextC(ctx,"ALL FIVE LESSONS COMPLETE!",160,63,"#ffdf9d");
    drawTextC(ctx,"YOU KNOW HOW TO BUILD AND SURVIVE.",160,81,"#cad7db");
    drawTextC(ctx,"NOW PREPARE FOR THE LONG NIGHT.",160,99,"#b6d2e1");
  } else {
    drawText(ctx,"LEVEL " + (p.index+1) + " - " + p.level.title,32,39,"#ffdf9d");
    drawText(ctx,p.level.greeting,32,51,"#a7ceb3");
    p.level.goals.forEach((goal,i)=>{
      drawText(ctx,(goal.met(g)?"[X] ":"[ ] ")+goal.label,32,65+i*9,
        goal.met(g)?"#91b99d":"#e6dac3");
    });
    if (p.next) {
      ctx.fillStyle="#2a3743";ctx.fillRect(29,133,262,25);
      drawText(ctx,"GROOTY SAYS:",34,137,"#f4d295");
      drawText(ctx,p.next.hint,34,147,"#c6dbe3");
    }
    drawText(ctx,p.done+" / "+p.total+" GOALS COMPLETE",32,122,"#bbc9d3");
  }
}
