import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { mainNavLinks } from "./navLinks";
import { authService } from "../../services/authService";
import { toastService } from "../../services/toastService";

const SideNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clipPathId = React.useId();
  const pathData = useLocation().pathname;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.full_name || t("nav.userFallback");

  const navLinksWithActive = mainNavLinks.map((link) => ({
    ...link,
    isActive: link.href === pathData,
  }));

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

  const wavyStyle = {
    clipPath: `url(#${clipPathId})`,
    WebkitClipPath: `url(#${clipPathId})`,
    transition: "all 0.3s ease-in-out",
  };

  return (
    <aside
      className="group/sidebar absolute left-0 top-0 h-full w-20 hover:w-64 bg-hyperion-deep-sea wavy-edge z-50 flex flex-col items-start py-8 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden"
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
      <div className="mb-12 px-5 flex items-center gap-4 w-full">
        <img src="/logo.png" alt="" width={40} />
        <span className="text-hyperion-cream font-bold text-xl opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-tight">
          {t("nav.brand")}
        </span>
      </div>

      {/* Main Navigation - Mapped from JSON */}
      <nav className="flex flex-col gap-4 w-full px-4">
        {navLinksWithActive.map((link) => (
          <a
            key={link.labelKey}
            href={link.href}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all w-full group/item
              ${
                link.isActive
                  ? "bg-hyperion-forest text-hyperion-sage-mint"
                  : "text-hyperion-soft-sky/60 hover:text-hyperion-sage-mint hover:bg-hyperion-cream/5"
              }`}
          >
            <link.icon className="min-w-[24px] w-6 h-6 shrink-0" />
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">
              {t(link.labelKey)}
            </span>
          </a>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-4 w-full px-4">
        <button
          type="button"
          onClick={handleLogout}
          className=" cursor-pointer flex items-center gap-4 p-3 rounded-xl transition-all w-full group/item text-hyperion-soft-sky/60 hover:text-hyperion-sage-mint hover:bg-hyperion-cream/5"
        >
          <LogOut className="min-w-[24px] w-6 h-6 shrink-0" />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">
            {t("nav.logout")}
          </span>
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-4 p-1 w-full border-t border-white/5 pt-4">
          <div className="min-w-[40px] h-10 rounded-full overflow-hidden border-2 border-hyperion-burnt-orange shadow-lg shrink-0">
            <img
              alt={t("nav.userProfileAlt")}
              className="w-full h-full object-cover"
              src="/avatar.png"
            />
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 overflow-hidden">
            <p className="text-xs font-bold text-hyperion-cream whitespace-nowrap leading-none">
              {name}
            </p>
            <a
              href="/settings"
              className="text-[10px] text-hyperion-sage-mint/70 hover:text-hyperion-sage-mint whitespace-nowrap uppercase tracking-widest mt-1 hover:underline decoration-hyperion-sage-mint/40 hover:decoration-hyperion-sage-mint transition-colors duration-200"
            >
              {t("nav.goToSettings")}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
