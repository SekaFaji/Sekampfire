import { W } from "./config";
import { tickQuickSlotHolds, useQuickSlot } from "./quickSlots";

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
  if (down && g.menu === "help" && ["arrowleft", "a", "arrowright", "d"].includes(k)) {
    const delta = k === "arrowleft" || k === "a" ? -1 : 1;
    g.helpPage = Math.max(0, Math.min(6, (g.helpPage || 0) + delta));
    return;
  }
  if (down && g.menu === "shop" && ["arrowleft", "a", "arrowright", "d"].includes(k)) {
    g.shopTab = Math.max(0,Math.min(2,(g.shopTab||0)+(k==="arrowleft"||k==="a"?-1:1)));
    g.menuSel = 0; g.upConfirm = null;
    return;
  }
  // Inventory has its own real grid-navigation model, not the linear
  // settings/build row selector. These keys never leak into movement.
  if (g.menu === "inventory" && down && ["arrowleft","arrowright","arrowup","arrowdown","a","d","w","s"].includes(k)) {
    const dx=k==="arrowleft"||k==="a"?-1:k==="arrowright"||k==="d"?1:0;
    const dy=k==="arrowup"||k==="w"?-5:k==="arrowdown"||k==="s"?5:0;
    const current=g.inventoryTab===1?(g.inventoryEquipSel||0):(g.inventorySel||0);
    const cap=g.inventoryTab===1?20:Math.min(20,5+(g.crafts?.pack?5:0)+(meta?.up?.pack?5:0));
    const next=Math.max(0,Math.min(cap-1,current+dx+dy));
    if(g.inventoryTab===1)g.inventoryEquipSel=next;
    else g.inventorySel=next;
    return;
  }
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
  const isList = ["bench", "shop", "build", "settings", "audio", "reset1", "reset2", "pause", "toolbar", "quickslot"].includes(g.menu);
  if (k === "arrowup" || k === "w") {
    if (isList) moveSel(g, meta, -1);
    else if (g.ui === "title" && !g.menu) g.titleSel = (g.titleSel + titleActions(g, meta).length - 1) % titleActions(g, meta).length;
  }
  if (k === "arrowdown" || k === "s") {
    if (isList) moveSel(g, meta, 1);
    else if (g.ui === "title" && !g.menu) g.titleSel = (g.titleSel + 1) % titleActions(g, meta).length;
  }
  if (k === "e" || k === "enter" || k === " ") {
    if (g.menu === "inventory") return; // item selection is read-only; no hidden ACT
    if (isList) activateSel(g, meta);
    else if (g.menu === "museum" || g.menu === "guide" || g.menu === "endlessNightInfo") closeMenu(g);
    else if (g.menu === "help") { if ((g.helpPage || 0) >= 6) closeMenu(g); else g.helpPage = (g.helpPage || 0) + 1; }
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
  if (k === "h" && g.ui === "title" && !g.menu) { g.menu = "help"; g.helpPage = 0; }
  if (k === "i" && g.ui === "run" && (!g.menu || g.menu === "inventory")) {
    if (g.menu === "inventory") closeMenu(g);
    else {g.menu="inventory";g.inventoryTab=0;g.inventorySel=0;g.inventoryFrom="run";g.keys.act=false;}
    return;
  }
  if (k === "t" && g.ui === "run" && !g.menu) g.pressT = true;
  if ((k==="1"||k==="2") && g.ui==="run" && !g.menu) useQuickSlot(g,k==="1"?0:1);
  // B is a gameplay Build shortcut, never a way to accidentally dismiss
  // an open dialog or switch from one menu into another.
  if (k === "b" && g.ui === "run" && !g.menu) {
    g.menu = "build";
    g.menuSel = 0;
    g.keys.act = false;
  }
  if (k === "escape") {
    if (g.menu) closeMenu(g);
    else if (g.ui === "run" && !g.over) { g.menu = "pause"; g.menuSel = 0; g.keys.act = false; }
  }
  if (k === "p" && g.ui === "run" && !g.over) {
    if (g.menu === "pause") { g.menu = null; g.keys.act = false; }
    else if (!g.menu) { g.menu = "pause"; g.menuSel = 0; g.keys.act = false; }
  }
  if (k === "u" && !g.menu && (g.ui === "title" || g.ui === "dead" || g.ui === "win")) { g.menu = "shop"; g.shopTab = 0; g.menuSel = 0; }
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
    if (g.menu) {
      // Only the CURRENT dialog's controls can receive pointer input. The
      // title, gameplay HUD and menus underneath have already registered
      // their own zones, but those must never remain clickable through a popup.
      const currentMenu = g.menu;
      if (g.menuZonesFor !== currentMenu) return; // Wait for next render.
      const from = Number.isInteger(g.menuZonesStart) ? g.menuZonesStart : g.zones.length;
      for (let i = g.zones.length - 1; i >= from; i--) {
        const z = g.zones[i];
        if (mx >= z.x && mx < z.x + z.w && my >= z.y && my < z.y + z.h) {
          g.pointers[id] = { zone: z, menu: currentMenu };
          if (z.onDown) z.onDown();
          return;
        }
      }
      const box = g.menuRect;
      // Blank space INSIDE the panel isn't a close action.
      // Blank space OUTSIDE the panel closes or returns to its parent.
      if (box && (mx < box.x || my < box.y ||
          mx >= box.x + box.w || my >= box.y + box.h)) closeMenu(g);
      return;
    }
    for (let i = g.zones.length - 1; i >= 0; i--) {
      const z = g.zones[i];
      if (mx >= z.x && mx < z.x + z.w && my >= z.y && my < z.y + z.h) {
        if (z.quickSlot === 0 || z.quickSlot === 1) {
          g.pointers[id] = { quickSlot:z.quickSlot, held:0, longHeld:false, cancelled:false,
            startX:mx, startY:my };
        } else {
          g.pointers[id] = { zone:z };
          if (z.onDown) z.onDown();
        }
        return;
      }
    }
    if (g.ui === "run") {
      g.pointers[id] = { side: true, dir: mx < W / 2 ? "left" : "right" };
      syncTouchMovement(g);
    }
  } else if (type === "move") {
    const pt = g.pointers[id];
    if(pt && pt.quickSlot !== undefined) {
      if(Math.abs(mx-pt.startX)>12 || Math.abs(my-pt.startY)>12) pt.cancelled=true;
    } else if(pt && pt.side) {
      pt.dir = mx < W / 2 ? "left" : "right";
      syncTouchMovement(g);
    }
  } else {
    const pt = g.pointers[id];
    if (pt) {
      if (pt.zone && pt.zone.onUp) pt.zone.onUp();
      // A held slot opens its picker without also using the item on release.
      if (pt.quickSlot !== undefined && !pt.longHeld && !pt.cancelled && !g.menu) {
        useQuickSlot(g,pt.quickSlot);
      }
      delete g.pointers[id];
      if (pt.side) syncTouchMovement(g);
    }
  }
}


  return { handleKey, handlePointer, tickQuickSlotHolds };
}
