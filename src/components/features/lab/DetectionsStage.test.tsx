import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
import type Konva from "konva";
import DetectionsStage from "./DetectionsStage";

type PointerEvent = Konva.KonvaEventObject<MouseEvent | TouchEvent>;
type StageHandlers = {
  onMouseDown: (event: PointerEvent) => void;
  onMouseMove: (event: PointerEvent) => void;
  onMouseUp: () => void;
  onTouchStart: (event: PointerEvent) => void;
  onTouchMove: (event: PointerEvent) => void;
  onTouchEnd: () => void;
};
const { stage } = vi.hoisted(() => ({ stage: { current: null as StageHandlers | null } }));
vi.mock("react-konva", () => ({
  Stage: (props: PropsWithChildren<StageHandlers>) => { stage.current = props; return <div>{props.children}</div>; },
  Layer: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Group: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Transformer: () => null,
  Rect: ({ x, y, width, height, dash }: { x: number; y: number; width: number; height: number; dash?: number[] }) =>
    <div data-testid={dash ? "preview" : "box"}>{JSON.stringify({ x, y, width, height })}</div>,
  Text: () => null,
}));

const base = {
  detections: [], detectionKeys: [], hiddenDetections: {}, dimensions: { width: 100, height: 100 },
  isImageLoading: false, hasError: false, selectedId: null, isDrawingMode: true,
  onSelectDetection: vi.fn(), onAddDetection: vi.fn(),
};
let pointer = { x: 80, y: 80 };
const target = { getStage: () => target, getPointerPosition: () => pointer };
function event(editing = false): PointerEvent {
  return { target: editing ? { getStage: () => target } : target, evt: { button: 0, stopPropagation: vi.fn() } } as unknown as PointerEvent;
}
beforeEach(() => { vi.clearAllMocks(); pointer = { x: 80, y: 80 }; });

describe("canvas drawing", () => {
  it.each(["mouse", "touch"])("renders a bounded preview and creates a clipped box with %s input", (input) => {
    render(<DetectionsStage {...base} />);
    const down = event();
    act(() => {
      if (input === "mouse") stage.current!.onMouseDown(down);
      else stage.current!.onTouchStart(down);
    });
    expect(down.evt.stopPropagation).toHaveBeenCalled();
    pointer = { x: 140, y: 160 };
    act(() => {
      if (input === "mouse") stage.current!.onMouseMove(event());
      else stage.current!.onTouchMove(event());
    });
    expect(JSON.parse(screen.getByTestId("preview").textContent!)).toEqual({ x: 80, y: 80, width: 20, height: 20 });
    act(() => {
      if (input === "mouse") stage.current!.onMouseUp();
      else stage.current!.onTouchEnd();
    });
    expect(base.onAddDetection).toHaveBeenCalledWith({ x: 0.8, y: 0.8, w: 0.2, h: 0.2 });
    expect(screen.queryByTestId("preview")).not.toBeInTheDocument();
  });

  it("does not create invisible or zero-sized boxes", () => {
    render(<DetectionsStage {...base} />);
    act(() => { stage.current!.onMouseDown(event()); });
    act(() => { stage.current!.onMouseUp(); });
    expect(base.onAddDetection).not.toHaveBeenCalled();
  });

  it("suppresses bubbling from edited shapes but lets background panning through", () => {
    render(<DetectionsStage {...base} isDrawingMode={false} />);
    const editing = event(true);
    act(() => { stage.current!.onMouseDown(editing); });
    expect(editing.evt.stopPropagation).toHaveBeenCalled();
    const background = event();
    act(() => { stage.current!.onMouseDown(background); });
    expect(background.evt.stopPropagation).not.toHaveBeenCalled();
  });

  it("does not draw while a save is pending", () => {
    render(<DetectionsStage {...base} disabled />);
    act(() => { stage.current!.onMouseDown(event()); });
    pointer = { x: 100, y: 100 };
    act(() => { stage.current!.onMouseMove(event()); stage.current!.onMouseUp(); });
    expect(base.onAddDetection).not.toHaveBeenCalled();
    expect(screen.queryByTestId("preview")).not.toBeInTheDocument();
  });
});
