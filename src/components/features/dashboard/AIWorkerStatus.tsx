const workers = [
  { name: "Orion", status: "Active", tone: "bg-emerald-500/15 text-emerald-600" },
  { name: "Vega", status: "Syncing", tone: "bg-amber-500/15 text-amber-600" },
  { name: "Lyra", status: "Idle", tone: "bg-sky-500/15 text-sky-600" },
  { name: "Atlas", status: "Paused", tone: "bg-rose-500/15 text-rose-600" },
];

const AIWorkerStatus = () => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          AI Worker Status
        </span>
        <span className="h-px flex-1 bg-hyperion-fog-grey/70" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[34px] border border-hyperion-forest/40 bg-white/85 p-7 shadow-[rgba(26,95,84,0.18)_0px_18px_50px]">
         
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
            <p className="text-5xl font-black text-hyperion-forest">12</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-hyperion-slate-grey/60">
              Total workers online
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-hyperion-slate-grey/60">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Stabilized cluster
          </div>
        </div>

        <div className="relative rounded-[34px] border border-hyperion-deep-sea/30 bg-white/85 p-7 shadow-[rgba(26,95,84,0.18)_0px_18px_50px]">
          
          
          
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
              Worker Nodes
            </p>
            <span className="rounded-full bg-hyperion-deep-sea/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-hyperion-deep-sea">
              Live
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {workers.map((worker) => (
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
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] ${worker.tone}`}
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
