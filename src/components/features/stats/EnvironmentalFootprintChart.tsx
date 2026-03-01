import { type MouseEvent, useState } from "react";
import type { EnvironmentalFootprint } from "../../../types/stats";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MorphBox } from "../../shared/animation/MorphBox";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EnvironmentalFootprintChartProps = {
  data: EnvironmentalFootprint;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: {
    value?: number;
    dataKey?: string;
  }[];
};

const formatTooltipValue = (
  metricType: "area" | "detections" | undefined,
  value: number,
) => {
  if (metricType === "area") {
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} sqm`;
  }

  return value.toLocaleString();
};

const EnvironmentalTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const areaValue = Number(
    payload.find((entry) => entry.dataKey === "areaSqm")?.value ?? 0,
  );
  const detectionsValue = Number(
    payload.find((entry) => entry.dataKey === "detections")?.value ?? 0,
  );
  const intensityValue = Number(
    payload.find((entry) => entry.dataKey === "impactIntensity")?.value ?? 0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative min-w-52 overflow-hidden rounded-2xl border border-hyperion-deep-sea/30 bg-white/95 px-4 py-3 shadow-[0_12px_35px_rgba(26,95,84,0.2)] backdrop-blur-md"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-10"
        style={{
          background:
            "linear-gradient(120deg, var(--color-hyperion-soft-sky) 0%, transparent 70%)",
          opacity: 0.35,
        }}
      />

      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-hyperion-slate-grey/80">
        Impact Summary
      </p>
      <p className="mt-1 text-sm text-hyperion-slate-grey/90">
        Area:{" "}
        <span className="font-semibold text-hyperion-deep-sea">
          {formatTooltipValue("area", areaValue)}
        </span>
      </p>
      <p className="mt-0.5 text-sm text-hyperion-slate-grey/90">
        Detections:{" "}
        <span className="font-semibold text-hyperion-deep-sea">
          {formatTooltipValue("detections", detectionsValue)}
        </span>
      </p>
      <p className="mt-0.5 text-sm text-hyperion-slate-grey/90">
        Impact Intensity:{" "}
        <span className="font-semibold text-hyperion-deep-sea">
          {intensityValue.toFixed(2)} sqm/event
        </span>
      </p>
    </motion.div>
  );
};

const EnvironmentalFootprintChart = ({
  data,
}: EnvironmentalFootprintChartProps) => {
  const { t } = useTranslation();
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  const averageImpact =
    data.totalDetections > 0 ? data.totalAreaSqm / data.totalDetections : 0;

  const chartData = [
    {
      metric: t("stats.environmental.title"),
      areaSqm: Number(data.totalAreaSqm.toFixed(2)),
      detections: data.totalDetections,
      impactIntensity: Number(averageImpact.toFixed(2)),
    },
  ];

  const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - bounds.left;
    const relativeY = event.clientY - bounds.top;
    const normalizedX = (relativeX / bounds.width - 0.5) * 2;
    const normalizedY = (relativeY / bounds.height - 0.5) * 2;

    setPointerOffset({
      x: normalizedX * 14,
      y: normalizedY * 12,
    });
  };

  return (
    <div
      onMouseMove={handlePointerMove}
      onMouseLeave={() => setPointerOffset({ x: 0, y: 0 })}
    >
      <ScrollReveal
        revealOnScroll={false}
        className="relative h-full overflow-hidden rounded-[36px] border border-hyperion-forest/15 bg-white/90 p-6 shadow-[rgba(26,95,84,0.15)_0px_20px_50px] sm:p-8"
        style={{ borderRadius: "36px 58px 40px 64px / 54px 40px 60px 46px" }}
      >
        <div
          className="pointer-events-none absolute -top-16 right-8 h-28 w-56 bg-hyperion-soft-sky/55"
          style={{ borderRadius: "64% 36% 55% 45% / 44% 62% 38% 56%" }}
        />
        <div
          className="pointer-events-none absolute -bottom-12 left-8 h-24 w-40 bg-hyperion-sage-mint/55"
          style={{ borderRadius: "58% 42% 66% 34% / 40% 64% 36% 60%" }}
        />
        <motion.div
          className="pointer-events-none absolute right-20 top-20 h-24 w-24 rounded-full border border-hyperion-deep-sea/20"
          style={{ x: pointerOffset.x * 0.7, y: pointerOffset.y * 0.8 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute right-16 top-16 h-32 w-32 rounded-full border border-hyperion-burnt-orange/20"
          style={{ x: pointerOffset.x * -0.6, y: pointerOffset.y * -0.7 }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(110deg, transparent 20%, var(--color-hyperion-soft-sky) 50%, transparent 80%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative mt-6">
          <MorphBox
            className="h-full border border-hyperion-soft-sky/70 bg-white/45 p-5 backdrop-blur-xl"
            blobShape="24px"
            hoverShape="30px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              Impact Master Card
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-hyperion-slate-grey/65">
                  {t("stats.environmental.cards.totalArea")}
                </p>
                <RollingNumber
                  value={Math.round(data.totalAreaSqm)}
                  className="mt-1 block text-3xl font-semibold text-hyperion-forest"
                />
                <p className="text-xs text-hyperion-slate-grey/70">
                  {t("stats.environmental.cards.sqmImpacted")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-hyperion-slate-grey/65">
                  {t("stats.environmental.cards.totalDetections")}
                </p>
                <RollingNumber
                  value={data.totalDetections}
                  className="mt-1 block text-3xl font-semibold text-hyperion-forest"
                />
                <p className="text-xs text-hyperion-slate-grey/70">
                  {t("stats.environmental.cards.eventsIdentified")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-hyperion-slate-grey/65">
                  {t("stats.environmental.cards.areaPerDetection")}
                </p>
                <RollingNumber
                  value={Math.round(averageImpact * 100) / 100}
                  className="mt-1 block text-3xl font-semibold text-hyperion-forest"
                  postfix=" sqm"
                />
                <p className="text-xs text-hyperion-slate-grey/70">
                  {t("stats.environmental.cards.impactIntensity")}
                </p>
              </div>
            </div>
          </MorphBox>
        </div>

        <motion.div
          className="relative mt-8 h-80 w-full rounded-2xl border border-hyperion-fog-grey/70 bg-white/70 p-2"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, delay: 0.28 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 28, left: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient
                  id="envAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-hyperion-deep-sea)"
                    stopOpacity={0.95}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-hyperion-sage-mint)"
                    stopOpacity={0.72}
                  />
                </linearGradient>
                <linearGradient
                  id="envDetectionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-hyperion-burnt-orange)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-hyperion-soft-sky)"
                    stopOpacity={0.65}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-hyperion-fog-grey)"
              />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
              />
              <YAxis yAxisId="intensity" hide domain={[0, "dataMax + 1"]} />
              <Tooltip
                content={<EnvironmentalTooltip />}
                cursor={{ fill: "var(--color-hyperion-soft-sky)" }}
              />
              <Bar
                yAxisId="left"
                dataKey="areaSqm"
                radius={[14, 14, 6, 6]}
                fill="url(#envAreaGradient)"
                maxBarSize={82}
                animationBegin={180}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Bar
                yAxisId="right"
                dataKey="detections"
                radius={[14, 14, 6, 6]}
                fill="url(#envDetectionGradient)"
                maxBarSize={62}
                animationBegin={280}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Line
                yAxisId="intensity"
                type="monotone"
                dataKey="impactIntensity"
                stroke="var(--color-hyperion-forest)"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: "var(--color-hyperion-forest)",
                  stroke: "var(--color-hyperion-soft-sky)",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 7 }}
                animationBegin={380}
                animationDuration={1200}
                animationEasing="ease-in-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      </ScrollReveal>
    </div>
  );
};

export default EnvironmentalFootprintChart;
