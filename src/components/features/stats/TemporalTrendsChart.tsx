import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MagneticWrapper } from "../../shared/animation/MagneticWrapper";
import { MorphBox } from "../../shared/animation/MorphBox";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { SelectField } from "../../shared/SelectField";
import { useTemporalTrends } from "../../../hooks/stats/useTemporalTrends";
import { useTouchTooltipTrigger } from "../../../hooks/useTouchTooltipTrigger";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RangeOption = "week" | "month" | "quarter";

const RANGE_TO_DAYS: Record<RangeOption, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: {
    value?: number;
    payload?: {
      previousCount: number | null;
      percentChange: number | null;
    };
  }[];
  label?: string;
};

const formatDate = (value: string) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const TrendsTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  const { t } = useTranslation();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const rawValue = Number(payload[0].value ?? 0);
  const point = payload[0].payload;
  const percentChange = point?.percentChange;
  const changePrefix =
    percentChange && percentChange !== null && percentChange > 0 ? "+" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative min-w-48 overflow-hidden rounded-2xl border border-hyperion-forest/25 bg-white/95 px-4 py-3 shadow-[0_12px_35px_rgba(26,95,84,0.2)] backdrop-blur-md"
    >
      <p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-hyperion-slate-grey/80">
        {label}
      </p>
      <p className="relative mt-1 text-xl font-bold text-hyperion-deep-sea">
        {t("stats.temporal.tooltip.detections", { count: rawValue })}
      </p>
      <p className="relative mt-1 text-xs text-hyperion-slate-grey/80">
        {t("stats.temporal.tooltip.percentageChange")}:{" "}
        {percentChange === null
          ? t("stats.temporal.tooltip.notAvailable")
          : `${changePrefix}${percentChange?.toFixed(1)}%`}
      </p>
    </motion.div>
  );
};

