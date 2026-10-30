// ============ optional procedural audio ============
// Browser audio unlocks only after a user gesture. No assets, no autoplay,
// and no impact on simulation. Mute is saved locally.
const FX_KEY = "sekampfire-fx-v1";
const GRAPHICS = {
  high: (() => { try { return localStorage.getItem(FX_KEY) !== "low"; } catch (_e) { return true; } })(),
  toggle() {
    this.high = !this.high;
    try { localStorage.setItem(FX_KEY, this.high ? "high" : "low"); } catch (_e) {}
  }
};

export { GRAPHICS };
