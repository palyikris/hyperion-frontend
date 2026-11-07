import { act, renderHook } from "@testing-library/react";
import type { MouseEvent } from "react";
import { describe, expect, it } from "vitest";
import { useZoomPan } from "./useZoomPan";

const mouse = (x: number, y: number) => ({ button: 0, clientX: x, clientY: y }) as MouseEvent;
describe("zoom and edit gestures", () => {
  it("does not start panning when drawing is active", () => {
    const { result } = renderHook(() => useZoomPan({ panEnabled: false }));
    act(() => { result.current.handlers.onMouseDown(mouse(20, 20)); });
    act(() => { result.current.handlers.onMouseMove(mouse(50, 50)); });
    expect(result.current.isPanning).toBe(false);
    expect(result.current.state).toEqual({ scale: 1, posX: 0, posY: 0 });
  });
  it("still allows background panning when enabled", () => {
    const { result } = renderHook(() => useZoomPan({ panEnabled: true }));
    act(() => { result.current.handlers.onMouseDown(mouse(20, 20)); });
    act(() => { result.current.handlers.onMouseMove(mouse(50, 60)); });
    expect(result.current.state).toEqual({ scale: 1, posX: 30, posY: 40 });
    act(() => { result.current.handlers.onMouseUp(); });
    expect(result.current.isPanning).toBe(false);
  });
});
