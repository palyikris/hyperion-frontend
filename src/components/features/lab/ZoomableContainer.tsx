import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useZoomPan } from "../../../hooks/lab/useZoomPan";

type ZoomableContainerProps = {
  children: ReactNode;
};

const ZoomableContainer = ({ children }: ZoomableContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    containerHeight: 0,
    contentWidth: 0,
    contentHeight: 0,
  });

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current || !contentRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      setDimensions({
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        contentWidth: contentRect.width,
        contentHeight: contentRect.height,
      });
    };

    // Initial measurement
    updateDimensions();

    // Watch for size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const { state, isPanning, handlers, controls } = useZoomPan({
    minScale: 1,
    maxScale: 5,
    scaleSensitivity: 0.002,
    containerWidth: dimensions.containerWidth,
    containerHeight: dimensions.containerHeight,
    contentWidth: dimensions.contentWidth,
    contentHeight: dimensions.contentHeight,
  });

  const isZoomed = state.scale > 1;

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={controls.zoomIn}
          disabled={state.scale >= 5}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-hyperion-deep-sea/30 bg-white/90 text-hyperion-deep-sea shadow-md transition-all hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={controls.zoomOut}
          disabled={state.scale <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-hyperion-deep-sea/30 bg-white/90 text-hyperion-deep-sea shadow-md transition-all hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        {isZoomed && (
          <button
            type="button"
            onClick={controls.reset}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-hyperion-deep-sea/30 bg-white/90 text-hyperion-deep-sea shadow-md transition-all hover:bg-white"
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Zoom indicator */}
      {isZoomed && (
        <div className="absolute left-3 top-3 z-10 rounded-md border border-hyperion-deep-sea/30 bg-white/90 px-3 py-1 text-xs font-semibold text-hyperion-deep-sea shadow-md">
          {Math.round(state.scale * 100)}%
        </div>
      )}

      {/* Container */}
      <div
        ref={containerRef}
        {...handlers}
        className="relative overflow-hidden"
        style={{
          cursor: isPanning ? "grabbing" : isZoomed ? "grab" : "default",
          touchAction: "none",
          overscrollBehavior: "contain",
        }}
      >
        <div
          ref={contentRef}
          style={{
            transform: `translate(${state.posX}px, ${state.posY}px) scale(${state.scale})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ZoomableContainer;
