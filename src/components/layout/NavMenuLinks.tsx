import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { mainNavLinks } from "./navLinks";
import { toastService } from "../../services/toastService";

interface NavMenuLinksProps {
  isOpen: boolean;
  pathData: string;
  hoveredLink: string | null;
  onHover: (linkKey: string | null) => void;
  onClose: () => void;
}

const NavMenuLinks: React.FC<NavMenuLinksProps> = ({
  isOpen,
  pathData,
  hoveredLink,
  onHover,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navLinksWithActive = mainNavLinks.map((link) => ({
    ...link,
    isActive: pathData.startsWith(link.href),
  }));

  return (
    <nav
      className="flex shrink-0 flex-col gap-2 w-full px-4"
      onMouseLeave={() => onHover(null)}
    >
      {navLinksWithActive.map((link) => (
        <a
          key={link.labelKey}
          href={link.href}
          onClick={(event) => {
            event.preventDefault();
            onClose();
            navigate(link.href !== "/lab" ? link.href : "/vault");

            if (link.labelKey === "nav.main.lab") {
              setTimeout(() => {
                toastService.info(
                  t("nav.toast.labRedirectTitle"),
                  t("nav.toast.labRedirectMessage"),
                  5000,
                );
              }, 500);
            }
          }}
          onMouseEnter={() => onHover(link.labelKey)}
          className={`relative flex items-center gap-4 p-3 rounded-xl transition-all w-full group/item
          ${
            link.isActive
              ? "bg-hyperion-forest text-hyperion-sage-mint"
              : "text-hyperion-soft-sky/60 hover:text-hyperion-sage-mint"
          }`}
        >
          <AnimatePresence>
            {hoveredLink === link.labelKey && (
              <motion.div
                layoutId="hover-pill"
                className="absolute inset-0 bg-hyperion-cream/10 rounded-xl -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </AnimatePresence>

          <link.icon className="min-w-[24px] w-6 h-6 shrink-0" />
          <span
            className={`transition-opacity duration-300 font-medium whitespace-nowrap ${
              isOpen
                ? "opacity-100"
                : "opacity-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100"
            }`}
          >
            {t(link.labelKey)}
          </span>
        </a>
      ))}
    </nav>
  );
};

export default NavMenuLinks;
