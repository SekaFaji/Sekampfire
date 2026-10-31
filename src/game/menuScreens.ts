import { drawText, drawTextC, textW } from "./font";
import { drawTutorialArt, TUTORIAL_PAGES } from "./tutorial";

function frame(ctx: any, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "rgba(8,12,26,0.94)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#bb945d";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}
function action(ctx: any, g: any, x: number, y: number, w: number, label: string,
                click: () => void, enabled = true, selected = false) {
  ctx.fillStyle = enabled ? (selected ? "#76502b" : "#273a4c") : "#212b38";
  ctx.fillRect(x, y, w, 16);
  ctx.fillStyle = enabled ? "#bb945d" : "#4c5a69";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + 15, w, 1);
  drawTextC(ctx, label, x + w / 2, y + 5, enabled ? "#f9dfa6" : "#68798a");
  if (enabled) g.zones.push({ x, y, w, h: 16, onDown: click });
}
function exit(ctx: any, g: any, close: () => void) {
  action(ctx, g, 278, 13, 17, "X", close);
}
/** A seven-step interactive storyboard using only actual game sprites. */
export function drawIllustratedGuide(ctx: any, g: any, close: () => void) {
  const page = Math.max(0, Math.min(Math.floor(g.helpPage || 0), TUTORIAL_PAGES.length - 1));
  g.helpPage = page;
  const step = TUTORIAL_PAGES[page];
  frame(ctx, 18, 8, 284, 164);
  drawText(ctx, "HOW TO PLAY", 27, 17, "#ffd98a");
  drawText(ctx, (page + 1) + " / " + TUTORIAL_PAGES.length, 234, 17, "#aebcce");
  exit(ctx, g, close);
  drawTutorialArt(ctx, g, page);
  drawTextC(ctx, step.title, 160, 110, "#ffdc91");
  for (let i = 0; i < step.lines.length; i++) {
    drawTextC(ctx, step.lines[i], 160, 120 + i * 8, "#bdc9da");
  }
  action(ctx, g, 29, 150, 57, "BACK",
    () => { g.helpPage = Math.max(0, page - 1); }, page > 0);
  action(ctx, g, 118, 150, 84, "CLOSE", close);
  action(ctx, g, 234, 150, 57, page === TUTORIAL_PAGES.length - 1 ? "DONE" : "NEXT",
    () => { if (page + 1 === TUTORIAL_PAGES.length) close(); else g.helpPage = page + 1; });
}
/** The 3-tab Shop keeps its title, Ash and close action on a separate
 * header row; tabs never overlap the close hitbox at y=13..29.
 */
export function drawShopTabs(ctx: any, g: any, meta: any, rows: any[], close: () => void) {
  frame(ctx, 24, 8, 272, 164);
  drawText(ctx, "SHOP", 32, 13, "#ffd98a");
  const ash = "BANKED ASH " + Math.floor(meta.ash || 0);
  drawText(ctx, ash, 272 - textW(ash), 13, "#e6d2a2");
  exit(ctx, g, close);
  const tab = Math.max(0, Math.min(2, g.shopTab || 0));
  for (const [id, label, x] of [[0,"UPGRADES",30],[1,"PETS",116],[2,"COMING SOON",202]] as const) {
    action(ctx,g,x,33,82,label,()=>{g.shopTab=id;g.menuSel=0;g.upConfirm=null;},true,tab===id);
  }
  if (tab === 2) {
    drawTextC(ctx, "MORE TO DISCOVER", 160, 84, "#e6cf98");
    drawTextC(ctx, "COMING SOON", 160, 97, "#aab7ca");
    drawTextC(ctx, "NOTHING TO BUY HERE YET.", 160, 110, "#8496b2");
  } else {
    g.menuSel = Math.max(0, Math.min(g.menuSel || 0, rows.length - 1));
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], y = 52 + i * 15;
      if (i === g.menuSel) {
        ctx.fillStyle = "rgba(255,218,147,0.13)";
        ctx.fillRect(28,y,264,15);
        ctx.fillStyle = "#dcb779";
        ctx.fillRect(28,y+1,2,13);
      }
      drawText(ctx, r.label, 34, y + 1, !r.enabled ? "#8f9cae" : "#ffe3b4");
      drawText(ctx, r.right, 285 - textW(r.right), y + 1, "#c8b89b");
      drawText(ctx, r.desc, 34, y + 8, "#a6b4c6");
      const index = i;
      g.zones.push({x:28,y,w:264,h:15,onDown:()=>{g.menuSel=index;rows[index].onDown();}});
    }
  }
  drawTextC(ctx, tab === 1 ? "PETS ARE PERMANENT. EQUIP ONE AT A TIME."
    : "ASH IS BANKED BY ENDING A RUN",160,158,"#acbad0");
}
