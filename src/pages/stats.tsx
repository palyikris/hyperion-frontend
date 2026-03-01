/** src/pages/stats.tsx **/
import EnvironmentalFootprintChart from "../components/features/stats/EnvironmentalFootprintChart";
import TemporalTrendsChart from "../components/features/stats/TemporalTrendsChart";
import AIFleetEfficiencyChart from "../components/features/stats/AIFleetEfficiencyChart";
import MeanTimeToProcessChart from "../components/features/stats/MeanTimeToProcessChart";
import HotspotDensityChart from "../components/features/stats/HotspotDensityChart";
import TrashCompositionChart from "../components/features/stats/TrashCompositionChart";
import StatsBentoCard from "../components/features/stats/StatsBentoCard";
import { Button } from "../components/shared/Button";
import LoadingScreen from "../components/shared/LoadingScreen";
import { Title } from "../components/shared/Title";
import { useEnvironmentalFootprint } from "../hooks/stats/useEnvironmentalFootprint";
import { useStatsSummary } from "../hooks/stats/useStatsSummary";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

const StatsPage = () => {
  const { t } = useTranslation();
  const dateRangeDays = 7;
  const environmentalFootprintQuery = useEnvironmentalFootprint();
  const summaryQuery = useStatsSummary(dateRangeDays);

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

  const onRefreshData = () => {
    void Promise.all([
      environmentalFootprintQuery.refetch(),
      summaryQuery.refetch(),
    ]);
  };

  if (environmentalFootprintQuery.isLoading) {
    return <LoadingScreen />;
  }

  const isLive =
    summaryQuery.isSuccess &&
    Boolean(summaryQuery.data) &&
    !summaryQuery.isFetching;

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] selection:bg-hyperion-soft-sky/30">
      <div className="relative z-10 mx-auto w-full max-w-400 px-6 pb-20 pt-12 sm:px-10">
        <header className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <Title
              text={t("stats.page.title")}
              size="5xl"
              className="font-light tracking-tight text-hyperion-deep-sea"
            />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.5em] text-hyperion-slate-grey/60">
                {t("stats.page.subtitle")}
              </p>
              <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-hyperion-deep-sea/80 backdrop-blur-md">
                <span className="relative inline-flex h-2.5 w-2.5">
                  {isLive ? (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hyperion-sage-mint opacity-75" />
                  ) : null}
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                      isLive
                        ? "bg-hyperion-sage-mint"
                        : summaryQuery.isError
                          ? "bg-hyperion-burnt-orange"
                          : "bg-hyperion-fog-grey"
                    }`}
                  />
                </span>
                <span>
                  {isLive
                    ? t("stats.command.live", "Live")
                    : t("stats.command.lastUpdated", "Last Updated")}
                  : {lastUpdatedLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-2.5 md:self-start">
            <Button
              text={
                summaryQuery.isFetching ||
                environmentalFootprintQuery.isFetching
                  ? `${t("stats.command.refresh", "Refresh Data")}...`
                  : t("stats.command.refresh", "Refresh Data")
              }
              onClick={onRefreshData}
              theme="info"
              className="w-full! px-5! py-3! text-[11px]! uppercase! tracking-[0.16em]! font-semibold! shadow-none!"
            />

            <Button
              text={t("stats.command.exportCsv", "Export CSV")}
              onClick={onExportCsv}
              disabled={!summaryQuery.data}
              theme="info"
              className="w-full! px-5! py-3! text-[11px]! uppercase! tracking-[0.16em]! font-semibold! shadow-none!"
            />
            <Button
              text={t("stats.command.exportPdf", "Export PDF")}
              onClick={onExportPdf}
              theme="primary"
              className="w-full! px-5! py-3! text-[11px]! uppercase! tracking-[0.16em]! font-semibold! shadow-none!"
            />
          </div>
        </header>

        <section className="grid grid-cols-12 auto-rows-[minmax(220px,auto)] gap-6 xl:gap-8">
          <StatsBentoCard
            id="chart-environmental"
            title={t("stats.environmental.title", "Environmental Footprint")}
            description={t(
              "stats.info.environmental",
              "Combines mapped impact area and detected waste events to show mission-level ecological load.",
            )}
            className="col-span-12 xl:col-span-7"
          >
            <EnvironmentalFootprintChart
              data={environmentalFootprintQuery.data!}
            />
          </StatsBentoCard>

          <StatsBentoCard
            id="chart-trash"
            title={t("stats.trash.title", "Trash Composition")}
            description={t(
              "stats.info.trash",
              "Distribution of classified waste categories to reveal dominant pollutant patterns.",
            )}
            className="col-span-12 xl:col-span-5"
          >
            <TrashCompositionChart />
          </StatsBentoCard>

          <StatsBentoCard
            id="chart-hotspot"
            title={t("stats.hotspot.title", "Hotspot Density")}
            description={t(
              "stats.info.hotspot",
              "Measures concentration of high-confidence detections and spatial intensity of activity zones.",
            )}
            className="col-span-12 xl:col-span-4 lg:row-span-1"
          >
            <HotspotDensityChart />
          </StatsBentoCard>

          <StatsBentoCard
            id="chart-temporal"
            title={t("stats.temporal.title", "Temporal Trends")}
            description={t(
              "stats.info.temporal",
              "Tracks detection volume over time to reveal acceleration, seasonality, and intervention effect.",
            )}
            className="col-span-12 xl:col-span-8 lg:row-span-2"
          >
            <TemporalTrendsChart />
          </StatsBentoCard>

          <StatsBentoCard
            id="chart-fleet"
            title={t("stats.aiFleet.title", "AI Fleet Efficiency")}
            description={t(
              "stats.info.fleet",
              "Aggregates worker reliability, throughput, and success-failure balance across autonomous agents.",
            )}
            className="col-span-12 xl:col-span-6"
          >
            <AIFleetEfficiencyChart />
          </StatsBentoCard>

          <StatsBentoCard
            id="chart-mttp"
            title={t("stats.meanTime.title", "Mean Time to Process")}
            description={t(
              "stats.info.mttp",
              "Shows median operational latency from input to completed processing for worker optimization.",
            )}
            className="col-span-12 xl:col-span-6"
          >
            <MeanTimeToProcessChart />
          </StatsBentoCard>
        </section>
      </div>
    </div>
  );
};

export default StatsPage;