const TemporalTrendsChart = () => {
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState<RangeOption>("month");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [isChartInView, setIsChartInView] = useState(false);
  const tooltipTrigger = useTouchTooltipTrigger();
  const chartRef = useRef<HTMLDivElement>(null);
  const selectedDays = RANGE_TO_DAYS[selectedRange];
  const temporalTrendsQuery = useTemporalTrends(selectedDays);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsChartInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.4 },
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  const safeData = Array.isArray(temporalTrendsQuery.data)
    ? temporalTrendsQuery.data
    : [];

  const chartData = safeData.map((entry, index) => {
    const previousCount = index > 0 ? safeData[index - 1].count : null;
    const percentChange =
      previousCount && previousCount > 0
        ? ((entry.count - previousCount) / previousCount) * 100
        : null;

    return {
      ...entry,
      shortDate: formatDate(entry.date),
      previousCount,
      percentChange,
    };
  });

  const totalDetections = safeData.reduce(
    (accumulator, entry) => accumulator + entry.count,
    0,
  );
  const latestDetections =
    safeData.length > 0 ? safeData[safeData.length - 1].count : 0;
  const peakDetections =
    safeData.length > 0 ? Math.max(...safeData.map((entry) => entry.count)) : 0;
  const hasData = safeData.length > 0;
  const isLoading =
    temporalTrendsQuery.isPending || temporalTrendsQuery.isFetching;

  const rangeOptions = useMemo(
    () => [
      { label: t("stats.temporal.range.lastWeek"), value: "week" },
      { label: t("stats.temporal.range.lastMonth"), value: "month" },
      { label: t("stats.temporal.range.lastQuarter"), value: "quarter" },
    ],
    [t],
  );

  return (
    <ScrollReveal
      revealOnScroll={false}
      className="relative h-full overflow-hidden rounded-[36px] border border-white/40 bg-white/45 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),rgba(26,95,84,0.12)_0px_20px_50px] backdrop-blur-xl sm:p-8"
      style={{ borderRadius: "60px 40px 56px 36px / 44px 62px 40px 58px" }}
    >
      <div
        className="pointer-events-none absolute -top-14 left-8 h-24 w-52 bg-hyperion-sage-mint/55"
        style={{ borderRadius: "56% 44% 62% 38% / 52% 40% 60% 48%" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 right-8 h-24 w-44 bg-hyperion-soft-sky/55"
        style={{ borderRadius: "42% 58% 38% 62% / 62% 38% 54% 46%" }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="w-full max-w-55">
          <SelectField
            label={t("stats.temporal.range.label")}
            icon={Calendar}
            id="temporal-trend-range"
            rightIcon={<ChevronDown className="h-5 w-5" />}
            options={rangeOptions}
            selectProps={{
              value: selectedRange,
              onChange: (event) => {
                const nextRange = event.target.value as RangeOption;
                setSelectedRange(nextRange);
              },
            }}
          />
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-sage-mint/70 bg-hyperion-sage-mint/30 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.temporal.cards.totalDetections")}
            </p>
            <RollingNumber
              value={totalDetections}
              className="mt-2 block text-3xl font-light text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">
              {t("stats.temporal.cards.acrossSelectedPeriod")}
            </p>
          </MorphBox>
        </MagneticWrapper>

        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-soft-sky/70 bg-hyperion-soft-sky/30 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.temporal.cards.latestDay")}
            </p>
            <RollingNumber
              value={temporalTrendsQuery.isPending ? 0 : latestDetections}
              className="mt-2 block text-3xl font-light text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">
              {t("stats.temporal.cards.mostRecentDetections")}
            </p>
          </MorphBox>
        </MagneticWrapper>

        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-burnt-orange/60 bg-hyperion-burnt-orange/12 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.temporal.cards.peakDay")}
            </p>
            <RollingNumber
              value={temporalTrendsQuery.isPending ? 0 : peakDetections}
              className="mt-2 block text-3xl font-light text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">
              {t("stats.temporal.cards.highestDailyVolume")}
            </p>
          </MorphBox>
        </MagneticWrapper>
      </div>

      <motion.div
        ref={chartRef}
        className="relative mt-8 h-80 w-full rounded-2xl border border-hyperion-fog-grey/70 bg-white/70 p-2"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, delay: 0.28 }}
      >
        {temporalTrendsQuery.isError ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-burnt-orange/25 bg-hyperion-burnt-orange/5 px-4 text-center text-sm text-hyperion-slate-grey">
            {t("stats.temporal.states.error")}
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.temporal.states.loading")}
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.temporal.states.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={isChartInView ? "visible" : "hidden"}
              data={chartData}
              margin={{ top: 12, right: 20, left: 4, bottom: 8 }}
              onMouseMove={(state) => {
                if (state?.activeLabel) {
                  setActiveLabel(String(state.activeLabel));
                }
              }}
              onMouseLeave={() => setActiveLabel(null)}
            >
              <defs>
                <linearGradient
                  id="temporalTrendFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-hyperion-deep-sea)"
                    stopOpacity={0.05}
                  />
                  <stop
                    offset="35%"
                    stopColor="var(--color-hyperion-deep-sea)"
                    stopOpacity={0.45}
                  />
                  <stop
                    offset="75%"
                    stopColor="var(--color-hyperion-soft-sky)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-hyperion-soft-sky)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <filter
                  id="activeDateGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="4"
                    floodColor="var(--color-hyperion-soft-sky)"
                    floodOpacity="0.7"
                  />
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-hyperion-fog-grey)"
              />
              <XAxis
                dataKey="shortDate"
                tick={(props) => {
                  const isActive = activeLabel === props.payload?.value;

                  return (
                    <g transform={`translate(${props.x},${props.y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="middle"
                        fill="var(--color-hyperion-slate-grey)"
                        fontSize={12}
                        fontWeight={isActive ? 700 : 500}
                        filter={isActive ? "url(#activeDateGlow)" : undefined}
                      >
                        {props.payload?.value}
                      </text>
                    </g>
                  );
                }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
                minTickGap={22}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
              />
              <Tooltip
                content={<TrendsTooltip />}
                cursor={{ stroke: "var(--color-hyperion-soft-sky)" }}
                trigger={tooltipTrigger}
              />
              {activeLabel ? (
                <ReferenceLine
                  x={activeLabel}
                  stroke="var(--color-hyperion-soft-sky)"
                  strokeDasharray="4 3"
                  strokeWidth={2}
                />
              ) : null}
              <Area
                key={selectedRange}
                type="monotone"
                dataKey="count"
                stroke="var(--color-hyperion-deep-sea)"
                strokeWidth={3}
                fill="url(#temporalTrendFill)"
                dot={{
                  r: 3,
                  fill: "var(--color-hyperion-burnt-orange)",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                  fill: "var(--color-hyperion-burnt-orange)",
                  strokeWidth: 0,
                }}
                isAnimationActive={isChartInView}
                animationBegin={400}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </ScrollReveal>
  );
};

export default TemporalTrendsChart;
