import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { toastService } from "../../services/toastService";
import NavLogo from "./NavLogo";
import NavMenuLinks from "./NavMenuLinks";
import NavLogoutButton from "./NavLogoutButton";
import NavProfile from "./NavProfile";

const SideNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clipPathId = React.useId();
  const pathData = useLocation().pathname;
  const [isOpen, setIsOpen] = React.useState(false);

  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toastService.success(
        t("auth.toast.logoutSuccessTitle"),
        t("auth.toast.logoutSuccessMessage"),
      );
      localStorage.removeItem("user");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Logout failed", err);
      toastService.error(
        t("auth.toast.logoutErrorTitle"),
        t("auth.toast.logoutErrorMessage"),
      );
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const wavyStyle = {
    clipPath: `url(#${clipPathId})`,
    WebkitClipPath: `url(#${clipPathId})`,
    transition: "all 0.3s ease-in-out",
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={t("nav.openMenu")}
        className="md:hidden fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-hyperion-deep-sea text-hyperion-cream shadow-xl"
      >
        <span className="sr-only">{t("nav.openMenu")}</span>
        <div className="flex flex-col gap-1">
          <span className="h-0.5 w-5 bg-current" />
          <span className="h-0.5 w-5 bg-current" />
          <span className="h-0.5 w-5 bg-current" />
        </div>
      </button>

      {isOpen && (
        <button
          type="button"
          onClick={handleClose}
          aria-label={t("nav.closeMenu")}
          className="md:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      <aside
        className={`group/sidebar fixed left-0 top-0 h-full bg-hyperion-deep-sea wavy-edge z-50 flex flex-col items-start py-8 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden
          w-64 md:absolute md:w-20 md:hover:w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={wavyStyle}
      >
        <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
              <path d="M0,0 L0.82,0 C0.98,0.06 1.02,0.18 0.96,0.26 C0.9,0.34 1.04,0.44 0.98,0.52 C0.92,0.6 1.04,0.7 0.98,0.78 C0.92,0.86 1.02,0.96 0.88,1 L0,1 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Logo Section */}
        <NavLogo isOpen={isOpen} />

        {/* Main Navigation */}
        <NavMenuLinks
          isOpen={isOpen}
          pathData={pathData}
          hoveredLink={hoveredLink}
          onHover={setHoveredLink}
          onClose={handleClose}
        />

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-4 w-full px-4">
          <NavLogoutButton isOpen={isOpen} onLogout={handleLogout} />

          {/* Profile Section */}
          <NavProfile isOpen={isOpen} onClose={handleClose} />
        </div>
      </aside>
    </>
  );
};

export default SideNav;
