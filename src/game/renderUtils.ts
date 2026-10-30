import { clamp } from "./math";

// ============ helpers ============


function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
function lerpHex(a: string, b: string, f: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `#${toHex(A[0] + (B[0] - A[0]) * f)}${toHex(A[1] + (B[1] - A[1]) * f)}${toHex(A[2] + (B[2] - A[2]) * f)}`;
}
function lightenHex(h: string, f: number): string {
  const A = hexToRgb(h);
  const mix = (c: number) => Math.round(c + (255 - c) * f);
  return `rgb(${mix(A[0])},${mix(A[1])},${mix(A[2])})`;
}

const px = (ctx: any, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

export { mulberry32, hexToRgb, lerpHex, lightenHex, px };
