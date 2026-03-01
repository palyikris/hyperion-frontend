import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { MagneticWrapper } from "../../shared/animation/MagneticWrapper";
import { MorphBox } from "../../shared/animation/MorphBox";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { useHotspotDensity } from "../../../hooks/stats/useHotspotDensity";
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

type ChartTooltipProps = {
  active?: boolean;
  payload?: {
    value?: number;
    payload?: {
      metric: string;
      hotspotCount: number;
      highConfidenceMediaCount: number;
      remainingCount: number;
      confidenceShare: number;
    };
  }[];
};

const HotspotTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative min-w-52 overflow-hidden rounded-2xl border border-hyperion-deep-sea/30 bg-white/95 px-4 py-3 shadow-[0_12px_35px_rgba(26,95,84,0.2)] backdrop-blur-md"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-hyperion-slate-grey/80">
        {point.metric}
      </p>
      <p className="mt-1 text-sm text-hyperion-slate-grey/90">
        Hotspots:{" "}
        <span className="font-semibold text-hyperion-deep-sea">
          {point.hotspotCount.toLocaleString()}
        </span>
      </p>
      <p className="mt-0.5 text-sm text-hyperion-slate-grey/90">
        Verified media:{" "}
        <span className="font-semibold text-hyperion-deep-sea">
          {point.highConfidenceMediaCount.toLocaleString()}
        </span>
      </p>
      <p className="mt-0.5 text-sm text-hyperion-slate-grey/90">
        Confidence share:{" "}
        <span className="font-semibold text-hyperion-deep-sea">
          {point.confidenceShare}%
        </span>
      </p>
    </motion.div>
  );
};

const HotspotDensityChart = () => {
  const { t } = useTranslation();
  const hotspotDensityQuery = useHotspotDensity();

  const hotspotCount = hotspotDensityQuery.data?.hotspotCount ?? 0;
  const highConfidenceMediaCount =
    hotspotDensityQuery.data?.highConfidenceMediaCount ?? 0;

  const isLoading =
    hotspotDensityQuery.isPending || hotspotDensityQuery.isFetching;
  const hasData = hotspotDensityQuery.data !== undefined;

  const confidenceShare =
    hotspotCount > 0
      ? Math.round((highConfidenceMediaCount / hotspotCount) * 100)
      : 0;

  const remainingCount = Math.max(hotspotCount - highConfidenceMediaCount, 0);
  const chartData = [
    {
      metric: t("stats.hotspot.chart.hotspots"),
      hotspotCount,
      highConfidenceMediaCount,
      remainingCount,
      confidenceShare,
    },
  ];

  const hotspotIntensity =
    hotspotCount > 0
      ? Math.min(1, 0.35 + Math.log10(hotspotCount + 1) / 2.8)
      : 0.25;
  const confidenceCircumference = 2 * Math.PI * 40;
  const confidenceProgress =
    confidenceCircumference - (confidenceShare / 100) * confidenceCircumference;

  return (
    <ScrollReveal
      revealOnScroll={false}
      className="relative h-full overflow-hidden rounded-[36px] border border-hyperion-forest/15 bg-white/90 p-6 shadow-[rgba(26,95,84,0.15)_0px_20px_50px] sm:p-8"
      style={{ borderRadius: "62px 36px 56px 40px / 42px 58px 46px 54px" }}
    >
      <div
        className="pointer-events-none absolute -top-14 left-8 h-24 w-52 bg-hyperion-soft-sky/55"
        style={{ borderRadius: "56% 44% 62% 38% / 52% 40% 60% 48%" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 right-8 h-24 w-44 bg-hyperion-sage-mint/55"
        style={{ borderRadius: "42% 58% 38% 62% / 62% 38% 54% 46%" }}
      />

      <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-soft-sky/70 bg-hyperion-soft-sky/30 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.hotspot.cards.hotspots")}
            </p>
            <RollingNumber
              value={hotspotCount}
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">
              {t("stats.hotspot.cards.detectedClusters")}
            </p>
          </MorphBox>
        </MagneticWrapper>

        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-sage-mint/70 bg-hyperion-sage-mint/30 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.hotspot.cards.highConfidence")}
            </p>
            <RollingNumber
              value={highConfidenceMediaCount}
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">
              {t("stats.hotspot.cards.verifiedMedia")}
            </p>
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
        <div
          className="pointer-events-none absolute inset-2 rounded-xl opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-hyperion-fog-grey) 1px, transparent 1px), linear-gradient(to bottom, var(--color-hyperion-fog-grey) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute right-4 top-4 z-10 flex h-28 w-28 items-center justify-center rounded-full bg-white/70 backdrop-blur-md">
          <svg
            width="92"
            height="92"
            viewBox="0 0 92 92"
            role="img"
            aria-label="Confidence Share Ring"
          >
            <circle
              cx="46"
              cy="46"
              r="40"
              stroke="var(--color-hyperion-fog-grey)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="46"
              cy="46"
              r="40"
              stroke="var(--color-hyperion-sage-mint)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={confidenceCircumference}
              strokeDashoffset={confidenceProgress}
              transform="rotate(-90 46 46)"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-hyperion-slate-grey/70">
              Verified
            </p>
            <p className="text-xl font-bold text-hyperion-forest">
              {confidenceShare}%
            </p>
          </div>
        </div>

        {hotspotDensityQuery.isError ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-burnt-orange/25 bg-hyperion-burnt-orange/5 px-4 text-center text-sm text-hyperion-slate-grey">
            {t("stats.hotspot.states.error")}
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.hotspot.states.loading")}
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.hotspot.states.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 20, left: 4, bottom: 8 }}
            >
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
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<HotspotTooltip />}
                cursor={{ fill: "var(--color-hyperion-soft-sky)" }}
              />
              <Bar
                dataKey="remainingCount"
                stackId="density"
                radius={[14, 14, 6, 6]}
                animationBegin={180}
                animationDuration={1500}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.metric}-remaining-${index}`}
                    fill="var(--color-hyperion-deep-sea)"
                    fillOpacity={hotspotIntensity}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="highConfidenceMediaCount"
                stackId="density"
                radius={[14, 14, 0, 0]}
                animationBegin={260}
                animationDuration={1500}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.metric}-verified-${index}`}
                    fill="var(--color-hyperion-sage-mint)"
                    fillOpacity={0.95}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </ScrollReveal>
  );
};

export default HotspotDensityChart;
