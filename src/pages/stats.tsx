/** src/pages/stats.tsx **/
// TODO: Restore environmental footprint once area calculation is implemented.
// import EnvironmentalFootprintChart from "../components/features/stats/EnvironmentalFootprintChart";
import TemporalTrendsChart from "../components/features/stats/TemporalTrendsChart";
import AIFleetEfficiencyChart from "../components/features/stats/AIFleetEfficiencyChart";
import MeanTimeToProcessChart from "../components/features/stats/MeanTimeToProcessChart";
import HotspotDensityChart from "../components/features/stats/HotspotDensityChart";
import TrashCompositionChart from "../components/features/stats/TrashCompositionChart";
import StatsBentoCard from "../components/features/stats/StatsBentoCard";
import { Button } from "../components/shared/Button";
import { Title } from "../components/shared/Title";
// import { useEnvironmentalFootprint } from "../hooks/stats/useEnvironmentalFootprint";
import { useTranslation } from "react-i18next";
import { useFunFacts } from "../hooks/stats/useFunFacts";
import FunFactBox from "../components/features/stats/FunFactBox";
import { useExportCleanupManifest } from "../hooks/stats/useExportCleanupManifest";
import { useExportCleanupManifestPdf } from "../hooks/stats/useExportCleanupManifestPdf";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ReportDateRangeModal from "../components/shared/ReportDateRangeModal";
import type { ReportDateRange } from "../services/statsService";
import { FileDown, FileSpreadsheet, RefreshCw } from "lucide-react";

const StatsPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const isRefreshing = useIsFetching({ queryKey: ["stats"] }) > 0;
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | null>(null);
  // const environmentalFootprintQuery = useEnvironmentalFootprint();
  const funFactsQuery = useFunFacts(
    i18n.language as "en" | "hu" | undefined,
    4,
  );
  const exportCleanupManifestMutation = useExportCleanupManifest();
  const exportPdfMutation = useExportCleanupManifestPdf();
  const funFacts = funFactsQuery.data?.facts ?? [];

  const onExport = (range: ReportDateRange) => {
    const mutation = exportFormat === "excel" ? exportCleanupManifestMutation : exportPdfMutation;
    if (!exportFormat || mutation.isPending) return;
    mutation.mutate({
      ...range,
      language: (i18n.resolvedLanguage ?? i18n.language).startsWith("hu") ? "hu" : "en",
    }, { onSuccess: () => setExportFormat(null) });
  };

  const onRefreshData = () => {
    void queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  return (
    <div lang={i18n.resolvedLanguage ?? i18n.language} className="stats-page relative min-h-screen bg-gradient-to-br from-[#FDFCF8] via-[#FDFCF8] to-[#F5F3ED] selection:bg-hyperion-soft-sky/30">
      {exportFormat ? (
        <ReportDateRangeModal
          format={exportFormat}
          isPending={exportFormat === "excel" ? exportCleanupManifestMutation.isPending : exportPdfMutation.isPending}
          onConfirm={onExport}
          onClose={() => setExportFormat(null)}
        />
      ) : null}
      <div className="page-shell relative z-10 mx-auto w-full max-w-400">
        {/* Header Section */}
        <header className="mb-6 space-y-4 sm:mb-10 sm:space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Title text={t("stats.page.title")} size="5xl" />
            <Button
              text={
                isRefreshing
                  ? `${t("stats.command.refresh", "Refresh Data")}...`
                  : t("stats.command.refresh", "Refresh Data")
              }
              onClick={onRefreshData}
              disabled={isRefreshing}
              theme="info"
              icon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />}
              animateIcon={false}
              ariaLabel={isRefreshing ? `${t("stats.command.refresh", "Refresh Data")}...` : t("stats.command.refresh", "Refresh Data")}
              className="stats-refresh px-4! py-2.5! text-xs! shadow-none!"
            />
          </div>
          <p className="text-sm leading-relaxed font-medium text-hyperion-slate-grey/70 max-w-3xl">
            {t("stats.page.subtitle")}
          </p>

          <div className="stats-actions action-grid sm:max-w-xl">
            <Button
              text={
                exportCleanupManifestMutation.isPending
                  ? `${t("stats.command.exportManifest", "Export Manifest")}...`
                  : t("stats.command.exportManifest", "Export Manifest")
              }
              onClick={() => setExportFormat("excel")}
              disabled={exportCleanupManifestMutation.isPending}
              theme="info"
              icon={<FileSpreadsheet className="h-4 w-4" />}
              animateIcon={false}
              className="px-3! py-3! text-xs! font-semibold! shadow-none! rounded-xl!"
            />
            <Button
              text={
                exportPdfMutation.isPending
                  ? `${t("stats.command.exportPdf", "Export PDF")}...`
                  : t("stats.command.exportPdf", "Export PDF")
              }
              onClick={() => setExportFormat("pdf")}
              disabled={exportPdfMutation.isPending}
              theme="primary"
              icon={<FileDown className="h-4 w-4" />}
              animateIcon={false}
              className="px-3! py-3! text-xs! font-semibold! shadow-none! rounded-xl!"
            />
          </div>
        </header>

        {/* Main Grid Layout */}
        <section className="space-y-5 sm:space-y-8">
          {/* Environmental Footprint: disabled until area calculation is implemented.
          <StatsBentoCard
            id="chart-environmental"
            title={t("stats.environmental.title", "Environmental Footprint")}
            description={t(
              "stats.info.environmental",
              "Combines mapped impact area and detected waste events to show mission-level ecological load.",
            )}
            className="h-[500px] mb-46"
          >
            {environmentalFootprintQuery.isError && (
              <div role="alert" className="space-y-4 rounded-2xl border border-hyperion-burnt-orange/25 bg-hyperion-burnt-orange/5 p-6 text-sm text-hyperion-slate-grey">
                <p>{t("stats.environmental.states.error", "Failed to load environmental footprint.")}</p>
                <Button
                  text={t("stats.environmental.states.retry", "Retry")}
                  onClick={() => { void environmentalFootprintQuery.refetch(); }}
                  disabled={environmentalFootprintQuery.isFetching}
                  theme="info"
                />
              </div>
            )}
            {environmentalFootprintQuery.data ? (
              <EnvironmentalFootprintChart data={environmentalFootprintQuery.data} />
            ) : !environmentalFootprintQuery.isError ? (
              <p role="status" className="rounded-2xl border border-hyperion-fog-grey/70 bg-white/40 p-6 text-sm text-hyperion-slate-grey/80">
                {t("stats.environmental.states.loading", "Loading environmental footprint...")}
              </p>
            ) : null}
          </StatsBentoCard>
          */}

          {/* Hotspot & Mean Time to Process */}
          <div className="grid grid-cols-1 gap-5 sm:gap-8 xl:grid-cols-2">
            <StatsBentoCard
              id="chart-hotspot"
              title={t("stats.hotspot.title", "Hotspot Density")}
              description={t(
                "stats.info.hotspot",
                "Measures concentration of high-confidence detections and spatial intensity of activity zones.",
              )}
              className="min-w-0"
            >
              <HotspotDensityChart />
            </StatsBentoCard>

            <StatsBentoCard
              id="chart-mttp"
              title={t("stats.meanTime.title", "Mean Time to Process")}
              description={t(
                "stats.info.mttp",
                "Shows mean operational latency from input to completed processing for worker optimization.",
              )}
              className="min-w-0"
            >
              <MeanTimeToProcessChart />
            </StatsBentoCard>
          </div>

          {/* Temporal Trends */}
          <StatsBentoCard
            id="chart-temporal"
            title={t("stats.temporal.title", "Temporal Trends")}
            description={t(
              "stats.info.temporal",
              "Tracks detection volume over time to reveal acceleration, seasonality, and intervention effect.",
            )}
            className="w-full"
          >
            <TemporalTrendsChart />
          </StatsBentoCard>

          {/* Trash Composition & Fleet Efficiency */}
          <div className="grid grid-cols-1 gap-5 sm:gap-8 xl:grid-cols-2">
            <StatsBentoCard
              id="chart-trash"
              title={t("stats.trash.title", "Trash Composition")}
              description={t(
                "stats.info.trash",
                "Distribution of classified waste categories to reveal dominant pollutant patterns.",
              )}
              className="min-w-0"
            >
              <TrashCompositionChart />
            </StatsBentoCard>

            <StatsBentoCard
              id="chart-fleet"
              title={t("stats.aiFleet.title", "AI Fleet Efficiency")}
              description={t(
                "stats.info.fleet",
                "Aggregates worker reliability, throughput, and success-failure balance across autonomous agents.",
              )}
              className="min-w-0"
            >
              <AIFleetEfficiencyChart />
            </StatsBentoCard>
          </div>

          {funFacts.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2">
              {funFacts.slice(0, 4).map((funFact, index) => (
                <StatsBentoCard
                  key={`${funFact.title}-${index}`}
                  id={`chart-funfact-${index + 1}`}
                  className="min-w-0"
                >
                  <FunFactBox funFact={funFact} />
                </StatsBentoCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StatsPage;
