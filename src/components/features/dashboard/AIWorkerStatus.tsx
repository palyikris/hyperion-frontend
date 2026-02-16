import type { AIWorkersResponse } from "../../../types/dashboard";

type AIWorkerStatusProps = {
  data: AIWorkersResponse;
};

const getStatusTone = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes("active") || normalized.includes("online")) {
    return "bg-emerald-500/15 text-emerald-600";
  }
  if (normalized.includes("sync")) {
    return "bg-amber-500/15 text-amber-600";
  }
  if (normalized.includes("idle") || normalized.includes("standby")) {
    return "bg-sky-500/15 text-sky-600";
  }
  if (normalized.includes("pause") || normalized.includes("error")) {
    return "bg-rose-500/15 text-rose-600";
  }

  return "bg-hyperion-fog-grey/70 text-hyperion-slate-grey";
};

const AIWorkerStatus = ({ data }: AIWorkerStatusProps) => {
  const nodes = data.nodes ?? [];
  const clusterStatus = data.cluster_status
    ? data.cluster_status.toUpperCase()
    : "UNKNOWN";
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          AI Worker Status
        </span>
        <span className="h-px flex-1 bg-hyperion-fog-grey/70" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        <div
          className="relative flex flex-col justify-between overflow-hidden border border-hyperion-forest/40 bg-white/85 p-7 shadow-[rgba(26,95,84,0.18)_0px_18px_50px]"
          style={{ borderRadius: "36px 62px 40px 70px / 50px 34px 64px 42px" }}
        >
          <div
            className="pointer-events-none absolute -bottom-10 right-6 h-24 w-28 bg-hyperion-soft-sky/70"
            style={{ borderRadius: "58% 42% 36% 64% / 48% 62% 38% 52%" }}
          />
          <div
            className="pointer-events-none absolute right-10 top-8 h-14 w-24 bg-hyperion-deep-sea/25"
            style={{ borderRadius: "60% 40% 52% 48% / 46% 54% 46% 54%" }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
            Active Fleet
          </p>
          <div className="mt-6">
            <p className="text-5xl font-black text-hyperion-forest">
              {data.total_active_fleet}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-hyperion-slate-grey/60">
              Total workers online
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-hyperion-slate-grey/60">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {clusterStatus}
          </div>
        </div>

        <div
          className="relative border border-hyperion-deep-sea/30 bg-white/85 p-7 shadow-[rgba(26,95,84,0.18)_0px_18px_50px]"
          style={{ borderRadius: "38px 70px 34px 62px / 46px 66px 34px 58px" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
              Worker Nodes
            </p>
            <span className="rounded-full bg-hyperion-deep-sea/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-hyperion-deep-sea">
              Live
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {nodes.map((worker) => (
              <div
                key={worker.name}
                className="flex items-center justify-between rounded-2xl border border-hyperion-fog-grey/70 bg-white/80 px-4 py-3 shadow-[0_8px_20px_rgba(26,95,84,0.08)]"
              >
                <div>
                  <p className="text-sm font-bold text-hyperion-forest">
                    {worker.name}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-hyperion-slate-grey/60">
                    Node status
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] ${getStatusTone(worker.status)}`}
                >
                  {worker.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIWorkerStatus;
