import type { SystemHealthResponse } from "../../../types/dashboard/dashboard";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { Blob, blobShapes } from "../../shared/decoration";

type SystemHealthSnapshotProps = {
  data: SystemHealthResponse;
};

const normalizeLoadValues = (values: number[]) => {
  if (values.length === 0) {
    return values;
  }

  const max = Math.max(...values);

  // If all values are already in percentage range (0-100), return as-is
  if (max <= 100) {
    return values;
  }

  // If values exceed 100, normalize to 0-100 range
  return values.map((value) => (value / max) * 100);
};

const SystemHealthSnapshot = ({ data }: SystemHealthSnapshotProps) => {
  const { t } = useTranslation();
  const loadValues = normalizeLoadValues(
    data.server_load && data.server_load.length > 0
      ? data.server_load
      : [20, 45, 70, 90, 60, 35, 50],
  );

  return (
    <ScrollReveal
      className="min-w-0 relative flex h-full flex-col justify-center overflow-hidden border border-hyperion-deep-sea/35 bg-white/80 p-5 sm:p-8 shadow-[rgba(26,95,84,0.2)_0px_22px_60px]"
      style={{ borderRadius: "36px 64px 40px 72px / 52px 34px 60px 44px" }}
    >
      <Blob
        color="bg-hyperion-soft-sky/70"
        size="h-24 w-40"
        position="-top-16 right-10"
        shape={blobShapes.organic26}
      />
      <Blob
        color="bg-hyperion-sage-mint/60"
        size="h-32 w-32"
        position="-bottom-12 left-6"
        shape={blobShapes.organic27}
      />

      <div className="min-w-0 relative w-full">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          {t("dashboard.systemHealth.serverLoad")}
        </p>
        <div className="mt-4 flex h-16 items-end gap-2">
          {loadValues.map((height, index) => (
            <div
              key={`spark-${index}`}
              className="flex-1 flex h-full flex-col items-center justify-end gap-1"
            >
              <div
                className={`w-full rounded-md transition-all ${
                  index % 2 === 0
                    ? "bg-hyperion-deep-sea/75"
                    : "bg-hyperion-burnt-orange/55"
                }`}
                style={{ height: `${Math.min(100, Math.max(5, height))}%` }}
                title={`${height}%`}
              />
              <span className="text-[9px] font-bold text-hyperion-slate-grey/80">
                {height}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-[10px] font-bold text-hyperion-slate-grey/70">
          <div className="flex flex-col">
            <span>{t("dashboard.systemHealth.min")}:</span>
            <span className="text-hyperion-deep-sea">
              {Math.min(...loadValues)}%
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span>{t("dashboard.systemHealth.avg")}:</span>
            <span className="text-hyperion-burnt-orange">
              {(
                loadValues.reduce((a, b) => a + b, 0) / loadValues.length
              ).toFixed(2)}
              %
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span>{t("dashboard.systemHealth.max")}:</span>
            <span className="text-hyperion-forest">
              {Math.max(...loadValues)}%
            </span>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default SystemHealthSnapshot;
