import React from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import NavLogo from "./NavLogo";
import NavMenuLinks from "./NavMenuLinks";
import NavLogoutButton from "./NavLogoutButton";
import NavProfile from "./NavProfile";

const SideNav = () => {
  const { t } = useTranslation();
  const { logout, isLoggingOut } = useAuth();
  const clipPathId = React.useId();
  const pathData = useLocation().pathname;
  const [isOpen, setIsOpen] = React.useState(false);
  const navigationRef = React.useRef<HTMLElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const toggle = toggleRef.current;
    document.body.style.overflow = "hidden";
    navigationRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key !== "Tab") return;
      const controls = navigationRef.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
      toggle?.focus();
    };
  }, [isOpen]);

  const wavyStyle = {
    clipPath: `url(#${clipPathId})`,
    WebkitClipPath: `url(#${clipPathId})`,
    transition: "all 0.3s ease-in-out",
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={handleToggle}
        aria-label={t("nav.openMenu")}
        aria-expanded={isOpen}
        aria-controls="main-navigation"
        className="sidenav-mobile-toggle md:hidden fixed left-4 top-4 z-1500 flex h-11 w-11 items-center justify-center rounded-full bg-hyperion-deep-sea text-hyperion-cream shadow-xl"
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
          className="md:hidden fixed inset-0 z-1500 bg-black/40"
        />
      )}

      <aside
        ref={navigationRef}
        className={`group/sidebar fixed left-0 top-0 h-dvh bg-hyperion-deep-sea wavy-edge z-2000 flex flex-col items-start py-6 shadow-2xl transition-all duration-300 ease-in-out overflow-x-hidden overflow-y-auto overscroll-contain
          w-[min(18rem,calc(100%-2rem))] md:w-20 md:hover:w-72 md:focus-within:w-72
          ${isOpen ? "visible translate-x-0" : "invisible -translate-x-full md:visible md:translate-x-0"}`}
        id="main-navigation"
        aria-label={t("nav.openMenu")}
        style={wavyStyle}
      >
        <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
              <path d="M0,0 L0.82,0 C0.98,0.06 1.02,0.18 0.96,0.26 C0.9,0.34 1.04,0.44 0.98,0.52 C0.92,0.6 1.04,0.7 0.98,0.78 C0.92,0.86 1.02,0.96 0.88,1 L0,1 Z" />
            </clipPath>
          </defs>
        </svg>

        <button type="button" onClick={handleClose} aria-label={t("nav.closeMenu")}
          className="absolute right-8 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full text-hyperion-cream hover:bg-white/10 md:hidden">
          <X size={20} />
        </button>
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
        <div className="mt-auto flex shrink-0 flex-col gap-3 w-full pl-4 pr-12 pt-6 md:pr-4 md:group-hover/sidebar:pr-12 md:group-focus-within/sidebar:pr-12">
          <NavLogoutButton
            isOpen={isOpen}
            onLogout={() => logout()}
            disabled={isLoggingOut}
          />

          {/* Profile Section */}
          <NavProfile isOpen={isOpen} onClose={handleClose} />
        </div>
      </aside>
    </>
  );
};

export default SideNav;
