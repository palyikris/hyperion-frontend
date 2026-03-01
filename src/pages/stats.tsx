import EnvironmentalFootprintChart from "../components/features/stats/EnvironmentalFootprintChart";
import TemporalTrendsChart from "../components/features/stats/TemporalTrendsChart";
import AIFleetEfficiencyChart from "../components/features/stats/AIFleetEfficiencyChart";
import MeanTimeToProcessChart from "../components/features/stats/MeanTimeToProcessChart";
import HotspotDensityChart from "../components/features/stats/HotspotDensityChart";
import LoadingScreen from "../components/shared/LoadingScreen";
import { Title } from "../components/shared/Title";
import { useEnvironmentalFootprint } from "../hooks/stats/useEnvironmentalFootprint";
import { useTranslation } from "react-i18next";

const StatsPage = () => {
  const { t } = useTranslation();
  const environmentalFootprintQuery = useEnvironmentalFootprint();

  if (environmentalFootprintQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (
    environmentalFootprintQuery.isError ||
    !environmentalFootprintQuery.data
  ) {
    return (
      <div className="relative min-h-screen bg-hyperion-cream">
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-12 sm:px-10">
          <Title text={t("stats.page.title")} size="4xl" />
          <p className="mt-8 rounded-2xl border border-hyperion-burnt-orange/30 bg-white/70 p-6 text-hyperion-slate-grey">
            {t("stats.page.loadError")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-hyperion-cream">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-28 right-8 h-72 w-80 bg-hyperion-soft-sky/80"
          style={{ borderRadius: "58% 42% 62% 38% / 46% 38% 62% 54%" }}
        />
        <div
          className="absolute bottom-14 left-8 h-72 w-80 bg-hyperion-cool-aqua/70"
          style={{ borderRadius: "42% 58% 38% 62% / 58% 44% 56% 42%" }}
        />
        <div
          className="absolute right-20 top-28 h-20 w-44 bg-hyperion-burnt-orange/35"
          style={{ borderRadius: "64% 36% 46% 54% / 62% 38% 62% 38%" }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-12 sm:px-10">
        <header className="flex flex-col items-start gap-4">
          <Title text={t("stats.page.title")} size="4xl" />
          <p className="text-sm uppercase tracking-[0.4em] text-hyperion-slate-grey/70">
            {t("stats.page.subtitle")}
          </p>
        </header>

        <section className="mt-10 grid items-stretch gap-8 xl:grid-cols-2">
          <EnvironmentalFootprintChart
            data={environmentalFootprintQuery.data}
          />
          <TemporalTrendsChart />
          <AIFleetEfficiencyChart />
          <MeanTimeToProcessChart />
          <div className="xl:col-span-2">
            <HotspotDensityChart />
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatsPage;
