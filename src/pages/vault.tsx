import { useState } from "react";
import { Trash2 } from "lucide-react";
import Gallery from "../components/features/upload/Gallery";
import LoadingScreen from "../components/shared/LoadingScreen";
import VaultHeader from "../components/features/vault/VaultHeader";
import VaultFilters from "../components/features/vault/VaultFilters";
import VaultPagination from "../components/features/vault/VaultPagination";
import VaultEmptyState from "../components/features/vault/VaultEmptyState";
import ConfirmModal from "../components/shared/ConfirmModal";
import { useVault } from "../hooks/vault/useVault";
import { useDeleteAllVault } from "../hooks/vault/useDeleteAllVault";
import type { CardStatus } from "../types/upload";
import Divider from "../components/shared/Divider";
import { useTranslation } from "react-i18next";
import { useUploadSocket } from "../hooks/upload/useUploadSocket";

const VaultPage = () => {
  // Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CardStatus | "">("");
  const [orderBy, setOrderBy] = useState("created_at");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useUploadSocket();

  // Wrapper functions to reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (status: CardStatus | "") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleOrderByChange = (field: string) => {
    setOrderBy(field);
    setPage(1);
  };

  const handleToggleDirection = () => {
    setDirection((d) => (d === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const {
    data = { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 },
    isLoading,
  } = useVault({
    search: search || undefined,
    status: (statusFilter as CardStatus) || undefined,
    order_by: orderBy,
    direction: direction,
    page_size: pageSize,
    page,
  });

  const deleteAllMutation = useDeleteAllVault();
  const { t } = useTranslation();

  const handleDeleteAll = () => {
    setShowDeleteAllModal(true);
  };

  const handleConfirmDeleteAll = () => {
    setShowDeleteAllModal(false);
    deleteAllMutation.mutate();
  };

  const items = data.items || [];

  if ((isLoading && !items.length) || deleteAllMutation.isPending) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-hyperion-cream">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-10 left-12 h-80 w-96 bg-hyperion-burnt-orange/20"
          style={{ borderRadius: "72% 28% 48% 52% / 52% 48% 52% 48%" }}
        />
        <div
          className="absolute top-1/3 right-10 h-64 w-80 bg-hyperion-cool-aqua/50"
          style={{ borderRadius: "34% 66% 72% 28% / 62% 32% 68% 38%" }}
        />
        <div
          className="absolute bottom-32 left-1/4 h-56 w-56 bg-hyperion-soft-sky/45"
          style={{ borderRadius: "56% 44% 34% 66% / 44% 56% 44% 56%" }}
        />
        <div
          className="absolute top-2/3 right-1/3 h-40 w-48 bg-hyperion-sage-mint/65"
          style={{ borderRadius: "80% 20% 65% 35% / 35% 65% 35% 65%" }}
        />
        <div
          className="absolute -bottom-8 right-20 h-72 w-64 bg-hyperion-forest/40"
          style={{ borderRadius: "48% 52% 44% 56% / 56% 44% 56% 44%" }}
        />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-12 sm:px-10">
        <header className="flex flex-col items-start gap-4">
          <div className="w-full flex justify-between items-start">
            <VaultHeader />
            {items.length > 0 && (
              <button
                onClick={handleDeleteAll}
                disabled={deleteAllMutation.isPending || isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hyperion-burnt-orange/20 text-hyperion-burnt-orange hover:bg-hyperion-burnt-orange/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t("vault.button.deleteAllTooltip", "Delete all media")}
              >
                <Trash2 size={18} />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {t("vault.button.deleteAll", "Delete All")}
                </span>
              </button>
            )}
          </div>
          <VaultFilters
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
            orderBy={orderBy}
            onOrderByChange={handleOrderByChange}
            direction={direction}
            onToggleDirection={handleToggleDirection}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </header>

        <Divider
          label={t("vault.divider.label", "Your Media Vault")}
          leftDotClassName="bg-hyperion-burnt-orange"
          rightDotClassName="bg-hyperion-cool-aqua"
          textClassName="text-hyperion-forest/70"
          className="py-6"
        />

        {items.length > 0 ? <Gallery items={items} /> : <VaultEmptyState />}

        {items.length > 0 && (
          <VaultPagination
            currentPage={data.page}
            totalPages={data.total_pages}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteAllModal}
        title={t("vault.modal.deleteAllTitle", "Delete All Media?")}
        description={t(
          "vault.modal.deleteAllDescription",
          "This will permanently delete all items from your vault. This action cannot be undone.",
        )}
        icon={<Trash2 size={32} />}
        onConfirm={handleConfirmDeleteAll}
        onClose={() => setShowDeleteAllModal(false)}
        confirmText={t("common.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
        isDangerous
      />
    </div>
  );
};

export default VaultPage;
