import React from "react";
import { useTranslation } from "react-i18next";

interface NavProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavProfile: React.FC<NavProfileProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.full_name || t("nav.userFallback");

  return (
    <div className="flex items-center gap-4 p-1 w-full border-t border-white/5 pt-4">
      <div className="min-w-[40px] h-10 rounded-full overflow-hidden border-2 border-hyperion-burnt-orange shadow-lg shrink-0">
        <img
          alt={t("nav.userProfileAlt")}
          className="w-full h-full object-cover"
          src="/avatar.png"
        />
      </div>
      <div
        className={`transition-opacity duration-300 overflow-hidden ${
          isOpen ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
        }`}
      >
        <p className="text-xs font-bold text-hyperion-cream whitespace-nowrap leading-none">
          {name}
        </p>
        <a
          href="/settings"
          onClick={onClose}
          className="text-[10px] text-hyperion-sage-mint/70 hover:text-hyperion-sage-mint whitespace-nowrap uppercase tracking-widest mt-1 hover:underline decoration-hyperion-sage-mint/40 hover:decoration-hyperion-sage-mint transition-colors duration-200"
        >
          {t("nav.goToSettings")}
        </a>
      </div>
    </div>
  );
};

export default NavProfile;
