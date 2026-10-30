import { W } from "./config";

/** In-canvas keyboard and pointer controls; callbacks are injected to avoid
 * a cycle between the input adapter and the gameplay/menus module.
 */
export function createInputHandlers(controllers: {
  audioRows: (...args: any[]) => any;
  moveSel: (...args: any[]) => any;
  titleActions: (...args: any[]) => any;
  activateSel: (...args: any[]) => any;
  closeMenu: (...args: any[]) => any;
  activateTitleItem: (...args: any[]) => any;
  startRun: (...args: any[]) => any;
  goEndless: (...args: any[]) => any;
  returnToMainMenu: (...args: any[]) => any;
}) {
  const { audioRows, moveSel, titleActions, activateSel, closeMenu, activateTitleItem, startRun, goEndless, returnToMainMenu } = controllers;
// ============ input ============
function handleKey(g: any, meta: any, k: string, down: boolean) {
  if (g.menu === "audio" && down && ["arrowleft", "a", "arrowright", "d"].includes(k)) {
    const row: any = audioRows(g)[g.menuSel];
    if (row && row.onAdjust) row.onAdjust(k === "arrowleft" || k === "a" ? -1 : 1);
    return;
  }
  if (k === "arrowleft" || k === "a") g.keys.left = !g.menu && down;
  if (k === "arrowright" || k === "d") g.keys.right = !g.menu && down;
  if (!down) {
    if (k === "e" || k === " ") { g.keys.act = false; g.chopBlocked = false; }
    return;
  }
  const isList = ["bench", "shop", "build", "settings", "audio", "reset1", "reset2", "pause"].includes(g.menu);
  if (k === "arrowup" || k === "w") {
    if (isList) moveSel(g, meta, -1);
    else if (g.ui === "title" && !g.menu) g.titleSel = (g.titleSel + titleActions(g, meta).length - 1) % titleActions(g, meta).length;
  }
  if (k === "arrowdown" || k === "s") {
    if (isList) moveSel(g, meta, 1);
    else if (g.ui === "title" && !g.menu) g.titleSel = (g.titleSel + 1) % titleActions(g, meta).length;
  }
  if (k === "e" || k === "enter" || k === " ") {
    if (isList) activateSel(g, meta);
    else if (g.menu === "help") { g.menu = null; }
    else if (g.menu === "privacy" || g.menu === "credits") closeMenu(g);
    else if (g.ui === "title") activateTitleItem(g, meta, g.titleSel);
    else if (g.ui === "dead") startRun(g, meta);
    else if (g.ui === "win") goEndless(g);
    else if (g.ui === "run") { g.pressE = true; g.keys.act = true; }
  }
  if (k === "m" && !g.menu && (g.ui === "dead" || g.ui === "win")) {
    returnToMainMenu(g);
    return;
  }
  if (k === "h" && g.ui === "title" && !g.menu) g.menu = "help";
  if (k === "t" && g.ui === "run" && !g.menu) g.pressT = true;
  if (k === "b") {
    if (g.ui === "run") {
      g.menu = g.menu ? null : "build";
      g.menuSel = 0;
      g.keys.act = false;
    } else if (g.menu) g.menu = null;
  }
  if (k === "escape") {
    if (g.menu) closeMenu(g);
    else if (g.ui === "run" && !g.over) { g.menu = "pause"; g.menuSel = 0; g.keys.act = false; }
  }
  if (k === "p" && g.ui === "run" && !g.over) {
    if (g.menu === "pause") { g.menu = null; g.keys.act = false; }
    else if (!g.menu) { g.menu = "pause"; g.menuSel = 0; g.keys.act = false; }
  }
  if (k === "u" && !g.menu && (g.ui === "title" || g.ui === "dead" || g.ui === "win")) { g.menu = "shop"; g.menuSel = 0; }
  if (k === "f" && g.fsToggle) g.fsToggle();
}

function syncTouchMovement(g: any) {
  // One finger lifting must not cancel another finger still holding a side.
  g.pleft = false;
  g.pright = false;
  for (const p of Object.values(g.pointers) as any[]) {
    if (!p.side) continue;
    if (p.dir === "left") g.pleft = true;
    if (p.dir === "right") g.pright = true;
  }
}
function handlePointer(g: any, type: string, id: number, mx: number, my: number) {
  if (type === "down") {
    for (let i = g.zones.length - 1; i >= 0; i--) {
      const z = g.zones[i];
      if (mx >= z.x && mx < z.x + z.w && my >= z.y && my < z.y + z.h) {
        g.pointers[id] = { zone: z };
        if (z.onDown) z.onDown();
        return;
      }
    }
    if (g.menu) { closeMenu(g); return; }
    if (g.ui === "run") {
      g.pointers[id] = { side: true, dir: mx < W / 2 ? "left" : "right" };
      syncTouchMovement(g);
    }
  } else if (type === "move") {
    const pt = g.pointers[id];
    if (pt && pt.side) {
      pt.dir = mx < W / 2 ? "left" : "right";
      syncTouchMovement(g);
    }
  } else {
    const pt = g.pointers[id];
    if (pt) {
      if (pt.zone && pt.zone.onUp) pt.zone.onUp();
      delete g.pointers[id];
      if (pt.side) syncTouchMovement(g);
    }
  }
}


  return { handleKey, handlePointer };
}
