import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { MagneticWrapper } from "../../shared/animation/MagneticWrapper";
import { MorphBox } from "../../shared/animation/MorphBox";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { useTrashComposition } from "../../../hooks/stats/useTrashComposition";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

const TrashCompositionChart = () => {
  const { t } = useTranslation();
  const trashCompositionQuery = useTrashComposition();

  const compositionData = Array.isArray(trashCompositionQuery.data)
    ? trashCompositionQuery.data
    : [];
  const isLoading = trashCompositionQuery.isPending || trashCompositionQuery.isFetching;
  const hasData = compositionData.length > 0;

  const totalDetections = compositionData.reduce(
    (accumulator, item) => accumulator + item.count,
    0,
  );

  const topCategory = compositionData.length > 0
    ? compositionData.reduce((top, current) =>
      current.count > top.count ? current : top
    )
    : null;

  return (
    <ScrollReveal
      className="relative h-full overflow-hidden rounded-[36px] border border-hyperion-forest/15 bg-white/90 p-6 shadow-[rgba(26,95,84,0.15)_0px_20px_50px] sm:p-8"
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

      <div className="relative space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          {t("stats.trash.title")}
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
              {t("stats.trash.cards.totalItems")}
            </p>
            <RollingNumber
              value={totalDetections}
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.trash.cards.detectedPieces")}</p>
          </MorphBox>
        </MagneticWrapper>

        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-sage-mint/70 bg-hyperion-sage-mint/30 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.trash.cards.topCategory")}
            </p>
            <p className="mt-2 text-2xl font-semibold text-hyperion-forest">
              {topCategory?.label ?? t("stats.trash.cards.none")}
            </p>
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.trash.cards.largestShare")}</p>
          </MorphBox>
        </MagneticWrapper>

        <MagneticWrapper>
          <MorphBox
            className="h-full border border-hyperion-burnt-orange/60 bg-hyperion-burnt-orange/12 p-4"
            blobShape="16px"
            hoverShape="20px"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-hyperion-slate-grey/70">
              {t("stats.trash.cards.categories")}
            </p>
            <RollingNumber
              value={compositionData.length}
              className="mt-2 block text-3xl font-semibold text-hyperion-forest"
            />
            <p className="mt-1 text-xs text-hyperion-slate-grey/70">{t("stats.trash.cards.distinctLabels")}</p>
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
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={compositionData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                animationBegin={180}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {compositionData.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<TrashCompositionTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </ScrollReveal>
  );
};

export default TrashCompositionChart;
