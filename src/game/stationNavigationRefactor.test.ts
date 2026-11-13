import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngine, openStation as engineOpenStation, accessStorage as engineAccessStorage,
  performStationAction as engineStationAction, stationRows as engineStationRows,
  closeMenu as engineCloseMenu, moveSel, activateSel
} from "./game";
import { CX, BENCH_X, PILE_X } from "./config";
import { openStation, accessStorage, performStationAction, stationRows } from "./stationActions";
import { closeMenu, moveSelection, activateSelection } from "./menuNavigation";
import { selectStation } from "./proximity45";
import { stationLevel } from "./campProgress";

afterEach(() => vi.restoreAllMocks());

function run() {
  const g = createEngine();
  g.ui = "run";
  g.menu = null;
  g.over = false;
  g.fenceLeft = true;
  g.fenceRight = true;
  g.keys = {};
  return g;
}
const meta = () => ({ ash: 15, totalAsh: 15, up: {} });

describe("station and navigation extraction", () => {
  it("preserves the original engine exports and physical reach checks", () => {
    expect(engineOpenStation).toBe(openStation);
    expect(engineAccessStorage).toBe(accessStorage);
    expect(engineStationAction).toBe(performStationAction);
    expect(engineStationRows).toBe(stationRows);
    expect(engineCloseMenu).toBe(closeMenu);
    const g = run();
    g.player.x = BENCH_X;
    expect(openStation(g, "bench")).toBe(false); // construction is physical
    g.builtBench = true;
    g.player.x = BENCH_X + 22;
    expect(openStation(g, "bench")).toBe(false);
    g.player.x = BENCH_X;
    g.keys.act = true;
    g.pressE = true;
    expect(openStation(g, "bench")).toBe(true);
    expect(g.menu).toBe("station");
    expect(g.stationId).toBe("bench");
    expect(g.keys.act).toBe(false);
    expect(g.pressE).toBe(false);
    closeMenu(g);
    expect(g.menu).toBeNull();
    expect(openStation(g, "hearth")).toBe(false);
    g.player.x = CX;
    expect(openStation(g, "hearth")).toBe(true);
  });

  it("keeps distinct STORE and TAKE rules and original carrying limits", () => {
    const g = run(), m = meta();
    g.builtPile = true;
    g.player.wood = 3;
    accessStorage(g, m, "store");
    expect(g.stored).toBe(3);
    expect(g.player.wood).toBe(0);
    g.player.wood = 4;
    accessStorage(g, m, "take");
    expect(g.player.wood).toBe(5);
    expect(g.stored).toBe(2);
    g.stored = 12;
    g.player.wood = 2;
    accessStorage(g, m, "store");
    expect(g.stored).toBe(12);
    expect(g.player.wood).toBe(2);
    expect(g.toasts.at(-1)?.text).toContain("FULL");
  });

  it("blocks remote or invalid station actions, then transfers through the same selected pile", () => {
    const g = run(), m = meta();
    g.builtPile = true;
    g.player.x = PILE_X;
    g.player.wood = 3;
    expect(performStationAction(g, m, "pile", "primary")).toBe(false);
    expect(selectStation(g, "pile")).toBe(true);
    g.menu = "pause";
    expect(performStationAction(g, m, "pile", "primary")).toBe(false);
    g.menu = null;
    expect(performStationAction(g, m, "pile", "plans")).toBe(false);
    expect(performStationAction(g, m, "pile", "primary")).toBe(true);
    expect(g.player.wood).toBe(0);
    expect(g.stored).toBe(3);
    expect(performStationAction(g, m, "pile", "take")).toBe(true);
    expect(g.player.wood).toBe(3);
    expect(g.stored).toBe(0);
  });

  it("opens physical workbench plans without leaving a stale station popup", () => {
    const g = run(), m = meta();
    g.builtBench = true;
    g.player.x = BENCH_X;
    expect(selectStation(g, "bench")).toBe(true);
    expect(performStationAction(g, m, "bench", "plans")).toBe(true);
    expect(g.menu).toBe("build");
    expect(g.buildTab).toBe(0);
    expect(g.stationFrom).toBe(false);
    expect(g.selectedStation).toBeNull();
    closeMenu(g);
    expect(g.menu).toBeNull();
  });

  it("retains the two-tap station upgrade and real run Ash, with insufficient wood safely blocked", () => {
    const g = run(), m = meta();
    g.builtBench = true;
    g.player.x = BENCH_X;
    expect(selectStation(g, "bench")).toBe(true);
    expect(performStationAction(g, m, "bench", "upgrade")).toBe(false);
    expect(g.buildConfirm).toBeNull();
    expect(stationLevel(g, "bench")).toBe(0);
    g.player.wood = 10;
    expect(performStationAction(g, m, "bench", "upgrade")).toBe(true);
    expect(g.buildConfirm).toBe("bench");
    expect(g.player.wood).toBe(10);
    expect(performStationAction(g, m, "bench", "upgrade")).toBe(true);
    expect(g.buildConfirm).toBeNull();
    expect(stationLevel(g, "bench")).toBe(1);
    expect(g.player.wood).toBe(0);
    expect(g.ashEarned).toBe(2);
    expect(g.ashLedger.stations).toBe(2);
    expect(m.ash).toBe(15);
  });

  it("preserves nested Back behavior and clears only transient confirmations", () => {
    const g = run();
    g.menu = "inventory"; g.inventoryFrom = "pause";
    g.buildConfirm = "stage"; g.craftConfirm = "pack"; g.endRunConfirm = true;
    closeMenu(g);
    expect(g.menu).toBe("pause");
    expect(g.inventoryFrom).toBe("run");
    expect(g.buildConfirm).toBeNull();
    expect(g.craftConfirm).toBeNull();
    expect(g.endRunConfirm).toBe(false);
    g.menu = "quickslot";g.quickSlotFrom = "toolbar";
    closeMenu(g);expect(g.menu).toBe("toolbar");
    closeMenu(g);expect(g.menu).toBe("pause");
    g.menu = "bench";g.stationFrom = true;
    closeMenu(g);expect(g.menu).toBe("station");
    closeMenu(g);expect(g.menu).toBeNull();
    g.menu = "audio";
    closeMenu(g);expect(g.menu).toBe("settings");
    g.settingsFrom = "pause";
    closeMenu(g);expect(g.menu).toBe("pause");
    expect(g.settingsFrom).toBeNull();
  });

  it("keeps selection wraparound, confirmation clearing and legacy buy versus row actions", () => {
    const g = run();
    const left = vi.fn(), buy = vi.fn();
    g.menu = "bench";g.menuSel = 2;g.craftConfirm = "pack";g.buildConfirm = "stage";
    moveSelection(g, [{onDown:left}, {onDown:left}, {onDown:left}], 1);
    expect(g.menuSel).toBe(0);
    expect(g.craftConfirm).toBeNull();
    expect(g.buildConfirm).toBeNull();
    activateSelection(g, [{onDown:left}]);
    expect(left).toHaveBeenCalledTimes(1);
    g.menu = "shop";g.shopTab = 1;g.menuSel = 0;g.upConfirm = "dog";
    moveSelection(g, [{buy, onDown:left}, {buy, onDown:left}], 1);
    expect(g.menuSel).toBe(1);
    expect(g.upConfirm).toBeNull();
    activateSelection(g, [{buy,onDown:left}, {buy,onDown:left}]);
    expect(buy).toHaveBeenCalledTimes(1);
    expect(left).toHaveBeenCalledTimes(1);
  });

  it("keeps game keyboard routing for real crafting menu row selection", () => {
    const g = run(),m = meta();
    g.menu = "bench";g.craftTab = 0;g.menuSel = 2;g.player.wood = 10;
    moveSel(g,m,1);
    expect(g.menuSel).toBe(0);
    activateSel(g,m);
    expect(g.craftConfirm).toBe("pack");
    activateSel(g,m);
    expect(g.crafts.pack).toBe(true);
    expect(g.player.wood).toBe(4);
  });
});
