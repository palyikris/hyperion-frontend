import type { EnvironmentalFootprint } from "../../../types/stats";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MagneticWrapper } from "../../shared/animation/MagneticWrapper";
import { MorphBox } from "../../shared/animation/MorphBox";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  payload?: { value?: number; payload?: { metricType?: "area" | "detections" } }[];
  label?: string;
};

const formatTooltipValue = (metricType: "area" | "detections" | undefined, value: number) => {
  if (metricType === "area") {
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} sqm`;
  }

  return value.toLocaleString();
};

const EnvironmentalTooltip = ({
  active,
  payload,
  label,
}: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const rawValue = Number(payload[0].value ?? 0);
  const metricType = payload[0].payload?.metricType;

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

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-hyperion-slate-grey/80">
          {label}
        </p>
      </div>

      <p className="relative mt-1 text-xl font-bold text-hyperion-deep-sea">
        {formatTooltipValue(metricType, rawValue)}
      </p>
    </motion.div>
  );
};

const EnvironmentalFootprintChart = ({
  data,
}: EnvironmentalFootprintChartProps) => {
  const { t } = useTranslation();

  const chartData = [
    {
      metric: t("stats.environmental.chart.areaMetric"),
      metricType: "area" as const,
      value: Number(data.totalAreaSqm.toFixed(2)),
    },
    {
      metric: t("stats.environmental.chart.detectionsMetric"),
      metricType: "detections" as const,
      value: data.totalDetections,
    },
  ];
  const averageImpact = data.totalDetections > 0
    ? data.totalAreaSqm / data.totalDetections
    : 0;
  const barColors = [
    "var(--color-hyperion-deep-sea)",
    "var(--color-hyperion-burnt-orange)",
  ];

  return (
    <ScrollReveal
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
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-16 top-16 h-32 w-32 rounded-full border border-hyperion-burnt-orange/20"
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

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            {t("stats.environmental.title")}
          </p>
          
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-soft-sky/70 bg-hyperion-soft-sky/35 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.environmental.cards.totalArea")}
            </p>
            <RollingNumber
              value={Math.round(data.totalAreaSqm)}
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.environmental.cards.sqmImpacted")}</p>
          </MorphBox>
        </MagneticWrapper>

        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-sage-mint/70 bg-hyperion-sage-mint/35 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.environmental.cards.totalDetections")}
            </p>
            <RollingNumber
              value={data.totalDetections}
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.environmental.cards.eventsIdentified")}</p>
          </MorphBox>
        </MagneticWrapper>

        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-burnt-orange/60 bg-hyperion-burnt-orange/12 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.environmental.cards.areaPerDetection")}
            </p>
            <RollingNumber
              value={Math.round(averageImpact * 100) / 100}
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
              postfix=" sqm"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.environmental.cards.impactIntensity")}</p>
          </MorphBox>
        </MagneticWrapper>
      </div>

      <motion.div
        className="relative mt-8 h-80 w-full rounded-2xl border border-hyperion-fog-grey/70 bg-white/70 p-2"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, delay: 0.28 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 20, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--color-hyperion-fog-grey)" />
            <XAxis
              dataKey="metric"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
              tickLine={false}
            />
            <Tooltip content={<EnvironmentalTooltip />} cursor={{ fill: "var(--color-hyperion-soft-sky)" }} />
            <Bar
              dataKey="value"
              radius={[14, 14, 6, 6]}
              animationBegin={180}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`${entry.metric}-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </ScrollReveal>
  );
};

export default EnvironmentalFootprintChart;
