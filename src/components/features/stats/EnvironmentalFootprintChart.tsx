import { useEffect, useMemo, useRef, useState } from "react";
import type { EnvironmentalFootprint } from "../../../types/stats";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MorphBox } from "../../shared/animation/MorphBox";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { useTouchTooltipTrigger } from "../../../hooks/useTouchTooltipTrigger";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  LabelList,
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
    payload?: {
      label: string;
      displayValue: string;
    };
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
    })} m²`;
  }

  return value.toLocaleString();
};

const EnvironmentalTooltip = ({ active, payload }: ChartTooltipProps) => {
  const { t } = useTranslation();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="relative min-w-52 overflow-hidden rounded-xl border border-hyperion-deep-sea/25 bg-white/95 px-4 py-3 shadow-[0_10px_28px_rgba(26,95,84,0.18)] backdrop-blur-md"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-hyperion-slate-grey/80">
        {t("stats.environmental.tooltip.metric")}
      </p>
      <p className="mt-1 text-sm text-hyperion-slate-grey/90">
        <span className="font-semibold text-hyperion-deep-sea">
          {item.label}
        </span>
      </p>
      <p className="mt-0.5 text-sm text-hyperion-slate-grey/90">
        {t("stats.environmental.tooltip.value")}:{" "}
        <span className="font-semibold text-hyperion-deep-sea">
          {item.displayValue}
        </span>
      </p>
    </motion.div>
  );
};

const EnvironmentalFootprintChart = ({
  data,
}: EnvironmentalFootprintChartProps) => {
  const { t } = useTranslation();
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

  const averageImpact =
    data.totalDetections > 0 ? data.totalAreaSqm / data.totalDetections : 0;

  const chartData = useMemo(() => {
    const rows = [
      {
        label: t("stats.environmental.cards.totalArea"),
        value: Number(data.totalAreaSqm.toFixed(2)),
        displayValue: formatTooltipValue("area", data.totalAreaSqm),
        color: "var(--color-hyperion-deep-sea)",
      },
      {
        label: t("stats.environmental.cards.totalDetections"),
        value: data.totalDetections,
        displayValue: formatTooltipValue("detections", data.totalDetections),
        color: "var(--color-hyperion-burnt-orange)",
      },
      {
        label: t("stats.environmental.cards.areaPerDetection"),
        value: Number(averageImpact.toFixed(2)),
        displayValue: t("stats.environmental.tooltip.sqmPerEvent", {
          value: averageImpact.toFixed(2),
        }),
        color: "var(--color-hyperion-forest)",
      },
    ];

    const maxValue = Math.max(...rows.map((row) => row.value), 1);

    return rows.map((row) => ({
      ...row,
      normalizedValue: Number(((row.value / maxValue) * 100).toFixed(2)),
    }));
  }, [averageImpact, data.totalAreaSqm, data.totalDetections, t]);

  const renderValueLabel = ({
    x,
    y,
    width,
    height,
    index,
  }: {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    index?: number;
  }) => {
    const xNumber = typeof x === "number" ? x : Number(x);
    const yNumber = typeof y === "number" ? y : Number(y);
    const widthNumber = typeof width === "number" ? width : Number(width);
    const heightNumber = typeof height === "number" ? height : Number(height);

    if (
      !Number.isFinite(xNumber) ||
      !Number.isFinite(yNumber) ||
      !Number.isFinite(widthNumber) ||
      !Number.isFinite(heightNumber) ||
      index === undefined
    ) {
      return null;
    }

    const row = chartData[index];

    if (!row) {
      return null;
    }

    return (
      <text
        x={xNumber + widthNumber + 10}
        y={yNumber + heightNumber / 2 + 4}
        fill="var(--color-hyperion-deep-sea)"
        fontSize={12}
        fontWeight={600}
      >
        {row.displayValue}
      </text>
    );
  };

  return (
    <div>
      <ScrollReveal
        revealOnScroll={false}
        className="relative h-full overflow-hidden rounded-[36px] border border-white/40 bg-white/45 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),rgba(26,95,84,0.12)_0px_20px_50px] backdrop-blur-xl sm:p-8"
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

        <div className="relative mt-6">
          <MorphBox
            className="h-full border border-hyperion-soft-sky/70 bg-white/45 p-5 backdrop-blur-xl"
            blobShape="24px"
            hoverShape="30px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.environmental.cards.impactMasterCard")}
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-hyperion-slate-grey/65">
                  {t("stats.environmental.cards.totalArea")}
                </p>
                <RollingNumber
                  value={Math.round(data.totalAreaSqm)}
                  className="mt-1 block text-3xl font-light text-hyperion-forest"
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
                  className="mt-1 block text-3xl font-light text-hyperion-forest"
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
                  className="mt-1 block text-3xl font-light text-hyperion-forest"
                  postfix=" m²"
                />
                <p className="text-xs text-hyperion-slate-grey/70">
                  {t("stats.environmental.cards.impactIntensity")}
                </p>
              </div>
            </div>
          </MorphBox>
        </div>

        <motion.div
          ref={chartRef}
          className="relative mt-8 h-80 w-full rounded-2xl border border-hyperion-fog-grey/70 bg-white/70 p-3"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, delay: 0.16 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={isChartInView ? "visible" : "hidden"}
              data={chartData}
              layout="vertical"
              margin={{ top: 12, right: 112, left: 12, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 4"
                stroke="var(--color-hyperion-fog-grey)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={false}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={128}
                tick={{
                  fontSize: 12,
                  fill: "var(--color-hyperion-slate-grey)",
                }}
                axisLine={{ stroke: "var(--color-hyperion-fog-grey)" }}
                tickLine={false}
              />
              <Tooltip
                content={<EnvironmentalTooltip />}
                cursor={{ fill: "var(--color-hyperion-soft-sky)" }}
                trigger={tooltipTrigger}
              />
              <Bar
                dataKey="normalizedValue"
                radius={[8, 8, 8, 8]}
                maxBarSize={34}
                isAnimationActive={isChartInView}
                animationBegin={400}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={entry.color}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
              <LabelList dataKey="displayValue" content={renderValueLabel} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </ScrollReveal>
    </div>
  );
};

export default EnvironmentalFootprintChart;
