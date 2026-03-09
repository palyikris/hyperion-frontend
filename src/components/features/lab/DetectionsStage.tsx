import { Group, Layer, Rect, Stage, Text } from "react-konva";
import type { Detection } from "../../../types/lab";

type DetectionsStageProps = {
  detections: Detection[];
  hiddenDetections: Record<string, boolean>;
  dimensions: { width: number; height: number };
  isImageLoading: boolean;
  hasError: boolean;
  selectedId: string | null;
  onSelectDetection: (id: string) => void;
};

const pseudoRandomChannel = (seed: number): number => {
  const value = Math.sin(seed) * 10000;
  return Math.floor((value - Math.floor(value)) * 256);
};

const visibleDarkPalette: ReadonlyArray<[number, number, number]> = [
  [170, 30, 30],
  [22, 120, 38],
  [194, 104, 20],
  [20, 96, 138],
  [124, 48, 156],
  [158, 144, 20],
  [26, 58, 158],
  [150, 70, 96],
];

const DetectionsStage = ({
  detections,
  hiddenDetections,
  dimensions,
  isImageLoading,
  hasError,
  selectedId,
  onSelectDetection,
}: DetectionsStageProps) => {
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
            const key = `${det.id}-${index}`;
            if (hiddenDetections[key]) return null;

            const pixelX = det.bbox.x * dimensions.width;
            const pixelY = det.bbox.y * dimensions.height;
            const pixelW = det.bbox.w * dimensions.width;
            const pixelH = det.bbox.h * dimensions.height;

            const seed =
              (index + 1) *
              (det.bbox.x + det.bbox.y + det.bbox.w + det.bbox.h + det.confidence + 1);
            const paletteIndex = pseudoRandomChannel(seed) % visibleDarkPalette.length;
            const [r, g, b] = visibleDarkPalette[paletteIndex];
            const color = `rgba(${r}, ${g}, ${b}, 0.3)`;
            const borderColor = `rgba(${r}, ${g}, ${b}, 1)`;
            const labelHeight = 16;
            const labelSpacing = 4;
            const preferredTopLabelY = pixelY - (labelHeight + labelSpacing);
            const preferredBottomLabelY = pixelY + pixelH + labelSpacing;
            const fitsAbove = preferredTopLabelY >= 10;
            const fitsBelow = preferredBottomLabelY + labelHeight <= dimensions.height;

            // Keep labels readable by placing them where there is room first.
            const labelY = fitsAbove
              ? preferredTopLabelY
              : fitsBelow
                ? preferredBottomLabelY
                : Math.max(10, Math.min(preferredTopLabelY, dimensions.height - labelHeight));
            const isSelected = selectedId === key;

            return (
              <Group key={key}>
                <Rect
                  x={pixelX}
                  y={pixelY}
                  width={pixelW}
                  height={pixelH}
                  stroke={borderColor}
                  strokeWidth={isSelected ? 4 : 2}
                  fill={color}
                  onClick={() => onSelectDetection(key)}
                  onTap={() => onSelectDetection(key)}
                  style={{ cursor: 'pointer' }}
                />
                <Text
                  x={pixelX + 4}
                  y={labelY}
                  text={det.label}
                  fill={borderColor}
                  fontSize={14}
                  fontStyle="bold"
                />
              </Group>
            );
          })}
      </Layer>
    </Stage>
  );
};

export default DetectionsStage;
