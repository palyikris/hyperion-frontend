import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import type { MapItem } from "../../../types/map";
import { useDeleteVaultItem } from "../../../hooks/vault/useDeleteVaultItem";
import ConfirmModal from "../../shared/ConfirmModal";
import MarkerDetails from "./MarkerDetails";

interface MarkerSidebarProps {
  item: MapItem;
  onClose: () => void;
  onImageZoom?: () => void;
}

const MarkerSidebar: React.FC<MarkerSidebarProps> = ({
  item,
  onClose,
  onImageZoom,
}) => {
  const { t } = useTranslation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const deleteMutation = useDeleteVaultItem();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isDeleteModalOpen) return;

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, isDeleteModalOpen]);

  const handleConfirmDelete = () => {
    if (!item.id || deleteMutation.isPending) return;

    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        onClose();
      },
      onSettled: () => {
        setIsDeleteModalOpen(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-2000">
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={t("upload.deleteSingleTitle", "Delete Item")}
        description={t(
          "upload.deleteSingleDescription",
          "Are you sure you want to delete this item? This action cannot be undone.",
        )}
        icon={<Trash2 className="w-6 h-6 text-hyperion-burnt-orange" />}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        confirmText={t("upload.deleteConfirm", "Delete")}
        cancelText={t("upload.cancel", "Cancel")}
        isDangerous
      />
      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute top-0 right-0 h-full w-full max-w-105 border-l border-hyperion-sage-mint/30 flex flex-col shadow-2xl bg-hyperion-cream z-50 overflow-hidden"
        style={{
          boxShadow: "0 0 40px 0 rgba(26,95,84,0.18)",
        }}
      >
        {/* Decorative amorph blobs */}
        <div
          className="absolute -top-16 -left-20 w-56 h-56 bg-hyperion-burnt-orange/20 pointer-events-none z-0"
          style={{ borderRadius: "60% 40% 70% 30% / 40% 60% 30% 70%" }}
        />
        <div
          className="absolute top-1/2 -right-24 w-64 h-64 bg-hyperion-forest/15 pointer-events-none z-0"
          style={{ borderRadius: "45% 55% 65% 35% / 35% 65% 45% 55%" }}
        />

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto px-6 pb-8 pt-4 flex flex-col gap-8 z-10">
          {/* Title and meta */}
          <div className="flex flex-col gap-1 border-b border-hyperion-sage-mint/20 pb-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-extrabold text-hyperion-deep-sea leading-tight truncate">
                {item.filename ||
                  t("map.popup.unnamed_report", "Unnamed Report")}
              </h2>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={deleteMutation.isPending}
                className="shrink-0 inline-flex items-center justify-center p-2 rounded-full bg-hyperion-burnt-orange/90 hover:bg-hyperion-burnt-orange disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                aria-label={t("upload.deleteConfirm", "Delete")}
              >
                <Trash2 className="w-5 h-5 text-hyperion-cream" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-hyperion-slate-grey text-sm">
              <span className="inline-flex items-center gap-1 bg-hyperion-sage-mint/20 px-2 py-0.5 rounded-full font-semibold">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#8FCACA" />
                </svg>
                {item.worker_name || t("map.popup.default_worker", "Helios-01")}
              </span>
              <span className="italic text-xs">
                {item.address ||
                  t("map.popup.location_pending", "Location Pending...")}
              </span>
            </div>
          </div>

          {/* MarkerDetails (logs, actions, etc.) */}
          <div className="flex-1">
            <MarkerDetails item={item} onImageZoom={onImageZoom} />
          </div>
        </div>
      </motion.aside>
    </div>
  );
};

export default MarkerSidebar;
