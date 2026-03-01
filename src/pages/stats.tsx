/** src/pages/stats.tsx **/
import EnvironmentalFootprintChart from "../components/features/stats/EnvironmentalFootprintChart";
import TemporalTrendsChart from "../components/features/stats/TemporalTrendsChart";
import AIFleetEfficiencyChart from "../components/features/stats/AIFleetEfficiencyChart";
import MeanTimeToProcessChart from "../components/features/stats/MeanTimeToProcessChart";
import HotspotDensityChart from "../components/features/stats/HotspotDensityChart";
import TrashCompositionChart from "../components/features/stats/TrashCompositionChart";
import StatsBentoCard from "../components/features/stats/StatsBentoCard";
import StatsAtmosphere from "../components/features/stats/StatsAtmosphere";
import StatsCommandBar, {
  type FilterView,
} from "../components/features/stats/StatsCommandBar";
import StatsKpiRibbon, {
  type MetricItem,
} from "../components/features/stats/StatsKpiRibbon";
import LoadingScreen from "../components/shared/LoadingScreen";
import { Title } from "../components/shared/Title";
import { useEnvironmentalFootprint } from "../hooks/stats/useEnvironmentalFootprint";
import { useStatsSummary } from "../hooks/stats/useStatsSummary";
import { useTranslation } from "react-i18next";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useMemo, useState, type MouseEvent } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const StatsPage = () => {
  const { t } = useTranslation();
  const [dateRangeDays, setDateRangeDays] = useState(7);
  const [view, setView] = useState<FilterView>("all");
  const environmentalFootprintQuery = useEnvironmentalFootprint();
  const summaryQuery = useStatsSummary(dateRangeDays);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { scrollYProgress } = useScroll();
  const parallaxY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -110]),
    { stiffness: 60, damping: 20 },
  );

  const glowOffsetX = useTransform(mouseX, [-0.5, 0.5], [-24, 24]);
  const glowOffsetY = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);

  const lastUpdatedLabel = useMemo(() => {
    if (!summaryQuery.dataUpdatedAt) {
      return "--";
    }

    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(summaryQuery.dataUpdatedAt));
  }, [summaryQuery.dataUpdatedAt]);

  const metrics = useMemo<MetricItem[]>(() => {
    const summary = summaryQuery.data;

    if (!summary) {
      return [
        { label: t("stats.kpi.area", "Total Area"), value: 0, postfix: " m²" },
        {
          label: t("stats.kpi.detections", "Active Detections"),
          value: 0,
          postfix: "",
        },
        {
          label: t("stats.kpi.fleet", "Fleet Health"),
          value: 0,
          postfix: "%",
        },
        {
          label: t("stats.kpi.hotspots", "Hotspots"),
          value: 0,
          postfix: "",
        },
        {
          label: t("stats.kpi.mttp", "Mean Process Time"),
          value: 0,
          postfix: "s",
        },
      ];
    }

    return [
      {
        label: t("stats.kpi.area", "Total Area"),
        value: Math.round(summary.environmentalFootprint.totalAreaSqm),
        postfix: " m²",
      },
      {
        label: t("stats.kpi.detections", "Active Detections"),
        value: summary.environmentalFootprint.totalDetections,
        postfix: "",
      },
      {
        label: t("stats.kpi.fleet", "Fleet Health"),
        value: Math.round(
          summary.aiFleetEfficiency.fleetReliabilityScore * 100,
        ),
        postfix: "%",
      },
      {
        label: t("stats.kpi.hotspots", "Hotspots"),
        value: summary.hotspotDensity.hotspotCount,
        postfix: "",
      },
      {
        label: t("stats.kpi.mttp", "Mean Process Time"),
        value: Math.round(summary.meanTimeToProcess.overallAvgSeconds),
        postfix: "s",
      },
    ];
  }, [summaryQuery.data, t]);

  const isEnvironmentalView = view === "environmental";
  const isOperationsView = view === "operations";

  const shouldShowTrash = !isOperationsView;
  const shouldShowHotspot = !isOperationsView;
  const shouldShowEnvironmental = !isOperationsView;
  const shouldShowTemporal = view === "all" || isEnvironmentalView;
  const shouldShowFleet = view === "all" || isOperationsView;
  const shouldShowMttp = view === "all" || isOperationsView;

  const onExportCsv = () => {
    const summary = summaryQuery.data;
    if (!summary) {
      return;
    }

    const csvRows = [
      ["metric", "value"],
      ["total_area_sqm", String(summary.environmentalFootprint.totalAreaSqm)],
      [
        "total_detections",
        String(summary.environmentalFootprint.totalDetections),
      ],
      [
        "fleet_health_percent",
        String(
          Math.round(summary.aiFleetEfficiency.fleetReliabilityScore * 100),
        ),
      ],
      ["hotspot_count", String(summary.hotspotDensity.hotspotCount)],
      [
        "mean_time_to_process_seconds",
        String(summary.meanTimeToProcess.overallAvgSeconds),
      ],
    ];

    const blob = new Blob([csvRows.map((row) => row.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `hyperion-stats-${dateRangeDays}d.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const onExportPdf = () => {
    window.print();
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const normalizedX = event.clientX / window.innerWidth - 0.5;
    const normalizedY = event.clientY / window.innerHeight - 0.5;
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  if (environmentalFootprintQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="relative min-h-screen bg-[#FDFCF8] selection:bg-hyperion-soft-sky/30"
      onMouseMove={handleMouseMove}
    >
      <StatsAtmosphere
        parallaxY={parallaxY}
        glowOffsetX={glowOffsetX}
        glowOffsetY={glowOffsetY}
      />

      <div className="relative z-10 mx-auto w-full max-w-400 px-6 pb-20 pt-12 sm:px-10">
        <header className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Title
                text={t("stats.page.title")}
                size="5xl"
                className="font-light tracking-tight text-hyperion-deep-sea"
              />
            </motion.div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.5em] text-hyperion-slate-grey/60">
                {t("stats.page.subtitle")}
              </p>
              <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-hyperion-deep-sea/80 backdrop-blur-md">
                <span className="relative inline-flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hyperion-sage-mint opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-hyperion-sage-mint" />
                </span>
                <span>
                  {t("stats.command.lastUpdated", "Last Updated")}:{" "}
                  {lastUpdatedLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-hyperion-deep-sea/10 to-transparent hidden lg:block mx-12 mb-4" />
        </header>

        <StatsCommandBar
          dateRangeDays={dateRangeDays}
          setDateRangeDays={setDateRangeDays}
          view={view}
          setView={setView}
          onExportCsv={onExportCsv}
          onExportPdf={onExportPdf}
          hasData={Boolean(summaryQuery.data)}
          labels={{
            all: t("stats.command.all", "All Metrics"),
            environmental: t(
              "stats.command.environmental",
              "Environmental Focus",
            ),
            operations: t(
              "stats.command.operational",
              "Operational Performance",
            ),
            exportCsv: t("stats.command.exportCsv", "Export CSV"),
            exportPdf: t("stats.command.exportPdf", "Export PDF"),
          }}
        />

        <StatsKpiRibbon
          metrics={metrics}
          dateRangeDays={dateRangeDays}
          windowLabel={t("stats.command.window", "Window")}
          windowDetailLabel={t(
            "stats.command.windowDetail",
            "Analytics re-scope instantly while preserving trend continuity.",
          )}
        />

        <motion.section
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 xl:gap-10"
        >
          {shouldShowEnvironmental && (
            <StatsBentoCard
              title={t("stats.environmental.title", "Environmental Footprint")}
              description={t(
                "stats.info.environmental",
                "Combines mapped impact area and detected waste events to show mission-level ecological load.",
              )}
              className="w-full"
            >
              <EnvironmentalFootprintChart
                data={environmentalFootprintQuery.data!}
              />
            </StatsBentoCard>
          )}

          {shouldShowTrash && (
            <StatsBentoCard
              title={t("stats.trash.title", "Trash Composition")}
              description={t(
                "stats.info.trash",
                "Distribution of classified waste categories to reveal dominant pollutant patterns.",
              )}
              className="w-full"
            >
              <TrashCompositionChart />
            </StatsBentoCard>
          )}

          {shouldShowHotspot && (
            <StatsBentoCard
              title={t("stats.hotspot.title", "Hotspot Density")}
              description={t(
                "stats.info.hotspot",
                "Measures concentration of high-confidence detections and spatial intensity of activity zones.",
              )}
              className="w-full"
            >
              <HotspotDensityChart />
            </StatsBentoCard>
          )}

          {shouldShowTemporal && (
            <StatsBentoCard
              title={t("stats.temporal.title", "Temporal Trends")}
              description={t(
                "stats.info.temporal",
                "Tracks detection volume over time to reveal acceleration, seasonality, and intervention effect.",
              )}
              className="w-full"
            >
              <TemporalTrendsChart />
            </StatsBentoCard>
          )}

          {shouldShowFleet && (
            <StatsBentoCard
              title={t("stats.aiFleet.title", "AI Fleet Efficiency")}
              description={t(
                "stats.info.fleet",
                "Aggregates worker reliability, throughput, and success-failure balance across autonomous agents.",
              )}
              className="w-full"
            >
              <AIFleetEfficiencyChart />
            </StatsBentoCard>
          )}

          {shouldShowMttp && (
            <StatsBentoCard
              title={t("stats.meanTime.title", "Mean Time to Process")}
              description={t(
                "stats.info.mttp",
                "Shows median operational latency from input to completed processing for worker optimization.",
              )}
              className="w-full"
            >
              <MeanTimeToProcessChart />
            </StatsBentoCard>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default StatsPage;
