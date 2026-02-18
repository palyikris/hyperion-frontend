import { useTranslation } from "react-i18next";
import { mainNavLinks, utilityLinks } from "../../layout/navLinks";
import { MorphBox } from "../../shared/animation/MorphBox";
import { useNavigate } from "react-router-dom";

const tileStyles =
  "group relative flex flex-col items-center justify-center gap-3 border p-4 py-12 text-center shadow-[rgba(26,95,84,0.18)_0px_16px_40px] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[rgba(26,95,84,0.28)_0px_26px_60px] cursor-pointer";

const iconWrapStyles =
  "flex h-12 w-12 items-center justify-center rounded-2xl bg-hyperion-deep-sea/15 text-hyperion-deep-sea transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-hyperion-forest/30";

const tilePalette = [
  {
    bg: "bg-hyperion-soft-sky/50",
    border: "border-hyperion-forest/45",
    accent: "bg-hyperion-deep-sea/35",
    radius: "34% 66% 58% 42% / 44% 34% 66% 56%",
  },
  {
    bg: "bg-hyperion-muted-gold/35",
    border: "border-hyperion-muted-gold/60",
    accent: "bg-hyperion-burnt-orange/35",
    radius: "62% 38% 42% 58% / 36% 62% 38% 64%",
  },
  {
    bg: "bg-hyperion-cool-aqua/45",
    border: "border-hyperion-cool-aqua/60",
    accent: "bg-hyperion-soft-sky",
    radius: "48% 52% 62% 38% / 52% 38% 62% 48%",
  },
  {
    bg: "bg-hyperion-burnt-orange/30",
    border: "border-hyperion-muted-gold/55",
    accent: "bg-hyperion-muted-gold/40",
    radius: "64% 36% 54% 46% / 54% 46% 54% 46%",
  },
  {
    bg: "bg-hyperion-burnt-orange/25",
    border: "border-hyperion-burnt-orange/55",
    accent: "bg-hyperion-muted-gold/35",
    radius: "58% 42% 36% 64% / 48% 62% 38% 52%",
  },
  {
    bg: "bg-hyperion-soft-sky/45",
    border: "border-hyperion-deep-sea/35",
    accent: "bg-hyperion-deep-sea/30",
    radius: "40% 60% 52% 48% / 60% 40% 60% 40%",
  },
];

const NavigatorSection = () => {
  const { t } = useTranslation();
  const tiles = [...mainNavLinks, ...utilityLinks].slice(0, 6);
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    navigate(href);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          {t("dashboard.navigator.title")}
        </span>
        <span className="h-px flex-1 bg-hyperion-fog-grey/70" />
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {tiles.map((link, index) => {
          const palette = tilePalette[index % tilePalette.length];

          return (
            <MorphBox
              key={link.href}
              className={`${tileStyles} relative ${palette.bg} ${palette.border} z-10`}
              blobShape={palette.radius}
              hoverShape="12px"
              onClick={() => handleClick(link.href)}
            >
              <span className={iconWrapStyles}>
                <link.icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-bold text-hyperion-forest transition-transform duration-500 ease-out group-hover:translate-y-0.5">
                {t(link.labelKey)}
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-hyperion-slate-grey/70 transition-opacity duration-500 ease-out group-hover:opacity-90">
                {t("dashboard.navigator.actionTile")}
              </span>
            </MorphBox>
          );
        })}
      </div>
    </section>
  );
};

export default NavigatorSection;
