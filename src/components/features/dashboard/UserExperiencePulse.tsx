import type { UXResponse } from "../../../types/dashboard/dashboard";
import { useTranslation } from "react-i18next";

type UserExperiencePulseProps = {
  data: UXResponse;
};

const normalizeActivity = (values: number[]) => {
  if (values.length === 0) {
    return values;
  }

  const max = Math.max(...values);
  if (max <= 1) {
    return values.map((value) => value * 100);
  }

  if (max <= 100) {
    return values;
  }

  return values.map((value) => (value / max) * 100);
};

const UserExperiencePulse = ({ data }: UserExperiencePulseProps) => {
  const { t } = useTranslation();
  const lastUpdated = data.last_updated
    ? new Date(data.last_updated).toLocaleString()
    : "—";
  const rawActivity =
    data.active_trend && data.active_trend.length > 0
      ? data.active_trend
      : [40, 65, 55, 80, 95, 70, 85];
  const activity = normalizeActivity(rawActivity);
  const activityStats = rawActivity.reduce(
    (acc, value) => {
      const nextMin = Math.min(acc.min, value);
      const nextMax = Math.max(acc.max, value);
      return {
        min: nextMin,
        max: nextMax,
        sum: acc.sum + value,
      };
    },
    {
      min: rawActivity[0] ?? 0,
      max: rawActivity[0] ?? 0,
      sum: 0,
    },
  );
  const activityAvg = rawActivity.length
    ? Math.round(activityStats.sum / rawActivity.length)
    : 0;
  const activeNow = data.active_now ?? 0;
  const avgResponseTime = Number.isFinite(data.avg_response_time)
    ? Math.round(data.avg_response_time)
    : 0;
  const responseTimeClass = avgResponseTime
    ? avgResponseTime <= 200
      ? "text-hyperion-forest"
      : avgResponseTime <= 500
        ? "text-hyperion-burnt-orange"
        : "text-red-600"
    : "text-hyperion-slate-grey/70";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          {t("dashboard.userExperience.title")}
        </span>
        <span className="h-px flex-1 bg-hyperion-fog-grey/70" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-hyperion-slate-grey/60">
          {t("dashboard.userExperience.lastUpdated")}: {lastUpdated}
        </span>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <div
          className="relative flex h-full flex-col items-center justify-center overflow-hidden border border-hyperion-forest/35 bg-white/85 p-8 text-center shadow-[rgba(26,95,84,0.18)_0px_18px_50px]"
          style={{ borderRadius: "36px 62px 40px 70px / 50px 34px 64px 42px" }}
        >
          <div
            className="pointer-events-none absolute -top-12 left-6 h-20 w-24 bg-hyperion-soft-sky/70"
            style={{ borderRadius: "62% 38% 70% 30% / 44% 56% 44% 56%" }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            {t("dashboard.userExperience.activeNow")}
          </p>
          <p className="mt-4 text-6xl font-black text-hyperion-forest">
            {activeNow.toLocaleString()}
          </p>
        </div>

        <div
          className="relative flex h-full flex-col items-center justify-center overflow-hidden border border-hyperion-burnt-orange/40 bg-white/85 p-8 text-center shadow-[rgba(26,95,84,0.18)_0px_18px_50px]"
          style={{ borderRadius: "38px 70px 34px 62px / 46px 66px 34px 58px" }}
        >
          <div
            className="pointer-events-none absolute -bottom-16 right-4 h-24 w-28 bg-hyperion-burnt-orange/35"
            style={{ borderRadius: "56% 44% 62% 38% / 46% 62% 38% 54%" }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            {t("dashboard.userExperience.avgResponseTime")}
          </p>

          <div className={`mt-4 text-6xl font-black ${responseTimeClass}`}>
            {avgResponseTime
              ? `${avgResponseTime}${t("dashboard.userExperience.ms")}`
              : "—"}
          </div>
        </div>

        <div
          className="relative flex h-full flex-col overflow-hidden border border-hyperion-sage-mint/45 bg-white/85 p-8 shadow-[rgba(26,95,84,0.18)_0px_18px_50px] lg:col-span-2"
          style={{ borderRadius: "34px 60px 44px 72px / 48px 32px 62px 40px" }}
        >
          <div
            className="pointer-events-none absolute -top-10 right-10 h-16 w-20 bg-hyperion-sage-mint/55"
            style={{ borderRadius: "64% 36% 54% 46% / 54% 46% 54% 46%" }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            {t("dashboard.userExperience.dailyActivity")}
          </p>
          <div className="mt-6 flex flex-1 items-end gap-2">
            {activity.map((height, index) => (
              <div key={`activity-${index}`} className="flex-1">
                <div className="mb-2 text-center text-[11px] font-semibold text-hyperion-slate-grey/80">
                  {rawActivity[index] ?? 0}
                </div>
                <div
                  className={`rounded-t-lg ${
                    index === 4
                      ? "bg-hyperion-deep-sea"
                      : "bg-hyperion-sage-mint"
                  }`}
                  style={{ height: `${Math.min(100, Math.max(5, height))}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex text-[11px] font-semibold uppercase tracking-[0.25em] text-hyperion-slate-grey/60 w-full justify-around">
            <span>Min {activityStats.min}</span>
            <span>Max {activityStats.max}</span>
            <span>
              {t("dashboard.userExperience.dailyActivityAvg")} {activityAvg}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserExperiencePulse;
