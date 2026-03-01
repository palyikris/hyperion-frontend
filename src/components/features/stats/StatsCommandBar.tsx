import { motion } from "framer-motion";
import { Button } from "../../shared/Button";

type FilterView = "all" | "environmental" | "operations";

type StatsCommandBarProps = {
  dateRangeDays: number;
  setDateRangeDays: (days: number) => void;
  view: FilterView;
  setView: (view: FilterView) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  hasData: boolean;
  labels: {
    all: string;
    environmental: string;
    operations: string;
    exportCsv: string;
    exportPdf: string;
  };
};

const StatsCommandBar = ({
  dateRangeDays,
  setDateRangeDays,
  view,
  setView,
  onExportCsv,
  onExportPdf,
  hasData,
  labels,
}: StatsCommandBarProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 z-20 mb-8 rounded-[30px] border border-white/50 bg-white/55 p-4 shadow-[0_14px_34px_rgba(12,44,37,0.12)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setDateRangeDays(days)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition-colors duration-300 ${
                dateRangeDays === days
                  ? "border-hyperion-deep-sea bg-hyperion-deep-sea text-white"
                  : "border-white/70 bg-white/70 text-hyperion-slate-grey hover:border-hyperion-deep-sea/30"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {([
            ["all", labels.all],
            ["environmental", labels.environmental],
            ["operations", labels.operations],
          ] as Array<[FilterView, string]>).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ${
                view === mode
                  ? "border-hyperion-cool-aqua bg-hyperion-cool-aqua/40 text-hyperion-deep-sea"
                  : "border-white/70 bg-white/70 text-hyperion-slate-grey hover:border-hyperion-cool-aqua/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            text={labels.exportCsv}
            onClick={onExportCsv}
            disabled={!hasData}
            theme="info"
            className="!w-auto !px-5 !py-2 !text-xs !font-semibold !shadow-none"
          />
          <Button
            text={labels.exportPdf}
            onClick={onExportPdf}
            theme="primary"
            className="!w-auto !px-5 !py-2 !text-xs !font-semibold !shadow-none"
          />
        </div>
      </div>
    </motion.section>
  );
};

export default StatsCommandBar;
export type { FilterView };
