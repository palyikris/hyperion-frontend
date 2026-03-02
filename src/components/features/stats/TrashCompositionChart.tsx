import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { useTrashComposition } from "../../../hooks/stats/useTrashComposition";
import { useTouchTooltipTrigger } from "../../../hooks/useTouchTooltipTrigger";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type ChartTooltipProps = {
  active?: boolean;
  payload?: {
    payload?: {
      label: string;
      count: number;
      percentage: number;
    };
  }[];
};

const TrashCompositionTooltip = ({ active, payload }: ChartTooltipProps) => {
  const { t } = useTranslation();

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
        {point.label}
      </p>
      <p className="mt-1 text-lg font-bold text-hyperion-deep-sea">
        {t("stats.trash.tooltip.count", { value: point.count })}
      </p>
      <p className="mt-1 text-xs text-hyperion-slate-grey/80">
        {t("stats.trash.tooltip.share", { value: point.percentage.toFixed(1) })}
      </p>
    </motion.div>
  );
};

const pieColors = [
  "var(--color-hyperion-deep-sea)",
  "var(--color-hyperion-sage-mint)",
  "var(--color-hyperion-burnt-orange)",
  "var(--color-hyperion-soft-sky)",
  "var(--color-hyperion-cool-aqua)",
];

const texturePatterns = ["dots", "diagonal", "grid", "waves", "cross"] as const;

