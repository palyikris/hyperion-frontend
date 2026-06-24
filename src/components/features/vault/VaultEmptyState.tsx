import { useTranslation } from "react-i18next";

const VaultEmptyState = ({
  showText = true,
}: {
  showText?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center justify-center py-32 text-center space-y-4"
      id="vault-empty-state"
    >
      <div className="relative">
        <div className="w-40 h-40 rounded-full bg-hyperion-soft-sky flex items-center justify-center border-4 border-white shadow-inner">
          <div className="w-16 h-24 bg-hyperion-muted-gold/20 rounded-xl"></div>
        </div>
        <div className="absolute bottom-2 right-2 bg-hyperion-deep-sea text-white p-2 rounded-full border-4 border-white">
          <img
            src="/avatar_confused.png"
            alt="Hyperion avatar confused image"
          />
        </div>
      </div>
      {showText && (
        <p className="text-hyperion-forest/60 italic">
          {t("vault.empty", "No media found matching your criteria.")}
        </p>
      )}
    </div>
  );
};

export default VaultEmptyState;
