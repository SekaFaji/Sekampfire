import { W, H } from "./config";
import { drawText, drawTextC, textW } from "./font";
import { px } from "./renderUtils";
import { AUDIO } from "./audio";

/** The title menu's panel is the visual baseline for list menus.
 * Settings screens sit on top of the title/game plus a modal veil, so their
 * own fill and selected controls are lighter to avoid stacked opacity.
 * These are draw-only values; every hit zone keeps its original coordinates. */
export const MENU_PANEL_INK = "rgba(8,12,26,0.75)";
export const SETTINGS_PANEL_INK = "rgba(8,12,26,0.56)";
export const SETTINGS_SELECTED_INK = "rgba(255,217,138,0.07)";
export const SETTINGS_SLIDER_INK = "rgba(41,53,71,0.56)";
export const SETTINGS_VEIL_INK = "rgba(4,6,16,0.12)";

export function isSettingsFamily(menu: unknown): boolean {
  return menu === "settings" || menu === "audio" || menu === "reset1" || menu === "reset2";
}

function menuCloseZone(ctx: any, g: any, x: number, y: number, onClose: () => void): void {
  drawText(ctx, "X", x, y, "#c88a5a");
  g.zones.push({ x: x - 4, y: y - 3, w: 14, h: 11, onDown: onClose });
}

export function panel(ctx: any, x: number, y: number, w: number, h: number, ink = MENU_PANEL_INK) {
  ctx.fillStyle = ink;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#6a4a26";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = "#c9a86a";
  ctx.fillRect(x + 1, y + 1, w - 2, 1);
  px(ctx, x + 1, y + 1, 1, 1, "#e8d4a8");
  px(ctx, x + w - 2, y + 1, 1, 1, "#e8d4a8");
}

export function drawListMenuFrame(ctx: any, g: any, title: string, right: string, rows: any[], onClose: () => void): void {
  const n = rows.length, tabs = g.menu === "bench";
  const settingsFamily = isSettingsFamily(g.menu);
  const pw = 272, ph = 32 + n * 15 + 12 + (tabs ? 18 : 0);
  const x0 = Math.round((W - pw) / 2);
  const y0 = Math.max(8, Math.round((H - ph) / 2) - 4);
  g.menuRect = {x:x0,y:y0,w:pw,h:ph};
  panel(ctx, x0, y0, pw, ph, settingsFamily ? SETTINGS_PANEL_INK : MENU_PANEL_INK);
  drawText(ctx, title, x0 + 6, y0 + 5, "#ffd98a");
  drawText(ctx, right, x0 + pw - 24 - textW(right), y0 + 5, "#cfc2f0");
  menuCloseZone(ctx, g, x0 + pw - 12, y0 + 5, onClose);
  let y = y0 + 16;
  if (tabs) {
    const isBuild = g.menu === "build";
    const active = isBuild ? g.buildTab : g.craftTab;
    const labels = isBuild ? ["STRUCTURES","UPGRADES"] : ["TOOLS","SUPPLIES"];
    for (let t = 0; t < 2; t++) {
      const tx = x0 + 7 + t * 129;
      px(ctx, tx, y, 124, 15, t===active ? "#77502e" : "#29394b");
      px(ctx, tx, y, 124, 1, t===active ? "#d4ad74" : "#657389");
      drawTextC(ctx, labels[t], tx + 62, y + 4, "#ffe6ba");
      const index = t;
      g.zones.push({x:tx,y,w:124,h:15,onDown:()=>{
        if (isBuild) g.buildTab=index; else g.craftTab=index;
        g.menuSel=0;g.buildConfirm=null;g.craftConfirm=null;
      }});
    }
    y += 18;
  }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (i === g.menuSel) {
      px(ctx, x0 + 3, y, pw - 6, r.h,
        r.red ? (settingsFamily ? "rgba(211,65,65,0.14)" : "rgba(211,65,65,0.22)") : (settingsFamily ? SETTINGS_SELECTED_INK : "rgba(255,217,138,0.11)"));
      px(ctx, x0 + 3, y + 1, 2, Math.max(1, r.h - 2),
        r.red ? "#f37e70" : "#dcb779");
    }
    drawText(ctx, r.label, x0 + 9, y + 1, !r.enabled ? "#5a6480" : r.red ? "#ff7272" : "#ffe9c8");
    drawText(ctx, r.right, x0 + pw - 9 - textW(r.right), y + 1, !r.enabled ? "#5a6480" : r.red ? "#ff7272" : "#d9c9a0");
    drawText(ctx, r.desc, x0 + 9, y + 8, "#a4acc0");
    if (r.volumeKey) {
      const level = AUDIO.getLevel(r.volumeKey);
      ctx.fillStyle = settingsFamily ? SETTINGS_SLIDER_INK : "rgba(41,53,71,0.92)";
      ctx.fillRect(x0 + 191, y + 10, 49, 3);
      if (level > 0) {
        ctx.fillStyle = "#caa46b";
        ctx.fillRect(x0 + 191, y + 10, Math.round(level * 49 / 100), 3);
      }
    }
    const idx = i;
    g.zones.push({ x: x0 + 3, y, w: pw - 6, h: r.h, onDown: () => { g.menuSel = idx; rows[idx].onDown(); } });
    if (r.onAdjust) {
      // Separate +/- touch targets; full row still increments for convenience.
      g.zones.push({ x: x0 + pw - 39, y, w: 12, h: r.h, onDown: () => { g.menuSel = idx; r.onAdjust(-1); } });
      g.zones.push({ x: x0 + pw - 17, y, w: 12, h: r.h, onDown: () => { g.menuSel = idx; r.onAdjust(1); } });
    }
    y += r.h;
  }
  const foot = "W/S PICK - E SELECT - ESC CLOSE";
  drawText(ctx, foot, Math.round(W / 2 - textW(foot) / 2), y + 4, "#5a6480");
}

