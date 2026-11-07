import { useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmModal from "./ConfirmModal";
import type { ReportDateRange } from "../../services/statsService";

interface ReportDateRangeModalProps {
  format: "excel" | "pdf";
  isPending: boolean;
  onConfirm: (range: ReportDateRange) => void;
  onClose: () => void;
}

export default function ReportDateRangeModal({
  format, isPending, onConfirm, onClose,
}: ReportDateRangeModalProps) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const reversed = Boolean(startDate && endDate && startDate > endDate);
  const valid = Boolean(startDate && endDate && !reversed);

  return (
    <ConfirmModal
      isOpen
      title={t("stats.exportRange.title", "Choose report dates")}
      description={t("stats.exportRange.description", "Include media uploaded between these dates, including both days (UTC).")}
      confirmText={format === "excel"
        ? t("stats.command.exportManifest", "Export Manifest")
        : t("stats.command.exportPdf", "Export PDF")}
      cancelText={t("stats.exportRange.cancel", "Cancel")}
      confirmDisabled={!valid}
      isPending={isPending}
      onClose={onClose}
      onConfirm={() => { if (valid) onConfirm({ startDate, endDate }); }}
    >
      <div className="grid gap-4 text-hyperion-deep-sea">
        <label className="grid gap-2 text-sm font-semibold">
          {t("stats.exportRange.startDate", "Start date")}
          <input
            type="date" required value={startDate} disabled={isPending}
            onChange={event => setStartDate(event.target.value)}
            onInput={event => setStartDate(event.currentTarget.value)}
            className="w-full rounded-xl border border-hyperion-fog-grey bg-white px-4 py-3 focus:outline-2 focus:outline-hyperion-deep-sea"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          {t("stats.exportRange.endDate", "End date")}
          <input
            type="date" required value={endDate} disabled={isPending}
            onChange={event => setEndDate(event.target.value)}
            onInput={event => setEndDate(event.currentTarget.value)}
            aria-invalid={reversed}
            aria-describedby={reversed ? "report-date-range-error" : undefined}
            className="w-full rounded-xl border border-hyperion-fog-grey bg-white px-4 py-3 focus:outline-2 focus:outline-hyperion-deep-sea"
          />
        </label>
        {reversed ? (
          <p id="report-date-range-error" role="alert" className="text-sm text-hyperion-burnt-orange">
            {t("stats.exportRange.invalidRange", "End date must be on or after start date.")}
          </p>
        ) : null}
      </div>
    </ConfirmModal>
  );
}
