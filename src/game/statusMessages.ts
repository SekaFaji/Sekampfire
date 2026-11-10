import { W } from "./config";
import { drawTextC, textW } from "./font";

/** Temporary gameplay messages have one stable, noninteractive screen position.
 * Queue them instead of stacking multiple overlays across the scenery. */
const MESSAGE_DURATION = 3.1;
const MAX_MESSAGES = 3;
const MAX_LINE_WIDTH = 194;

export function addStatusMessage(g: any, message: string): void {
  const text = String(message).trim();
  if (!text) return;
  if (!Array.isArray(g.toasts)) g.toasts = [];
  g.toasts.push({ text, life: MESSAGE_DURATION });
  if (g.toasts.length > MAX_MESSAGES) g.toasts.shift();
}

export function tickStatusMessages(g: any, dt: number): void {
  if (!Array.isArray(g.toasts) || !g.toasts.length) return;
  g.toasts[0].life -= Math.max(0, dt);
  if (g.toasts[0].life <= 0) g.toasts.shift();
}

/** Fit legacy one-line event text in a short, centered bar (at most 2 lines).
 * A long word or sentence never spills into the right-side day/menu HUD. */
export function statusMessageLines(value: string): string[] {
  const words = String(value).trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = "";
  let truncated = false;
  for (const word of words) {
    const trial = line ? line + " " + word : word;
    if (textW(trial) <= MAX_LINE_WIDTH) { line = trial; continue; }
    if (line) {
      lines.push(line);
      if (lines.length === 2) { truncated = true; break; }
      line = "";
    }
    if (textW(word) <= MAX_LINE_WIDTH) line = word;
    else line = word.slice(0, 47);
  }
  if (line && lines.length < 2) lines.push(line);
  if (truncated && lines.length) {
    const last = lines.length - 1;
    while (textW(lines[last] + "...") > MAX_LINE_WIDTH && lines[last].length) {
      lines[last] = lines[last].slice(0, -1);
    }
    lines[last] += "...";
  }
  return lines;
}

export function drawStatusMessages(ctx: any, g: any): void {
  if (g.ui !== "run" || g.menu || !g.toasts?.length) return;
  const current = g.toasts[0];
  const lines = statusMessageLines(current.text);
  if (!lines.length) return;
  const width = Math.max(78, Math.min(210, Math.max(...lines.map(textW)) + 16));
  const height = lines.length === 1 ? 13 : 21;
  const x = Math.floor((W - width) / 2), y = 43;
  const fadeIn = (MESSAGE_DURATION - current.life) / 0.16;
  const fadeOut = current.life / 0.55;
  ctx.globalAlpha = Math.max(0, Math.min(1, fadeIn, fadeOut));
  ctx.fillStyle = "rgba(22,31,41,0.66)";
  ctx.fillRect(x,y,width,height);
  ctx.fillStyle = "#b88f57";
  ctx.fillRect(x,y,2,height);
  ctx.fillStyle = "rgba(222,187,131,0.42)";
  ctx.fillRect(x+2,y,width-2,1);
  lines.forEach((line,i)=>drawTextC(ctx,line,W/2,y+4+i*8,"#f4e2bd"));
  ctx.globalAlpha = 1;
}
