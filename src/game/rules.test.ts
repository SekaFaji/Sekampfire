import { describe, expect, it } from "vitest";
import { carryCap, pileCap, choppingToolTier } from "./rules";

describe("wood capacity progression", () => {
  const g = (craft = false) => ({ crafts: { pack: craft } });
  const meta = (owned = false) => ({ up: { pack: owned } });
  it("starts with five logs", () => expect(carryCap(g(), meta())).toBe(5));
  it("adds eight for each independent upgrade", () => {
    expect(carryCap(g(true), meta())).toBe(13);
    expect(carryCap(g(), meta(true))).toBe(13);
    expect(carryCap(g(true), meta(true))).toBe(21);
  });
  it("honors original wood pile capacity", () => {
    expect(pileCap({ builtPile: false, stage: 6 })).toBe(0);
    expect(pileCap({ builtPile: true, stage: 3 })).toBe(12);
    expect(pileCap({ builtPile: true, stage: 4 })).toBe(40);
  });
});

describe("visual tools respect real progression", () => {
  it("starts with the weak branch, not an equipped axe", () => {
    expect(choppingToolTier({ crafts: {} }, { up: {} })).toBe(0);
  });
  it("reveals the crafted Wood Axe using the existing maul save key", () => {
    expect(choppingToolTier({ crafts: { maul: true } }, { up: {} })).toBe(1);
  });
  it("preserves the permanent Grandpa's Axe priority", () => {
    expect(choppingToolTier({ crafts: { maul: true } }, { up: { axe: 1 } })).toBe(2);
    expect(choppingToolTier({ crafts: {} }, { up: { axe: 1 } })).toBe(2);
  });
});
