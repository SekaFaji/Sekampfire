import { describe, expect, it } from "vitest";
import { clamp } from "./math";

describe("clamp", () => {
  it("bounds a value", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(7, 0, 10)).toBe(7);
  });
});
