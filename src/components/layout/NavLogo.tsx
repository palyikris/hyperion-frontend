import React from "react";
import { useTranslation } from "react-i18next";

interface NavLogoProps {
  isOpen: boolean;
}

const NavLogo: React.FC<NavLogoProps> = ({ isOpen }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-12 px-5 flex items-center gap-4 w-full">
      <img src="/logo.png" alt="" width={40} />
      <span
        className={`text-hyperion-cream font-bold text-xl transition-opacity duration-300 whitespace-nowrap tracking-tight ${
          isOpen ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
        }`}
      >
        {t("nav.brand")}
      </span>
    </div>
  );
};

export default NavLogo;
