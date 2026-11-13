import { clamp } from "./math";
import { revealShopCard58 } from "./shopScroll58";
import { dismissStationSelection } from "./proximity45";

/** Menu close rules and keyboard selection state live outside the engine.
 * Rendering owns row construction; selection receives its current rows.
 * The order of clearing confirmations and returning to parent menus is
 * intentionally preserved for legacy checkpoints and existing controls. */
// close the open menu; settings opened from pause returns to the pause menu
export function closeMenu(g: any) {
  dismissStationSelection(g);
  g.craftConfirm = null;
  g.buildConfirm = null;
  g.endRunConfirm = false;
  if (g.menu === "inventory") {
    g.menu = g.inventoryFrom === "pause" ? "pause" : null;
    g.inventoryFrom = "run";
    g.menuSel = 0;
    g.keys.act = false;
    return;
  }
  if (g.menu === "quickslot") {
    g.menu = g.quickSlotFrom === "toolbar" ? "toolbar" : null;
    g.menuSel = 0;
    g.keys.act = false;
    return;
  }
  if (g.menu === "toolbar") {
    g.menu = "pause";
    g.menuSel = 0;
    g.keys.act = false;
    return;
  }
  if ((g.menu==="build" || g.menu==="bench") && g.stationFrom) {
    g.stationFrom=false;
    g.menu="station";
    g.menuSel=0;
    g.keys.act=false;
    return;
  }
  if (g.menu==="station") {
    g.menu=null;
    g.menuSel=0;
    g.keys.act=false;
    return;
  }
  if (["audio", "privacy", "credits", "reset1", "reset2"].includes(g.menu)) {
    g.menu = "settings";
    g.menuSel = 0;
    return;
  }
  if (g.menu === "settings" && g.settingsFrom === "pause") {
    g.settingsFrom = null;
    g.menu = "pause";
    g.menuSel = 0;
    return;
  }
  g.menu = null;
  g.keys.act = false;
}

export function moveSelection(g: any, rows: any[], dir: number): void {
  if (!rows.length) return;
  g.menuSel = (g.menuSel + dir + rows.length) % rows.length;
  if (g.menu === "shop") {
    g.upConfirm = null;
    if(g.shopTab===0)revealShopCard58(g,g.menuSel,rows.length);
  }
  if (g.menu === "bench") g.craftConfirm = null;
  if (g.menu === "pause") g.endRunConfirm = false;
  if (g.menu === "build" || g.menu === "bench" || g.menu === "station") g.buildConfirm = null;
}

export function activateSelection(g: any, rows: any[]): void {
  if (!rows.length) return;
  g.menuSel = clamp(g.menuSel, 0, rows.length - 1);
  if(g.menu==="shop")rows[g.menuSel].buy?.();
  else rows[g.menuSel].onDown();
}

