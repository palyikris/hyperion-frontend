import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { MagneticWrapper } from "../../shared/animation/MagneticWrapper";
import { MorphBox } from "../../shared/animation/MorphBox";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { useMeanTimeToProcess } from "../../../hooks/stats/useMeanTimeToProcess";
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
        {t("stats.meanTime.tooltip.seconds", { value: Math.round(worker.avgProcessingSeconds) })}
      </p>
      <p className="mt-1 text-xs text-hyperion-slate-grey/80">
        {t("stats.meanTime.tooltip.tasks", { value: worker.taskCount })}
      </p>
    </motion.div>
  );
};

const MeanTimeToProcessChart = () => {
  const { t } = useTranslation();
  const meanTimeQuery = useMeanTimeToProcess();

  const byWorker = meanTimeQuery.data?.byWorker ?? [];
  const hasData = byWorker.length > 0;
  const isLoading = meanTimeQuery.isPending || meanTimeQuery.isFetching;

  const chartData = byWorker.map((worker) => ({
    workerName: worker.workerName,
    avgProcessingSeconds: Math.round(worker.avgProcessingSeconds),
    taskCount: worker.taskCount,
  }));

  const overallAvgSeconds = meanTimeQuery.data
    ? Math.round(meanTimeQuery.data.overallAvgSeconds)
    : 0;

  const workersTracked = byWorker.length;
  const totalTasks = byWorker.reduce(
    (accumulator, worker) => accumulator + worker.taskCount,
    0,
  );

  return (
    <ScrollReveal
      className="relative h-full overflow-hidden rounded-[36px] border border-hyperion-forest/15 bg-white/90 p-6 shadow-[rgba(26,95,84,0.15)_0px_20px_50px] sm:p-8"
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

      <div className="relative space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          {t("stats.meanTime.title")}
        </p>
      </div>

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
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
              postfix={` ${t("stats.meanTime.units.seconds")}`}
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.meanTime.cards.systemWide")}</p>
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
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.meanTime.cards.workersTracked")}</p>
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
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.meanTime.cards.processedToday")}</p>
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
            <BarChart data={chartData} margin={{ top: 12, right: 20, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-hyperion-fog-grey)" />
              <XAxis
                dataKey="workerName"
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
              <Tooltip content={<MeanTimeTooltip />} cursor={{ fill: "var(--color-hyperion-soft-sky)" }} />
              <Bar
                dataKey="avgProcessingSeconds"
                radius={[14, 14, 6, 6]}
                animationBegin={180}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.workerName}-${index}`}
                    fill={
                      entry.avgProcessingSeconds <= overallAvgSeconds
                        ? "var(--color-hyperion-sage-mint)"
                        : "var(--color-hyperion-burnt-orange)"
                    }
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
