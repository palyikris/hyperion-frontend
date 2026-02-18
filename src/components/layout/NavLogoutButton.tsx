import React from "react";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";

interface NavLogoutButtonProps {
  isOpen: boolean;
  onLogout: () => Promise<void>;
}

const NavLogoutButton: React.FC<NavLogoutButtonProps> = ({
  isOpen,
  onLogout,
}) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onLogout}
      className="cursor-pointer flex items-center gap-4 p-3 rounded-xl transition-all w-full group/item text-hyperion-soft-sky/60 hover:text-hyperion-sage-mint hover:bg-hyperion-cream/5"
    >
      <LogOut className="min-w-[24px] w-6 h-6 shrink-0" />
      <span
        className={`transition-opacity duration-300 font-medium whitespace-nowrap ${
          isOpen ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
        }`}
      >
        {t("nav.logout")}
      </span>
    </button>
  );
};

export default NavLogoutButton;
