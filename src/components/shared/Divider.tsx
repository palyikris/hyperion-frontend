type DividerProps = {
  label: string;
  leftDotClassName?: string;
  rightDotClassName?: string;
  textClassName?: string;
  className?: string;
  bgColorClassName?: string;
};

const Divider = ({
  label,
  leftDotClassName = "bg-hyperion-burnt-orange",
  rightDotClassName = "bg-hyperion-cool-aqua",
  textClassName = "text-hyperion-forest/70",
  className,
  bgColorClassName = "bg-hyperion-cream",
}: DividerProps) => {
  return (
    <div
      className={`relative flex items-center justify-center py-2 ${className || ""}`}
    >
      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-hyperion-deep-sea/60 to-transparent" />
      <div
        className={`relative flex items-center gap-4 px-4 ${bgColorClassName}`}
      >
        <span
          className={`h-2 w-2 rounded-full shadow-[0_0_12px_rgba(214,120,66,0.45)] ${leftDotClassName}`}
        />
        <span
          className={`text-xs font-semibold uppercase tracking-[0.35em] ${textClassName}`}
        >
          {label}
        </span>
        <span
          className={`h-2 w-2 rounded-full shadow-[0_0_12px_rgba(120,200,200,0.45)] ${rightDotClassName}`}
        />
      </div>
    </div>
  );
};

export default Divider;
