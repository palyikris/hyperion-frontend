import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { MagneticWrapper } from "../../shared/animation/MagneticWrapper";
import { MorphBox } from "../../shared/animation/MorphBox";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { useMeanTimeToProcess } from "../../../hooks/stats/useMeanTimeToProcess";
import { useTouchTooltipTrigger } from "../../../hooks/useTouchTooltipTrigger";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartTooltipProps = {
  active?: boolean;
  payload?: {
    payload?: {
      workerName: string;
      avgProcessingSeconds: number;
      taskCount: number;
    };
  }[];
};

const MeanTimeTooltip = ({ active, payload }: ChartTooltipProps) => {
  const { t } = useTranslation();

  if (!active || !payload || payload.length === 0 || !payload[0].payload) {
    return null;
  }

  const worker = payload[0].payload;
  const roundedSeconds = Math.round(worker.avgProcessingSeconds);
  const humanizedTime =
    roundedSeconds >= 60
      ? `${(roundedSeconds / 60).toFixed(1)}m`
      : `${roundedSeconds}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative min-w-52 overflow-hidden rounded-2xl border border-hyperion-deep-sea/30 bg-white/95 px-4 py-3 shadow-[0_12px_35px_rgba(26,95,84,0.2)] backdrop-blur-md"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-hyperion-slate-grey/80">
        {worker.workerName}
      </p>
      <p className="mt-1 text-lg font-bold text-hyperion-deep-sea">
        {humanizedTime}
      </p>
      <p className="mt-1 text-xs text-hyperion-slate-grey/80">
        {t("stats.meanTime.tooltip.tasks", { value: worker.taskCount })}
      </p>
    </motion.div>
  );
};

const getProcessingColor = (value: number, average: number) => {
  if (average <= 0) {
    return "var(--color-hyperion-soft-sky)";
  }

  const ratio = value / average;

  if (ratio <= 0.8) {
    return "var(--color-hyperion-sage-mint)";
  }

  if (ratio <= 1) {
    return "var(--color-hyperion-cool-aqua)";
  }

  if (ratio <= 1.2) {
    return "var(--color-hyperion-soft-sky)";
  }

  return "var(--color-hyperion-burnt-orange)";
};

const MeanTimeToProcessChart = () => {
  const { t } = useTranslation();
  const meanTimeQuery = useMeanTimeToProcess();
  const tooltipTrigger = useTouchTooltipTrigger();
  const [isChartInView, setIsChartInView] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

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

  const byWorker = meanTimeQuery.data?.byWorker ?? [];
  const hasData = byWorker.length > 0;
  const isLoading = meanTimeQuery.isPending || meanTimeQuery.isFetching;

  const chartData = byWorker.map((worker) => ({
    workerName: worker.workerName,
    avgProcessingSeconds: Math.round(worker.avgProcessingSeconds),
    taskCount: worker.taskCount,
  }));

  const maxWorkerAvgSeconds = chartData.reduce(
    (maxValue, worker) => Math.max(maxValue, worker.avgProcessingSeconds),
    0,
  );

  const overallAvgSeconds = meanTimeQuery.data
    ? Math.round(meanTimeQuery.data.overallAvgSeconds)
    : 0;

  const workersTracked = byWorker.length;
  const totalTasks = byWorker.reduce(
    (accumulator, worker) => accumulator + worker.taskCount,
    0,
  );

  const xAxisUpperBound =
    Math.max(maxWorkerAvgSeconds, overallAvgSeconds) > 0
      ? Math.ceil(Math.max(maxWorkerAvgSeconds, overallAvgSeconds) * 1.08)
      : 10;

  const chartHeight = Math.max(320, chartData.length * 52 + 64);

  return (
    <ScrollReveal
      revealOnScroll={false}
      className="relative h-full overflow-hidden rounded-[36px] border border-white/40 bg-white/45 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),rgba(26,95,84,0.12)_0px_20px_50px] backdrop-blur-xl sm:p-8"
      style={{ borderRadius: "40px 60px 36px 56px / 58px 38px 62px 42px" }}
    >
      <div
        className="pointer-events-none absolute -top-14 right-8 h-24 w-52 bg-hyperion-soft-sky/55"
        style={{ borderRadius: "56% 44% 62% 38% / 52% 40% 60% 48%" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-8 h-24 w-44 bg-hyperion-cool-aqua/55"
        style={{ borderRadius: "42% 58% 38% 62% / 62% 38% 54% 46%" }}
      />

      <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-soft-sky/70 bg-hyperion-soft-sky/30 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.meanTime.cards.overallAverage")}
            </p>
            <RollingNumber
              value={overallAvgSeconds}
              className="mt-2 block text-3xl font-light text-hyperion-forest"
              postfix={` ${t("stats.meanTime.units.seconds")}`}
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">
              {t("stats.meanTime.cards.systemWide")}
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
              {t("stats.meanTime.cards.workers")}
            </p>
            <RollingNumber
              value={workersTracked}
              className="mt-2 block text-3xl font-light text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">
              {t("stats.meanTime.cards.workersTracked")}
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
              {t("stats.meanTime.cards.tasks")}
            </p>
            <RollingNumber
              value={totalTasks}
              className="mt-2 block text-3xl font-light text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">
              {t("stats.meanTime.cards.processedToday")}
            </p>
          </MorphBox>
        </MagneticWrapper>
      </div>

      <motion.div
        ref={chartRef}
        className="relative mt-8 w-full rounded-2xl border border-hyperion-fog-grey/70 bg-white/70 p-2"
        style={{ height: chartHeight }}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, delay: 0.28 }}
      >
        {meanTimeQuery.isError ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-burnt-orange/25 bg-hyperion-burnt-orange/5 px-4 text-center text-sm text-hyperion-slate-grey">
            {t("stats.meanTime.states.error")}
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.meanTime.states.loading")}
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.meanTime.states.empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={isChartInView ? "visible" : "hidden"}
              data={chartData}
              layout="vertical"
              margin={{ top: 36, right: 28, left: 12, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-hyperion-fog-grey)"
              />
              <XAxis
                type="number"
                domain={[0, xAxisUpperBound]}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="workerName"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
                width={110}
              />
              <Tooltip
                content={<MeanTimeTooltip />}
                cursor={{ fill: "var(--color-hyperion-soft-sky)" }}
                trigger={tooltipTrigger}
              />
              <ReferenceLine
                x={overallAvgSeconds}
                stroke="var(--color-hyperion-burnt-orange)"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{
                  value: t("stats.meanTime.chart.fleetAverage"),
                  position: "top",
                  offset: 12,
                  fill: "var(--color-hyperion-slate-grey)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
              <Bar
                dataKey="avgProcessingSeconds"
                radius={[6, 14, 14, 6]}
                isAnimationActive={isChartInView}
                animationBegin={300}
                animationDuration={1500}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.workerName}-${index}`}
                    fill={getProcessingColor(
                      entry.avgProcessingSeconds,
                      overallAvgSeconds,
                    )}
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

export default MeanTimeToProcessChart;
