import { DecryptText } from "./animation/DecryptText";

type TitleProps = {
  text: string;
  colorFrom?: ColorOption;
  colorVia?: ColorOption;
  colorTo?: ColorOption;
  size: SizeOption;
  className?: string;
};

type SizeOption =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl";

type ColorOption =
  | "hyperion-forest"
  | "hyperion-deep-sea"
  | "hyperion-sage-mint"
  | "hyperion-cool-aqua"
  | "hyperion-soft-sky"
  | "hyperion-muted-gold"
  | "hyperion-burnt-orange"
  | "hyperion-cream"
  | "hyperion-fog-grey"
  | "hyperion-slate-grey";

const sizeClasses: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
  "7xl": "text-7xl",
  "8xl": "text-8xl",
  "9xl": "text-9xl",
};

const gradientColorClasses: Record<string, string> = {
  "hyperion-forest": "from-hyperion-forest",
  "hyperion-deep-sea": "from-hyperion-deep-sea",
  "hyperion-sage-mint": "from-hyperion-sage-mint",
  "hyperion-cool-aqua": "from-hyperion-cool-aqua",
  "hyperion-soft-sky": "from-hyperion-soft-sky",
  "hyperion-muted-gold": "from-hyperion-muted-gold",
  "hyperion-burnt-orange": "from-hyperion-burnt-orange",
  "hyperion-cream": "from-hyperion-cream",
  "hyperion-fog-grey": "from-hyperion-fog-grey",
  "hyperion-slate-grey": "from-hyperion-slate-grey",
};

const gradientViaColorClasses: Record<string, string> = {
  "hyperion-forest": "via-hyperion-forest",
  "hyperion-deep-sea": "via-hyperion-deep-sea",
  "hyperion-sage-mint": "via-hyperion-sage-mint",
  "hyperion-cool-aqua": "via-hyperion-cool-aqua",
  "hyperion-soft-sky": "via-hyperion-soft-sky",
  "hyperion-muted-gold": "via-hyperion-muted-gold",
  "hyperion-burnt-orange": "via-hyperion-burnt-orange",
  "hyperion-cream": "via-hyperion-cream",
  "hyperion-fog-grey": "via-hyperion-fog-grey",
  "hyperion-slate-grey": "via-hyperion-slate-grey",
};

const gradientToColorClasses: Record<string, string> = {
  "hyperion-forest": "to-hyperion-forest",
  "hyperion-deep-sea": "to-hyperion-deep-sea",
  "hyperion-sage-mint": "to-hyperion-sage-mint",
  "hyperion-cool-aqua": "to-hyperion-cool-aqua",
  "hyperion-soft-sky": "to-hyperion-soft-sky",
  "hyperion-muted-gold": "to-hyperion-muted-gold",
  "hyperion-burnt-orange": "to-hyperion-burnt-orange",
  "hyperion-cream": "to-hyperion-cream",
  "hyperion-fog-grey": "to-hyperion-fog-grey",
  "hyperion-slate-grey": "to-hyperion-slate-grey",
};

export const Title = ({
  text,
  colorFrom,
  colorVia,
  colorTo,
  size,
  className,
}: TitleProps) => {
  const sizeClass = sizeClasses[size] ?? "text-5xl";
  const fromClass =
    gradientColorClasses[colorFrom || ""] ?? "from-hyperion-forest";
  const viaClass =
    gradientViaColorClasses[colorVia || ""] ?? "via-hyperion-deep-sea";
  const toClass =
    gradientToColorClasses[colorTo || ""] ?? "to-hyperion-cool-aqua";

  return (
    <DecryptText
      className={`relative ${sizeClass} font-extrabold uppercase tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-br ${fromClass} ${viaClass} ${toClass} drop-shadow-[0_6px_14px_rgba(18,70,62,0.25)] ${className ?? ""}`}
      text={text}
    ></DecryptText>
  );
};
