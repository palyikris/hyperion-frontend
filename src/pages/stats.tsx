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
import { useFunFacts } from "../hooks/stats/useFunFacts";
import FunFactBox from "../components/features/stats/FunFactBox";
import { useExportCleanupManifest } from "../hooks/stats/useExportCleanupManifest";
import { useExportCleanupManifestPdf } from "../hooks/stats/useExportCleanupManifestPdf";

const StatsPage = () => {
  const { t, i18n } = useTranslation();
  const dateRangeDays = 7;
  const environmentalFootprintQuery = useEnvironmentalFootprint();
  const summaryQuery = useStatsSummary(dateRangeDays);
  const funFactsQuery = useFunFacts(
    i18n.language as "en" | "hu" | undefined,
    4,
  );
  const exportCleanupManifestMutation = useExportCleanupManifest();
  const exportPdfMutation = useExportCleanupManifestPdf();

  const onExportManifest = () => {
    exportCleanupManifestMutation.mutate({
      days: dateRangeDays,
      language: i18n.language as "hu" | "en",
    });
  };

  const onExportPdf = () => {
    exportPdfMutation.mutate({
      days: dateRangeDays,
      language: i18n.language as "hu" | "en",
    });
  };

  const onRefreshData = () => {
    void Promise.all([
      environmentalFootprintQuery.refetch(),
      summaryQuery.refetch(),
    ]);
  };

  if (
    environmentalFootprintQuery.isLoading ||
    summaryQuery.isLoading ||
    funFactsQuery.isLoading
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FDFCF8] via-[#FDFCF8] to-[#F5F3ED] selection:bg-hyperion-soft-sky/30">
      <div className="relative z-10 mx-auto w-full max-w-400 px-6 pb-40 pt-10 sm:px-10">
        {/* Header Section */}
        <header className="mb-24 space-y-8">
          <div className="space-y-3">
            <Title text={t("stats.page.title")} size="5xl" />
            <p className="text-sm font-medium text-hyperion-slate-grey/70 max-w-3xl">
              {t("stats.page.subtitle")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              text={
                summaryQuery.isFetching ||
                environmentalFootprintQuery.isFetching
                  ? `${t("stats.command.refresh", "Refresh Data")}...`
                  : t("stats.command.refresh", "Refresh Data")
              }
              onClick={onRefreshData}
              theme="info"
              className="px-4! py-2.5! text-[12px]! uppercase! tracking-wider! font-semibold! shadow-none!"
            />

            <Button
              text={
                exportCleanupManifestMutation.isPending
                  ? `${t("stats.command.exportManifest", "Export Manifest")}...`
                  : t("stats.command.exportManifest", "Export Manifest")
              }
              onClick={onExportManifest}
              disabled={
                !summaryQuery.data || exportCleanupManifestMutation.isPending
              }
              theme="info"
              className="px-4! py-2.5! text-[12px]! uppercase! tracking-wider! font-semibold! shadow-none!"
            />
            <Button
              text={
                exportPdfMutation.isPending
                  ? `${t("stats.command.exportPdf", "Export PDF")}...`
                  : t("stats.command.exportPdf", "Export PDF")
              }
              onClick={onExportPdf}
              disabled={!summaryQuery.data || exportPdfMutation.isPending}
              theme="primary"
              className="px-4! py-2.5! text-[12px]! uppercase! tracking-wider! font-semibold! shadow-none!"
            />
          </div>
        </header>

        {/* Main Grid Layout */}
        <section className="space-y-0">
          {/* Environmental Footprint - Hero Section */}
          <StatsBentoCard
            id="chart-environmental"
            title={t("stats.environmental.title", "Environmental Footprint")}
            description={t(
              "stats.info.environmental",
              "Combines mapped impact area and detected waste events to show mission-level ecological load.",
            )}
            className="h-[500px] mb-46"
          >
            <EnvironmentalFootprintChart
              data={environmentalFootprintQuery.data!}
            />
          </StatsBentoCard>

          {/* Fun Facts */}
          {funFactsQuery.data && (
            <div className="grid grid-cols-12 gap-6">
              <StatsBentoCard
                id="chart-funfact-1"
                className="col-span-12 lg:col-span-6"
              >
                <FunFactBox funFact={funFactsQuery.data.facts[0]}></FunFactBox>
              </StatsBentoCard>

              <StatsBentoCard
                id="chart-funfact-2"
                className="col-span-12 lg:col-span-6"
              >
                <FunFactBox funFact={funFactsQuery.data.facts[1]}></FunFactBox>
              </StatsBentoCard>
            </div>
          )}

          {/* Hotspot & Mean Time to Process */}
          <div className="grid grid-cols-12 gap-6 mb-50 xl:mb-80 mt-16">
            <StatsBentoCard
              id="chart-hotspot"
              title={t("stats.hotspot.title", "Hotspot Density")}
              description={t(
                "stats.info.hotspot",
                "Measures concentration of high-confidence detections and spatial intensity of activity zones.",
              )}
              className="col-span-12 mb-70 xl:mb-0 xl:col-span-6 h-[450px]"
            >
              <HotspotDensityChart />
            </StatsBentoCard>

            <StatsBentoCard
              id="chart-mttp"
              title={t("stats.meanTime.title", "Mean Time to Process")}
              description={t(
                "stats.info.mttp",
                "Shows median operational latency from input to completed processing for worker optimization.",
              )}
              className="col-span-12 xl:col-span-6 h-[450px]"
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
            className="h-[480px] mb-66"
          >
            <TemporalTrendsChart />
          </StatsBentoCard>

          {/* Fun Facts */}
          {funFactsQuery.data && (
            <div className="grid grid-cols-12 gap-6">
              <StatsBentoCard
                id="chart-funfact-3"
                className="col-span-12 lg:col-span-6"
              >
                <FunFactBox funFact={funFactsQuery.data.facts[2]}></FunFactBox>
              </StatsBentoCard>

              <StatsBentoCard
                id="chart-funfact-4"
                className="col-span-12 lg:col-span-6"
              >
                <FunFactBox funFact={funFactsQuery.data.facts[3]}></FunFactBox>
              </StatsBentoCard>
            </div>
          )}

          {/* Trash Composition & Fleet Efficiency */}
          <div className="grid grid-cols-12 gap-6 mb-50 mt-16">
            <StatsBentoCard
              id="chart-trash"
              title={t("stats.trash.title", "Trash Composition")}
              description={t(
                "stats.info.trash",
                "Distribution of classified waste categories to reveal dominant pollutant patterns.",
              )}
              className="col-span-12 mb-55 xl:mb-0 xl:col-span-6 h-[450px]"
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
              className="col-span-12 xl:col-span-6 h-[450px]"
            >
              <AIFleetEfficiencyChart />
            </StatsBentoCard>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatsPage;
