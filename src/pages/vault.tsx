import { useState } from "react";
import Gallery from "../components/features/upload/Gallery";
import LoadingScreen from "../components/shared/LoadingScreen";
import VaultHeader from "../components/features/vault/VaultHeader";
import VaultFilters from "../components/features/vault/VaultFilters";
import VaultEmptyState from "../components/features/vault/VaultEmptyState";
import { useVault } from "../hooks/vault/useVault";
import type { CardStatus } from "../types/upload";
import Divider from "../components/shared/Divider";
import { useTranslation } from "react-i18next";

const VaultPage = () => {
  // Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CardStatus | "">("");
  const [orderBy, setOrderBy] = useState("created_at");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(20);
  const [offset] = useState(0);

  const { data = { items: [] }, isLoading } = useVault({
    search: search || undefined,
    status: (statusFilter as CardStatus) || undefined,
    order_by: orderBy,
    direction: direction,
    limit,
    offset,
  });

  const {t} = useTranslation();

  const items = data.items || [];

  console.log("Vault items:", items);

  if (isLoading && !items.length) {
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
          <VaultHeader />
          <VaultFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            orderBy={orderBy}
            onOrderByChange={setOrderBy}
            direction={direction}
            onToggleDirection={() =>
              setDirection((d) => (d === "asc" ? "desc" : "asc"))
            }
            limit={limit}
            onLimitChange={setLimit}
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
      </div>
    </div>
  );
};

export default VaultPage;
