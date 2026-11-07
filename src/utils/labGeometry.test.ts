import { describe, expect, it } from "vitest";
import { clipDrawingRect } from "./labGeometry";

describe("drawing bounds", () => {
  it.each([
    [{ x: 80, y: 80, w: 50, h: 50 }, { x: 80, y: 80, w: 20, h: 20 }],
    [{ x: 80, y: 80, w: -100, h: -100 }, { x: 0, y: 0, w: 80, h: 80 }],
    [{ x: 10, y: 20, w: 30, h: 40 }, { x: 10, y: 20, w: 30, h: 40 }],
  ])("clips both endpoints without negative dimensions", (input, expected) => {
    expect(clipDrawingRect(input, { width: 100, height: 100 })).toEqual(expected);
  });
});
