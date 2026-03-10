import AIWorkerStatus from "../components/features/dashboard/AIWorkerStatus";
import NavigatorSection from "../components/features/dashboard/NavigatorSection";
import SystemHealthSnapshot from "../components/features/dashboard/SystemHealthSnapshot";
import UserExperiencePulse from "../components/features/dashboard/UserExperiencePulse";
import LoadingScreen from "../components/shared/LoadingScreen";
import { Title } from "../components/shared/Title";
import { useAIWorkers } from "../hooks/dashboard/useAIWorkers";
import { useSystemHealth } from "../hooks/dashboard/useSystemHealth";
import { useUserExperience } from "../hooks/dashboard/useUserExperience";
import { useTranslation } from "react-i18next";
import { PageAtmosphere } from "../components/shared/decoration";

const DashboardPage = () => {
  const { t } = useTranslation();
  const systemHealthQuery = useSystemHealth();
  const userExperienceQuery = useUserExperience();
  const aiWorkersQuery = useAIWorkers();

  if (
    systemHealthQuery.isLoading ||
    userExperienceQuery.isLoading ||
    aiWorkersQuery.isLoading
  ) {
    return <LoadingScreen />;
  }

  const systemHealthData = systemHealthQuery.data ?? {
    status: "unknown",
    environment: "unknown",
    uptime: 0,
    server_load: [],
  };
  const userExperienceData = userExperienceQuery.data ?? {
    active_now: 0,
    active_trend: [],
    avg_response_time: 0,
    daily_activity: [],
  };
  const aiWorkersData = aiWorkersQuery.data ?? {
    total_active_fleet: 0,
    cluster_status: "unknown",
    nodes: [],
    queue_depth: 0,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-hyperion-cream">
      <PageAtmosphere variant="dashboard" />
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-12 sm:px-10">
        <header className="flex flex-col items-start gap-4">
          <Title text={t("dashboard.page.title")} size="4xl" />
          <p className="text-sm uppercase tracking-[0.4em] text-hyperion-slate-grey/70">
            {t("dashboard.page.subtitle")}
          </p>
        </header>

        <div className="mt-12 space-y-10">
          <NavigatorSection />
          <SystemHealthSnapshot data={systemHealthData} />
          <UserExperiencePulse data={userExperienceData} />
          <AIWorkerStatus data={aiWorkersData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;