const TrashCompositionChart = () => {
  const { t } = useTranslation();
  const trashCompositionQuery = useTrashComposition();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const tooltipTrigger = useTouchTooltipTrigger();
  const isTouchTooltip = tooltipTrigger === "click";

  const compositionData = useMemo(
    () =>
      Array.isArray(trashCompositionQuery.data)
        ? trashCompositionQuery.data
        : [],
    [trashCompositionQuery.data],
  );
  const isLoading =
    trashCompositionQuery.isPending || trashCompositionQuery.isFetching;
  const hasData = compositionData.length > 0;

  const totalDetections = compositionData.reduce(
    (accumulator, item) => accumulator + item.count,
    0,
  );

  const topCategory =
    compositionData.length > 0
      ? compositionData.reduce((top, current) =>
          current.count > top.count ? current : top,
        )
      : null;

  const patternIds = useMemo(
    () =>
      compositionData.map(
        (entry, index) =>
          `trash-pattern-${entry.label.replace(/\s+/g, "-").toLowerCase()}-${index}`,
      ),
    [compositionData],
  );

  return (
    <ScrollReveal
      revealOnScroll={false}
      className="relative h-full overflow-hidden rounded-[36px] border border-white/40 bg-white/45 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),rgba(26,95,84,0.12)_0px_20px_50px] backdrop-blur-xl sm:p-8"
      style={{ borderRadius: "58px 42px 60px 40px / 46px 54px 44px 56px" }}
    >
      <div
        className="pointer-events-none absolute -top-14 right-8 h-24 w-52 bg-hyperion-soft-sky/55"
        style={{ borderRadius: "56% 44% 62% 38% / 52% 40% 60% 48%" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-8 h-24 w-44 bg-hyperion-sage-mint/55"
        style={{ borderRadius: "42% 58% 38% 62% / 62% 38% 54% 46%" }}
      />

      <div className="relative mt-4">
        <p className="text-xs text-hyperion-slate-grey/70">
          {t("stats.trash.summary.topCategory")}:{" "}
          <span className="font-semibold text-hyperion-forest">
            {topCategory?.label ?? t("stats.trash.cards.none")}
          </span>
        </p>
      </div>

      <motion.div
        className="relative mt-8 h-116 w-full rounded-2xl border border-hyperion-fog-grey/70 bg-white/70 p-2"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, delay: 0.28 }}
      >
        {trashCompositionQuery.isError ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-burnt-orange/25 bg-hyperion-burnt-orange/5 px-4 text-center text-sm text-hyperion-slate-grey">
            {t("stats.trash.states.error")}
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.trash.states.loading")}
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.trash.states.empty")}
          </div>
        ) : (
          <div className="flex h-full flex-col gap-4 md:flex-row">
            <div className="md:w-56 md:shrink-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
                {t("stats.trash.legend.filters")}
              </p>
              <div className="space-y-2">
                {compositionData.map((entry, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={`${entry.label}-legend-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                        isActive
                          ? "border-hyperion-deep-sea/60 bg-hyperion-soft-sky/35"
                          : "border-hyperion-fog-grey/80 bg-white/60"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm text-hyperion-forest">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              pieColors[index % pieColors.length],
                          }}
                        />
                        {entry.label}
                      </span>
                      <span className="text-xs font-semibold text-hyperion-slate-grey/80">
                        {entry.percentage.toFixed(1)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {patternIds.map((patternId, index) => {
                      const baseColor = pieColors[index % pieColors.length];
                      const texture =
                        texturePatterns[index % texturePatterns.length];

                      if (texture === "dots") {
                        return (
                          <pattern
                            key={patternId}
                            id={patternId}
                            patternUnits="userSpaceOnUse"
                            width="10"
                            height="10"
                          >
                            <rect width="10" height="10" fill={baseColor} />
                            <circle
                              cx="3"
                              cy="3"
                              r="1.2"
                              fill="var(--color-hyperion-fog-grey)"
                              opacity="0.4"
                            />
                          </pattern>
                        );
                      }

                      if (texture === "diagonal") {
                        return (
                          <pattern
                            key={patternId}
                            id={patternId}
                            patternUnits="userSpaceOnUse"
                            width="8"
                            height="8"
                            patternTransform="rotate(35)"
                          >
                            <rect width="8" height="8" fill={baseColor} />
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="8"
                              stroke="var(--color-hyperion-fog-grey)"
                              strokeWidth="1.4"
                              opacity="0.35"
                            />
                          </pattern>
                        );
                      }

                      if (texture === "grid") {
                        return (
                          <pattern
                            key={patternId}
                            id={patternId}
                            patternUnits="userSpaceOnUse"
                            width="10"
                            height="10"
                          >
                            <rect width="10" height="10" fill={baseColor} />
                            <path
                              d="M0 0 H10 M0 0 V10"
                              stroke="var(--color-hyperion-fog-grey)"
                              strokeWidth="1"
                              opacity="0.35"
                            />
                          </pattern>
                        );
                      }

                      if (texture === "waves") {
                        return (
                          <pattern
                            key={patternId}
                            id={patternId}
                            patternUnits="userSpaceOnUse"
                            width="12"
                            height="12"
                          >
                            <rect width="12" height="12" fill={baseColor} />
                            <path
                              d="M0 6 Q3 3 6 6 T12 6"
                              fill="none"
                              stroke="var(--color-hyperion-fog-grey)"
                              strokeWidth="1.1"
                              opacity="0.4"
                            />
                          </pattern>
                        );
                      }

                      return (
                        <pattern
                          key={patternId}
                          id={patternId}
                          patternUnits="userSpaceOnUse"
                          width="10"
                          height="10"
                        >
                          <rect width="10" height="10" fill={baseColor} />
                          <path
                            d="M0 0 L10 10 M10 0 L0 10"
                            stroke="var(--color-hyperion-fog-grey)"
                            strokeWidth="0.9"
                            opacity="0.3"
                          />
                        </pattern>
                      );
                    })}
                  </defs>
                  <Pie
                    data={compositionData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={88}
                    outerRadius={122}
                    onMouseEnter={
                      isTouchTooltip
                        ? undefined
                        : (_, index) => setActiveIndex(index)
                    }
                    onClick={(_, index) => setActiveIndex(index)}
                    paddingAngle={2}
                    animationBegin={180}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    labelLine={false}
                    label={() => ""}
                  >
                    {compositionData.map((entry, index) => (
                      <Cell
                        key={`${entry.label}-${index}`}
                        fill={`url(#${patternIds[index]})`}
                        opacity={activeIndex === index ? 1 : 0.82}
                        stroke="var(--color-hyperion-fog-grey)"
                        strokeWidth={0.9}
                      />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-hyperion-slate-grey text-[11px] font-semibold uppercase tracking-[0.22em]"
                  >
                    {t("stats.trash.center.totalDetections")}
                  </text>
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-hyperion-forest text-3xl font-bold"
                  >
                    {totalDetections.toLocaleString()}
                  </text>
                  <Tooltip
                    content={<TrashCompositionTooltip />}
                    trigger={tooltipTrigger}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </motion.div>
    </ScrollReveal>
  );
};

export default TrashCompositionChart;
