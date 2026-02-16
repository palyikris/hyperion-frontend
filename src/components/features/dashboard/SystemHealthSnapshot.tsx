import type { SystemHealthResponse } from "../../../types/dashboard";

type SystemHealthSnapshotProps = {
  data: SystemHealthResponse;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const normalizeLoadValues = (values: number[]) => {
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

const SystemHealthSnapshot = ({ data }: SystemHealthSnapshotProps) => {
  const uptimeValue = typeof data.uptime === "number" ? data.uptime : null;
  const uptimePercent = uptimeValue !== null ? clampPercent(uptimeValue) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (uptimePercent / 100) * circumference;
  const loadValues = normalizeLoadValues(
    data.server_load && data.server_load.length > 0
      ? data.server_load
      : [20, 45, 70, 90, 60, 35, 50],
  );
  const environmentLabel = data.environment
    ? data.environment.toUpperCase()
    : "UNKNOWN";
  const statusLabel = data.status ? data.status.toUpperCase() : "UNKNOWN";

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          System Health Snapshot
        </span>
        <span className="h-px flex-1 bg-hyperion-fog-grey/70" />
      </div>
      <div
        className="relative flex flex-col gap-8 overflow-hidden border border-hyperion-deep-sea/35 bg-white/80 p-8 shadow-[rgba(26,95,84,0.2)_0px_22px_60px] lg:flex-row lg:items-center"
        style={{ borderRadius: "36px 64px 40px 72px / 52px 34px 60px 44px" }}
      >
        <div
          className="pointer-events-none absolute -top-10 right-10 h-24 w-40 bg-hyperion-soft-sky/70"
          style={{ borderRadius: "62% 38% 70% 30% / 44% 56% 44% 56%" }}
        />
        <div
          className="pointer-events-none absolute -bottom-12 left-6 h-32 w-32 bg-hyperion-sage-mint/60"
          style={{ borderRadius: "50% 50% 62% 38% / 46% 54% 46% 54%" }}
        />

        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-hyperion-fog-grey"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                className="text-hyperion-deep-sea"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-hyperion-deep-sea">
              {uptimeValue !== null ? `${Math.round(uptimePercent)}%` : "--"}
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-hyperion-forest">
              Uptime Gauge
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-hyperion-slate-grey/70">
              System Stability
            </p>
            <span className="mt-2 inline-flex items-center rounded-full bg-hyperion-deep-sea/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-hyperion-deep-sea">
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            Server Load (CPU/RAM)
          </p>
          <div className="mt-4 flex h-12 items-end gap-2">
            {loadValues.map((height, index) => (
              <div
                key={`spark-${index}`}
                className={`flex-1 rounded-md ${
                  index % 2 === 0
                    ? "bg-hyperion-deep-sea/75"
                    : "bg-hyperion-burnt-orange/55"
                }`}
                style={{ height: `${Math.min(100, Math.max(5, height))}%` }}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-hyperion-slate-grey/60">
            Pulse line
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            Environment Status
          </span>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 shadow-[0_0_18px_rgba(16,185,129,0.35)]">
            {environmentLabel}: {statusLabel}
          </span>
        </div>
      </div>
    </section>
  );
};

export default SystemHealthSnapshot;
