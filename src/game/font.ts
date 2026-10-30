// ============ 3x5 pixel font ============
const FONT: Record<string, string> = {
  A: "111101111101101", B: "111101111101111", C: "111100100100111",
  D: "110101101101110", E: "111100110100111", F: "111100110100100",
  G: "111100101101111", H: "101101111101101", I: "111010010010111",
  J: "011001001101110", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "111101101101111",
  P: "111101111100100", Q: "111101101111001", R: "111101110101101",
  S: "111100111001111", T: "111010010010010", U: "101101101101111",
  V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111",
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111",
  "3": "111001111001111", "4": "101101111001001", "5": "111100111001111",
  "6": "111100111101111", "7": "111001001010010", "8": "111101111101111",
  "9": "111101111001111",
  " ": "000000000000000", "/": "001001010100100", "-": "000000111000000",
  "(": "001010010010001", ")": "100010010010100", "+": "000010111010000",
  ":": "000010000010000", "!": "010010010000010", ".": "000000000000010",
  ",": "000000000010100", "'": "010010100000000", "?": "111001010000010",
};

function drawText(ctx: any, str: string, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  const s = String(str).toUpperCase();
  let cx = Math.round(x);
  const yy = Math.round(y);
  for (const ch of s) {
    const gl = FONT[ch];
    if (gl) {
      for (let i = 0; i < 15; i++) {
        if (gl[i] === "1") ctx.fillRect(cx + (i % 3), yy + Math.floor(i / 3), 1, 1);
      }
    }
    cx += 4;
  }
}
const textW = (str: string) => String(str).length * 4 - 1;

function drawTextC(ctx: any, str: string, cx: number, y: number, color: string) {
  drawText(ctx, str, Math.round(cx - textW(String(str)) / 2), y, color);
}

// text with a black outline for readability over any background
function drawTextO(ctx: any, str: string, x: number, y: number, color: string, oc: string) {
  drawText(ctx, str, x - 1, y, oc);
  drawText(ctx, str, x + 1, y, oc);
  drawText(ctx, str, x, y - 1, oc);
  drawText(ctx, str, x, y + 1, oc);
  drawText(ctx, str, x, y, color);
}

function drawTextWrap(ctx: any, str: string, x: number, y: number, maxW: number, color: string, lineH: number) {
  const words = String(str).toUpperCase().split(" ");
  let line = "";
  let yy = y;
  const flush = () => {
    if (line) drawText(ctx, line, x, yy, color);
    yy += lineH;
    line = "";
  };
  for (const wd of words) {
    const t = line ? line + " " + wd : wd;
    if (textW(t) > maxW && line) { flush(); line = wd; }
    else line = t;
  }
  flush();
  return yy;
}

function drawBig(ctx: any, str: string, cx: number, y: number, scale: number, color: string) {
  const w = textW(str) * scale;
  ctx.save();
  ctx.translate(Math.round(cx - w / 2), Math.round(y));
  ctx.scale(scale, scale);
  drawText(ctx, str, 0, 0, color);
  ctx.restore();
}

export { drawText, textW, drawTextC, drawTextO, drawTextWrap, drawBig };
