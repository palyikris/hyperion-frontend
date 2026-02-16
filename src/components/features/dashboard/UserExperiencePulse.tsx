import type { UXResponse } from "../../../types/dashboard";

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
  const activity = normalizeActivity(
    data.daily_activity && data.daily_activity.length > 0
      ? data.daily_activity
      : [40, 65, 55, 80, 95, 70, 85],
  );
  const activeNow = data.active_now ?? 0;
  const avgResponseTime = Number.isFinite(data.avg_response_time)
    ? Math.round(data.avg_response_time)
    : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          User Experience Pulse
        </span>
        <span className="h-px flex-1 bg-hyperion-fog-grey/70" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div
          className="relative flex h-full flex-col items-center justify-center overflow-hidden border border-hyperion-forest/35 bg-white/85 p-8 text-center shadow-[rgba(26,95,84,0.18)_0px_18px_50px]"
          style={{ borderRadius: "36px 62px 40px 70px / 50px 34px 64px 42px" }}
        >
          <div
            className="pointer-events-none absolute -top-8 left-6 h-20 w-24 bg-hyperion-soft-sky/70"
            style={{ borderRadius: "62% 38% 70% 30% / 44% 56% 44% 56%" }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            Active Now
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
            Avg. Response Time
          </p>

          <div className="mt-4 text-6xl font-black text-hyperion-forest">
            {avgResponseTime ? `${avgResponseTime}ms` : "—"}
          </div>
        </div>

        <div
          className="relative flex h-full flex-col overflow-hidden border border-hyperion-sage-mint/45 bg-white/85 p-8 shadow-[rgba(26,95,84,0.18)_0px_18px_50px]"
          style={{ borderRadius: "34px 60px 44px 72px / 48px 32px 62px 40px" }}
        >
          <div
            className="pointer-events-none absolute -top-6 right-10 h-16 w-20 bg-hyperion-sage-mint/55"
            style={{ borderRadius: "64% 36% 54% 46% / 54% 46% 54% 46%" }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            Daily Activity (7 Days)
          </p>
          <div className="mt-6 flex flex-1 items-end gap-2">
            {activity.map((height, index) => (
              <div
                key={`activity-${index}`}
                className={`flex-1 rounded-t-lg ${
                  index === 4 ? "bg-hyperion-deep-sea" : "bg-hyperion-sage-mint"
                }`}
                style={{ height: `${Math.min(100, Math.max(5, height))}%` }}
              />
            ))}
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-hyperion-slate-grey/60">
            Rolling 7-day usage
          </p>
        </div>
      </div>
    </section>
  );
};

export default UserExperiencePulse;
