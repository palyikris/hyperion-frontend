import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Group, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type { Detection } from "../../../types/lab";
import {
  getStableDetectionColor,
  rgbToRgba,
} from "../../../utils/detectionUtils";

type NormalizedBBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type DetectionsStageProps = {
  detections: Detection[];
  detectionKeys: string[];
  hiddenDetections: Record<string, boolean>;
  dimensions: { width: number; height: number };
  isImageLoading: boolean;
  hasError: boolean;
  selectedId: string | null;
  onSelectDetection: (id: string) => void;
  onUpdateDetectionBBox?: (id: string, bbox: NormalizedBBox) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const DetectionsStage = ({
  detections,
  detectionKeys,
  hiddenDetections,
  dimensions,
  isImageLoading,
  hasError,
  selectedId,
  onSelectDetection,
  onUpdateDetectionBBox,
}: DetectionsStageProps) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const rectRefs = useRef<Record<string, Konva.Rect | null>>({});

  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    if (
      selectedId &&
      !hiddenDetections[selectedId] &&
      rectRefs.current[selectedId]
    ) {
      transformer.nodes([rectRefs.current[selectedId] as Konva.Rect]);
    } else {
      transformer.nodes([]);
    }

    transformer.getLayer()?.batchDraw();
  }, [selectedId, hiddenDetections, detectionKeys]);

  const emitRectUpdate = (node: Konva.Rect, key: string) => {
    if (
      !onUpdateDetectionBBox ||
      dimensions.width <= 0 ||
      dimensions.height <= 0
    ) {
      return;
    }

    const minPx = 6;
    const rawWidth = node.width() * node.scaleX();
    const rawHeight = node.height() * node.scaleY();
    const rawX = node.x();
    const rawY = node.y();

    const x = clamp(rawX, 0, Math.max(0, dimensions.width - minPx));
    const y = clamp(rawY, 0, Math.max(0, dimensions.height - minPx));
    const w = clamp(rawWidth, minPx, Math.max(minPx, dimensions.width - x));
    const h = clamp(rawHeight, minPx, Math.max(minPx, dimensions.height - y));

    node.position({ x, y });
    node.width(w);
    node.height(h);
    node.scaleX(1);
    node.scaleY(1);

    onUpdateDetectionBBox(key, {
      x: x / dimensions.width,
      y: y / dimensions.height,
      w: w / dimensions.width,
      h: h / dimensions.height,
    });
  };

  return (
    <Stage
      width={dimensions.width}
      height={dimensions.height}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <Layer>
        {!isImageLoading &&
          !hasError &&
          detections.map((det, index) => {
            const key = detectionKeys[index] ?? `${det.id}-${index}`;
            if (hiddenDetections[key]) return null;

            const pixelX = det.bbox.x * dimensions.width;
            const pixelY = det.bbox.y * dimensions.height;
            const pixelW = det.bbox.w * dimensions.width;
            const pixelH = det.bbox.h * dimensions.height;

            // Get stable color based on detection ID
            const rgb = getStableDetectionColor(det.id);
            const color = rgbToRgba(rgb, 0.3);
            const borderColor = rgbToRgba(rgb, 1);

            const labelHeight = 16;
            const labelSpacing = 4;
            const preferredTopLabelY = pixelY - (labelHeight + labelSpacing);
            const preferredBottomLabelY = pixelY + pixelH + labelSpacing;
            const fitsAbove = preferredTopLabelY >= 10;
            const fitsBelow =
              preferredBottomLabelY + labelHeight <= dimensions.height;

            // Keep labels readable by placing them where there is room first.
            const labelY = fitsAbove
              ? preferredTopLabelY
              : fitsBelow
                ? preferredBottomLabelY
                : Math.max(
                    10,
                    Math.min(
                      preferredTopLabelY,
                      dimensions.height - labelHeight,
                    ),
                  );
            const isSelected = selectedId === key;

            return (
              <Group key={key}>
                <Rect
                  ref={(node) => {
                    rectRefs.current[key] = node;
                  }}
                  x={pixelX}
                  y={pixelY}
                  width={pixelW}
                  height={pixelH}
                  stroke={borderColor}
                  strokeWidth={isSelected ? 4 : 2}
                  fill={color}
                  draggable={isSelected}
                  onClick={() => onSelectDetection(key)}
                  onTap={() => onSelectDetection(key)}
                  onDragStart={() => {
                    setShowText(false);
                  }}
                  onDragEnd={(event) => {
                    setShowText(true);
                    emitRectUpdate(event.target as Konva.Rect, key);
                  }}
                  onTransformEnd={(event) =>
                    emitRectUpdate(event.target as Konva.Rect, key)
                  }
                  style={{ cursor: "pointer" }}
                />
                {showText && (
                  <Text
                    x={pixelX + 4}
                    y={labelY}
                    text={`${det.label} - ${Math.round(det.confidence * 100)}%`}
                    fill={borderColor}
                    fontSize={14}
                    fontStyle="bold"
                  />
                )}
              </Group>
            );
          })}
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio={false}
          ignoreStroke
          enabledAnchors={[
            "top-left",
            "top-center",
            "top-right",
            "middle-left",
            "middle-right",
            "bottom-left",
            "bottom-center",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            const minSize = 6;
            if (newBox.width < minSize || newBox.height < minSize) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
};

export default DetectionsStage;
