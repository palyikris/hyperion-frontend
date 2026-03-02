import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { useHotspotDensity } from "../../../hooks/stats/useHotspotDensity";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HotspotMetricTooltipProps = {
  active?: boolean;
  payload?: {
    payload?: {
      metric?: string;
      description?: string;
      value?: number;
    };
    value?: number;
  }[];
};

const HotspotMetricTooltip = ({
  active,
  payload,
}: HotspotMetricTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const row = payload[0]?.payload;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="min-w-56 rounded-2xl border border-hyperion-deep-sea/30 bg-white/95 px-4 py-3 text-hyperion-slate-grey shadow-[0_12px_35px_rgba(26,95,84,0.2)] backdrop-blur-md"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-hyperion-slate-grey/75">
        {row?.metric}
      </p>
      <p className="mt-1 text-lg font-semibold text-hyperion-deep-sea">
        {Number(row?.value ?? 0).toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-hyperion-slate-grey/80">
        {row?.description}
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

  const chartData = [
    {
      metric: t("stats.hotspot.cards.hotspots"),
      value: hotspotCount,
      fill: "var(--color-hyperion-deep-sea)",
      description: t("stats.hotspot.info.clusterDefinition"),
    },
    {
      metric: t("stats.hotspot.cards.verifiedMedia"),
      value: highConfidenceMediaCount,
      fill: "var(--color-hyperion-sage-mint)",
      description: t("stats.hotspot.info.mediaDefinition"),
    },
  ];
  const chartDomainMax = Math.max(
    1,
    ...chartData.map((entry) => entry.value),
    Math.ceil(Math.max(hotspotCount, highConfidenceMediaCount) * 1.2),
  );

  return (
    <ScrollReveal
      revealOnScroll={false}
      className="relative h-full overflow-hidden rounded-[36px] border border-white/40 bg-white/45 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),rgba(26,95,84,0.12)_0px_20px_50px] backdrop-blur-xl sm:p-8"
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

      <motion.div className="relative mt-8 rounded-2xl border border-hyperion-fog-grey/70 bg-white/70 p-6">
        {hotspotDensityQuery.isError ? (
          <div className="flex h-72 items-center justify-center rounded-xl border border-hyperion-burnt-orange/25 bg-hyperion-burnt-orange/5 px-4 text-center text-sm text-hyperion-slate-grey">
            {t("stats.hotspot.states.error")}
          </div>
        ) : isLoading ? (
          <div className="flex h-72 items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.hotspot.states.loading")}
          </div>
        ) : !hasData ? (
          <div className="flex h-72 items-center justify-center rounded-xl border border-hyperion-fog-grey/70 bg-white/40 px-4 text-center text-sm text-hyperion-slate-grey/80">
            {t("stats.hotspot.states.empty")}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-12">
            <motion.div
              className="space-y-4 col-span-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, delay: 0.28 }}
            >
              <div className="rounded-xl border border-hyperion-deep-sea/35 bg-hyperion-deep-sea/5 p-5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-hyperion-slate-grey/70">
                  {t("stats.hotspot.cards.hotspots")}
                </p>
                <p className="mt-2 text-4xl font-semibold text-hyperion-deep-sea">
                  {hotspotCount.toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-hyperion-slate-grey/80">
                  {t("stats.hotspot.info.clusterDefinition")}
                </p>
              </div>

              <div className="rounded-xl border border-hyperion-sage-mint/45 bg-hyperion-sage-mint/12 p-5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-hyperion-slate-grey/70">
                  {t("stats.hotspot.cards.verifiedMedia")}
                </p>
                <p className="mt-2 text-4xl font-semibold text-hyperion-forest">
                  {highConfidenceMediaCount.toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-hyperion-slate-grey/80">
                  {t("stats.hotspot.info.mediaDefinition")}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="rounded-xl border border-hyperion-soft-sky/70 bg-hyperion-soft-sky/20 p-5 col-span-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, delay: 0.38 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-hyperion-slate-grey/75">
                {t("stats.hotspot.info.title")}
              </p>
              <div className="mt-4 h-100 w-full rounded-xl border border-hyperion-fog-grey/70 bg-white/65 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 12, right: 12, left: 12, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(26,95,84,0.12)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="metric"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--color-hyperion-slate-grey)",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <YAxis
                      type="number"
                      domain={[0, chartDomainMax]}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--color-hyperion-slate-grey)",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      content={<HotspotMetricTooltip />}
                      cursor={false}
                    />
                    <Bar
                      dataKey="value"
                      radius={[10, 10, 0, 0]}
                      animationBegin={220}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.metric} fill={entry.fill} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(value) =>
                          Number(value ?? 0).toLocaleString()
                        }
                        fill="var(--color-hyperion-deep-sea)"
                        fontSize={12}
                        fontWeight={600}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-hyperion-slate-grey/80">
                {t("stats.hotspot.info.line2")}
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </ScrollReveal>
  );
};

export default HotspotDensityChart;
