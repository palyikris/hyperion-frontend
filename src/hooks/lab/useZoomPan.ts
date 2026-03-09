import { useCallback, useRef, useState } from "react";

interface ZoomPanState {
  scale: number;
  posX: number;
  posY: number;
}

interface UseZoomPanOptions {
  minScale?: number;
  maxScale?: number;
  scaleSensitivity?: number;
  containerWidth?: number;
  containerHeight?: number;
  contentWidth?: number;
  contentHeight?: number;
}

export const useZoomPan = (options: UseZoomPanOptions = {}) => {
  const {
    minScale = 1,
    maxScale = 5,
    scaleSensitivity = 0.001,
    containerWidth = 0,
    containerHeight = 0,
    contentWidth = 0,
    contentHeight = 0,
  } = options;

  const [state, setState] = useState<ZoomPanState>({
    scale: 1,
    posX: 0,
    posY: 0,
  });

  const [isPanning, setIsPanning] = useState(false);
  const lastPanPos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number>(0);

  // Helper function to constrain position within boundaries
  const constrainPosition = useCallback(
    (posX: number, posY: number, scale: number) => {
      if (!containerWidth || !containerHeight || !contentWidth || !contentHeight) {
        return { posX, posY };
      }

      const scaledWidth = contentWidth * scale;
      const scaledHeight = contentHeight * scale;

      // Calculate boundaries
      let minX = 0;
      let maxX = 0;
      let minY = 0;
      let maxY = 0;

      if (scaledWidth > containerWidth) {
        // Image is wider than container, constrain horizontal panning
        minX = containerWidth - scaledWidth;
        maxX = 0;
      } else {
        // Image is narrower than container, center it
        minX = maxX = (containerWidth - scaledWidth) / 2;
      }

      if (scaledHeight > containerHeight) {
        // Image is taller than container, constrain vertical panning
        minY = containerHeight - scaledHeight;
        maxY = 0;
      } else {
        // Image is shorter than container, center it
        minY = maxY = (containerHeight - scaledHeight) / 2;
      }

      return {
        posX: Math.min(Math.max(posX, minX), maxX),
        posY: Math.min(Math.max(posY, minY), maxY),
      };
    },
    [containerWidth, containerHeight, contentWidth, contentHeight]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      const delta = -event.deltaY * scaleSensitivity;
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, state.scale + delta)
      );

      if (newScale === state.scale) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Calculate new position to zoom towards mouse cursor
      const scaleRatio = newScale / state.scale;
      const newPosX = mouseX - (mouseX - state.posX) * scaleRatio;
      const newPosY = mouseY - (mouseY - state.posY) * scaleRatio;

      // Apply constraints
      const constrained = constrainPosition(newPosX, newPosY, newScale);

      setState({
        scale: newScale,
        posX: constrained.posX,
        posY: constrained.posY,
      });
    },
    [state, minScale, maxScale, scaleSensitivity, constrainPosition]
  );

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left click
    setIsPanning(true);
    lastPanPos.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isPanning) return;

      const deltaX = event.clientX - lastPanPos.current.x;
      const deltaY = event.clientY - lastPanPos.current.y;

      setState((prev) => {
        const newPosX = prev.posX + deltaX;
        const newPosY = prev.posY + deltaY;
        const constrained = constrainPosition(newPosX, newPosY, prev.scale);
        
        return {
          ...prev,
          posX: constrained.posX,
          posY: constrained.posY,
        };
      });

      lastPanPos.current = { x: event.clientX, y: event.clientY };
    },
    [isPanning, constrainPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      // Single touch - pan
      setIsPanning(true);
      lastPanPos.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    } else if (event.touches.length === 2) {
      // Two touches - pinch to zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      event.preventDefault();
      
      if (event.touches.length === 1 && isPanning) {
        // Single touch - pan
        const touch = event.touches[0];
        const deltaX = touch.clientX - lastPanPos.current.x;
        const deltaY = touch.clientY - lastPanPos.current.y;

        setState((prev) => {
          const newPosX = prev.posX + deltaX;
          const newPosY = prev.posY + deltaY;
          const constrained = constrainPosition(newPosX, newPosY, prev.scale);
          
          return {
            ...prev,
            posX: constrained.posX,
            posY: constrained.posY,
          };
        });

        lastPanPos.current = { x: touch.clientX, y: touch.clientY };
      } else if (event.touches.length === 2) {
        // Two touches - pinch to zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        if (lastTouchDistance.current > 0) {
          const scaleDelta = (distance - lastTouchDistance.current) * 0.01;
          
          setState((prev) => {
            const newScale = Math.min(
              maxScale,
              Math.max(minScale, prev.scale + scaleDelta)
            );
            
            // Calculate center point between fingers
            const rect = (event.target as HTMLElement).getBoundingClientRect();
            const centerX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
            const centerY = ((touch1.clientY + touch2.clientY) / 2) - rect.top;
            
            // Calculate new position to zoom towards center point
            const scaleRatio = newScale / prev.scale;
            const newPosX = centerX - (centerX - prev.posX) * scaleRatio;
            const newPosY = centerY - (centerY - prev.posY) * scaleRatio;
            
            const constrained = constrainPosition(newPosX, newPosY, newScale);
            
            return {
              scale: newScale,
              posX: constrained.posX,
              posY: constrained.posY,
            };
          });
        }

        lastTouchDistance.current = distance;
      }
    },
    [isPanning, constrainPosition, minScale, maxScale]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    lastTouchDistance.current = 0;
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => {
      const newScale = Math.min(maxScale, prev.scale + 0.2);
      const constrained = constrainPosition(prev.posX, prev.posY, newScale);
      return {
        scale: newScale,
        posX: constrained.posX,
        posY: constrained.posY,
      };
    });
  }, [maxScale, constrainPosition]);

  const zoomOut = useCallback(() => {
    setState((prev) => {
      const newScale = Math.max(minScale, prev.scale - 0.2);
      const constrained = constrainPosition(prev.posX, prev.posY, newScale);
      return {
        scale: newScale,
        posX: constrained.posX,
        posY: constrained.posY,
      };
    });
  }, [minScale, constrainPosition]);

  const reset = useCallback(() => {
    const constrained = constrainPosition(0, 0, 1);
    setState({
      scale: 1,
      posX: constrained.posX,
      posY: constrained.posY,
    });
  }, [constrainPosition]);

  return {
    state,
    isPanning,
    handlers: {
      onWheel: handleWheel,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    controls: {
      zoomIn,
      zoomOut,
      reset,
    },
  };
};
