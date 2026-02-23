import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpDown, Filter, Search } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "../../shared/Button";
import { InputField } from "../../shared/InputField";
import { SelectField } from "../../shared/SelectField";
import { createVaultFiltersSchema, type VaultFiltersFormData } from "../../../schemas/vault/filters";
import type { CardStatus } from "../../../types/upload";

interface VaultFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: CardStatus | "";
  onStatusChange: (status: CardStatus | "") => void;
  orderBy: string;
  onOrderByChange: (field: string) => void;
  direction: "asc" | "desc";
  onToggleDirection: () => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

const VaultFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  orderBy,
  onOrderByChange,
  direction,
  onToggleDirection,
  limit,
  onLimitChange,
}: VaultFiltersProps) => {
  const { t, i18n } = useTranslation();
  const filtersSchema = useMemo(
    () => createVaultFiltersSchema(t),
    [t, i18n.resolvedLanguage],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VaultFiltersFormData>({
    resolver: zodResolver(filtersSchema),
    mode: "onBlur",
    defaultValues: {
      search,
      status: statusFilter,
      order_by: orderBy,
      limit,
    },
  });

  useEffect(() => {
    reset({
      search,
      status: statusFilter,
      order_by: orderBy,
      limit,
    });
  }, [reset, search, statusFilter, orderBy, limit]);

  const onSubmit = (data: VaultFiltersFormData) => {
    onSearchChange(data.search.trim());
    onStatusChange(data.status as CardStatus | "");
    onOrderByChange(data.order_by);
    onLimitChange(data.limit);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end w-full gap-4 bg-hyperion-cream/70 p-3 rounded-2xl border border-hyperion-forest/50"
      aria-busy={isSubmitting}
    >
      <div className="w-64">
        <InputField
          label={t("vault.filters.searchLabel", "Search")}
          icon={Search}
          type="text"
          id="vault-search"
          placeholder={t("vault.filters.searchPlaceholder", "Search files...")}
          inputProps={register("search")}
          error={errors.search?.message}
        />
      </div>

      <div className="w-56">
        <SelectField
          label={t("vault.filters.statusLabel", "Status")}
          icon={Filter}
          id="vault-status"
          options={[
            { label: t("vault.filters.statusAll", "All statuses"), value: "" },
            { label: t("vault.filters.statusReady", "Ready"), value: "READY" },
            { label: t("vault.filters.statusProcessing", "Processing"), value: "PROCESSING" },
            { label: t("vault.filters.statusFailed", "Failed"), value: "FAILED" },
          ]}
          selectProps={register("status")}
          error={errors.status?.message}
        />
      </div>

      <div className="w-56">
        <SelectField
          label={t("vault.filters.sortByLabel", "Sort By")}
          icon={Filter}
          id="vault-order-by"
          options={[
            { label: t("vault.filters.sortByCreated", "Created Date"), value: "created_at" },
            { label: t("vault.filters.sortByFilename", "Filename"), value: "filename" },
            { label: t("vault.filters.sortByStatus", "Status"), value: "status" },
          ]}
          selectProps={register("order_by")}
          error={errors.order_by?.message}
        />
      </div>

      <button
        type="button"
        onClick={onToggleDirection}
        className="h-14 px-4 bg-white border rounded-xl hover:bg-hyperion-soft-sky transition-colors shadow-sm"
        title={t("vault.filters.toggleSort", "Toggle Sort Direction")}
      >
        <ArrowUpDown
          size={20}
          className={`text-hyperion-forest transition-transform duration-300 ${direction === "asc" ? "rotate-180" : ""}`}
        />
      </button>

      <div className="w-40">
        <SelectField
          label={t("vault.filters.limitLabel", "Items Per Page")}
          icon={Filter}
          id="vault-limit"
          options={[
            { label: "10", value: "10" },
            { label: "20", value: "20" },
            { label: "50", value: "50" },
            { label: "100", value: "100" },
          ]}
          selectProps={{
            ...register("limit", { valueAsNumber: true }),
          }}
          error={errors.limit?.message}
        />
      </div>

      <div className="min-w-[170px]">
        <Button
          type="submit"
          text={t("vault.filters.apply", "Apply filters")}
          icon={<Search className="w-4 h-4 text-white" />}
          className="w-auto px-8 py-3"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default VaultFilters;
