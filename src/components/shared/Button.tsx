import type { ReactNode } from "react";
import { MagneticWrapper } from "./animation/MagneticWrapper";

type ButtonProps = {
  text: string;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  animateIcon?: boolean;
  theme?: "primary" | "info" | "danger";
};

export const Button = ({
  text,
  onClick,
  className,
  icon,
  type = "button",
  disabled = false,
  animateIcon = true,
  theme = "primary",
}: ButtonProps) => {
  const themeClasses = {
    primary: "bg-hyperion-deep-sea text-white hover:bg-hyperion-deep-sea/90",
    info: "bg-hyperion-cool-aqua text-hyperion-deep-sea hover:bg-hyperion-cool-aqua/90",
    danger:
      "bg-hyperion-burnt-orange text-white hover:bg-hyperion-burnt-orange/90",
  };

  const themeClass = themeClasses[theme];
  const hoverClassName = disabled
    ? "cursor-default"
    : "hover:shadow-xl hover:shadow-hyperion-deep-sea/30 hover:-translate-y-1";

  const baseClassName =
    "w-full font-bold py-4 shadow-lg shadow-hyperion-deep-sea/20 transition-all duration-500 transform active:scale-[0.97] flex items-center justify-center space-x-3 group disabled:opacity-60 disabled:transform-none";
  const combinedClassName = `${baseClassName} ${hoverClassName} ${themeClass} ${className}`;

  return (
    <MagneticWrapper disabled={disabled}>
      <button
        className={combinedClassName}
        style={{
          borderRadius: "28px 44px 30px 48px / 40px 28px 46px 32px",
          transition: "all 0.5s ease, border-radius 0.5s ease",
        }}
        onMouseEnter={
          disabled
            ? undefined
            : (e) => {
                e.currentTarget.style.borderRadius =
                  "48px 30px 44px 28px / 32px 46px 28px 40px";
              }
        }
        onMouseLeave={
          disabled
            ? undefined
            : (e) => {
                e.currentTarget.style.borderRadius =
                  "28px 44px 30px 48px / 40px 28px 46px 32px";
              }
        }
        type={type}
        disabled={disabled}
        onClick={onClick}
      >
        {text !== "" && <span>{text}</span>}
        {icon && (
          <span
            className={
              animateIcon
                ? "transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110 group-hover:rotate-12"
                : ""
            }
          >
            {icon}
          </span>
        )}
      </button>
    </MagneticWrapper>
  );
};