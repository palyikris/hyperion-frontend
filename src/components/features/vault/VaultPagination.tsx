import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VaultPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const VaultPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: VaultPaginationProps) => {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-2 rounded-lg border border-hyperion-deep-sea/30 hover:bg-hyperion-deep-sea/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t("vault.pagination.previous", "Previous page")}
        >
          <ChevronLeft size={20} className="text-hyperion-deep-sea" />
        </button>

        {pageNumbers.map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${idx}`}
                className="px-2 text-hyperion-deep-sea/50"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                isActive
                  ? "bg-hyperion-deep-sea text-white shadow-md"
                  : "border border-hyperion-deep-sea/30 text-hyperion-deep-sea hover:bg-hyperion-deep-sea/10 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 rounded-lg border border-hyperion-deep-sea/30 hover:bg-hyperion-deep-sea/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t("vault.pagination.next", "Next page")}
        >
          <ChevronRight size={20} className="text-hyperion-deep-sea" />
        </button>
      </div>

      <div className="text-sm text-hyperion-deep-sea/70">
        {t(
          "vault.pagination.pageInfo",
          `Page {{current}} of {{total}}`,
          {
            current: currentPage,
            total: totalPages,
          },
        )}
      </div>
    </div>
  );
};

export default VaultPagination;
