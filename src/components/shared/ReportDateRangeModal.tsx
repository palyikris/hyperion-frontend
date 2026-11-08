import { useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmModal from "./ConfirmModal";
import DatePicker from "./DatePicker";
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
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
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
      <div className="grid grid-cols-2 items-start gap-3 text-hyperion-deep-sea">
        <DatePicker
          label={t("stats.exportRange.startDate", "Start date")}
          value={startDate} onChange={setStartDate} disabled={isPending}
          open={activePicker === "start"} onOpenChange={open => setActivePicker(open ? "start" : null)}
          defaultMonth={endDate} range={{ start: startDate, end: endDate }}
          className="contents" calendarClassName="col-span-2 order-1 mt-0!"
        />
        <DatePicker
          label={t("stats.exportRange.endDate", "End date")}
          value={endDate} onChange={setEndDate} disabled={isPending}
          open={activePicker === "end"} onOpenChange={open => setActivePicker(open ? "end" : null)}
          defaultMonth={startDate} range={{ start: startDate, end: endDate }}
          className="contents" calendarClassName="col-span-2 order-1 mt-0!"
          invalid={reversed} describedBy={reversed ? "report-date-range-error" : undefined}
        />
        {reversed ? (
          <p id="report-date-range-error" role="alert" className="order-2 col-span-2 text-sm text-hyperion-burnt-orange">
            {t("stats.exportRange.invalidRange", "End date must be on or after start date.")}
          </p>
        ) : null}
      </div>
    </ConfirmModal>
  );
}
