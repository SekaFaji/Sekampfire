import { useState, useEffect, useRef } from "react";
import { fitViewport } from "./ui/viewport";
import { W, H, loadMeta, saveMeta, createEngine, setupTitleScene, loadRunSnapshot, clearRunSnapshot, toast, saveRunSnapshot, update, updateAmbient, draw, handleKey, handlePointer, AUDIO } from "./game/game";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<any>(null);
  const metaRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 320, height: 180 });
  if (!metaRef.current) metaRef.current = loadMeta();
  const [fatal, setFatal] = useState<string | null>(null);
  const [fs, setFs] = useState(false);

  // The display rect tracks actual safe-area space, browser UI changes and
  // landscape/orientation transitions. Logical Canvas resolution stays 320x180.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      const next = fitViewport(w, h, fs ? Infinity : 960);
      setDisplaySize(prev =>
        prev.width === next.width && prev.height === next.height ? prev : next);
    };
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(measure) : null;
    observer?.observe(stage);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.visualViewport?.addEventListener("resize", measure);
    measure();
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [fs]);

  useEffect(() => {
    const g = createEngine();
    gameRef.current = g;
    setupTitleScene(g);
    g.resumeData = loadRunSnapshot();
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: any = null, off: any = null, octx: any = null;
    let reflection: any = null, rctx: any = null;
    try {
      ctx = canvas.getContext("2d");
      off = document.createElement("canvas");
      off.width = W; off.height = H;
      octx = off.getContext("2d");
      reflection = document.createElement("canvas");
      reflection.width = W; reflection.height = H;
      rctx = reflection.getContext("2d");
      if (!ctx || !octx || !rctx) throw new Error("Canvas 2D is unavailable");
      ctx.imageSmoothingEnabled = false;
      rctx.imageSmoothingEnabled = false;
    } catch (err: any) {
      setFatal("init: " + (err && err.message ? err.message : String(err)));
      return;
    }

    const cb = {
      toast: (text: string) => toast(g, text),
      end: (kind: string, stats: any) => {
        // Retire, death, and victory are terminal: never bank a checkpoint twice.
        clearRunSnapshot();
        const m = metaRef.current;
        m.ash = (m.ash || 0) + stats.ash;
        m.totalAsh = (m.totalAsh || 0) + stats.ash;
        m.best = Math.max(m.best || 0, stats.nights);
        m.runs = (m.runs || 0) + 1;
        if (kind === "won") m.wonEver = true;
        saveMeta(m);
        g.lastResult = { ...stats, kind };
        g.menu = null;
        g.settingsFrom = null;
        g.ui = kind === "won" ? "win" : "dead";
      },
    };
    // let in-canvas menus end the run (pause menu "END RUN")
    g.cb = cb;

    // Prefer native fullscreen; iPhone Safari and embedded browsers may not
    // expose it. The CSS immersive fallback still uses the measured safe area.
    let cssImmersive = false;
    const enterCssImmersive = () => {
      cssImmersive = true;
      g.fs = true;
      setFs(true);
      toast(g, "Immersive view enabled. Tap FULLSCREEN to exit.");
    };
    g.fs = false;
    g.fsToggle = () => {
      const el: any = wrapRef.current;
      const doc: any = document;
      const native = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
      if (native) {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.webkitCancelFullScreen;
        if (exit) Promise.resolve(exit.call(doc)).catch(() => {});
        return;
      }
      if (cssImmersive) {
        cssImmersive = false;
        g.fs = false;
        setFs(false);
        return;
      }
      const enter = el && (el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen);
      if (!enter) { enterCssImmersive(); return; }
      try {
        Promise.resolve(enter.call(el)).catch(enterCssImmersive);
      } catch (_err) { enterCssImmersive(); }
    };
    const fsch = () => {
      const doc: any = document;
      const native = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
      if (native) cssImmersive = false;
      g.fs = native || cssImmersive;
      setFs(g.fs);
    };
    document.addEventListener("fullscreenchange", fsch);
    document.addEventListener("webkitfullscreenchange", fsch);

    let raf = 0;
    let last = performance.now();
    let saveAccum = 0;
    const frame = (now: number) => {
      try {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        // Pause all simulation and ambient events while a menu is open.
        if (!g.menu) g.animT += dt;
        const active = g.ui === "run" && !g.over && !g.menu;
        if (active) update(g, metaRef.current, dt, cb);
        if (!g.menu) updateAmbient(g, dt);
        if (g.ui === "run" && !g.over) {
          saveAccum += dt;
          if (saveAccum >= 4) { saveRunSnapshot(g); saveAccum = 0; }
        } else saveAccum = 0;
        AUDIO.sync(g);
        draw(g, ctx, off, octx, reflection, rctx, metaRef.current);
      } catch (err: any) {
        const msg = err && err.message ? err.message : String(err);
        setFatal((f: string | null) => (f === msg ? f : msg));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].indexOf(k) >= 0) e.preventDefault();
      if (e.repeat && (k === "e" || k === " " || k === "enter")) return;
      AUDIO.touch();
      handleKey(g, metaRef.current, k, true);
    };
    const ku = (e: KeyboardEvent) => handleKey(g, metaRef.current, e.key.toLowerCase(), false);
    const blur = () => {
      g.keys = {}; g.pleft = false; g.pright = false; g.pointers = {};
      saveRunSnapshot(g);
    };
    const pagehide = () => saveRunSnapshot(g);
    const visibility = () => {
      if (document.visibilityState === "hidden") saveRunSnapshot(g);
    };
    // Escapes the CSS fallback as well as the in-game pause view.
    const exitImmersive = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cssImmersive) {
        cssImmersive = false;
        g.fs = false;
        setFs(false);
      }
    };
    window.addEventListener("keydown", exitImmersive);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", blur);
    window.addEventListener("pagehide", pagehide);
    document.addEventListener("visibilitychange", visibility);

    const toXY = (e: any) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
    };
    const pd = (e: PointerEvent) => {
      e.preventDefault();
      AUDIO.touch();
      const [mx, my] = toXY(e);
      handlePointer(g, "down", e.pointerId, mx, my);
    };
    const pm = (e: PointerEvent) => {
      const [mx, my] = toXY(e);
      handlePointer(g, "move", e.pointerId, mx, my);
    };
    const pu = (e: PointerEvent) => {
      handlePointer(g, "up", e.pointerId, 0, 0);
    };
    canvas.addEventListener("pointerdown", pd);
    canvas.addEventListener("pointermove", pm);
    canvas.addEventListener("pointerup", pu);
    canvas.addEventListener("pointercancel", pu);
    canvas.addEventListener("pointerleave", pu);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("fullscreenchange", fsch);
      document.removeEventListener("webkitfullscreenchange", fsch);
      window.removeEventListener("keydown", exitImmersive);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
      window.removeEventListener("pagehide", pagehide);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("pointerdown", pd);
      canvas.removeEventListener("pointermove", pm);
      canvas.removeEventListener("pointerup", pu);
      canvas.removeEventListener("pointercancel", pu);
      canvas.removeEventListener("pointerleave", pu);
    };
  }, []);

  return (
    <div ref={wrapRef}
      className={fs
        ? "fixed inset-0 z-50 overflow-hidden bg-[#0a0e1a]"
        : "h-[100dvh] min-h-[180px] overflow-hidden bg-[radial-gradient(ellipse_at_top,#182036,#0a0e1a)]"}
    >
      <div ref={stageRef}
        className={fs
          ? "absolute flex items-center justify-center min-h-0 overflow-hidden"
          : "absolute inset-0 flex items-center justify-center min-h-0 overflow-hidden p-3 sm:p-6"}
        style={fs ? {
          top: "env(safe-area-inset-top, 0px)",
          bottom: "env(safe-area-inset-bottom, 0px)",
          left: "env(safe-area-inset-left, 0px)",
          right: "env(safe-area-inset-right, 0px)"
        } : undefined}
      >
        <div className="relative overflow-hidden shadow-[0_0_70px_rgba(255,150,60,0.10)] bg-[#24455c]"
          style={{
            width: displaySize.width,
            height: displaySize.height,
            flex: "none",
            borderRadius: fs ? 0 : 12,
          }}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block w-full h-full touch-none select-none"
            style={{ imageRendering: "pixelated" }}
          />
          {fatal && (
            <div className="absolute bottom-2 left-2 right-2 bg-red-900/90 border border-red-500/50 rounded-md px-3 py-2 text-[11px] text-red-100">
              Engine error: {fatal}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
