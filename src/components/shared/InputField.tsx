import { useState } from "react";
import type { ComponentType, InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type InputFieldProps = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  type: string;
  id: string;
  placeholder: string;
  rightAction?: ReactNode;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  error?: string;
  isCancellable?: boolean;
  onClear?: () => void;
  className?: string;
};

export const InputField = ({
  label,
  icon: Icon,
  type,
  id,
  placeholder,
  rightAction,
  inputProps,
  error,
  isCancellable,
  onClear,
  className,
}: InputFieldProps) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`min-w-0 w-full ${className ?? ""}`}>
      <div className="mb-2 ml-2 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
        <label
          className="block min-w-0 [overflow-wrap:anywhere] text-xs font-bold text-hyperion-slate-grey/60 uppercase tracking-widest"
          htmlFor={id}
        >
          {label}
        </label>
        {rightAction}
        {error && (
          <p
            id={errorId}
            className="text-xs sm:text-sm font-medium text-hyperion-burnt-orange sm:ml-2"
          >
            {error}
          </p>
        )}
      </div>
      <div className="relative">
        <input
          className={`peer w-full pl-12 ${isCancellable && isPassword ? "pr-28" : isPassword || isCancellable ? "pr-16" : "pr-6"} py-4 bg-white border-2 border-hyperion-fog-grey rounded-2xl text-hyperion-slate-grey placeholder-hyperion-fog-grey/80 focus:border-hyperion-deep-sea focus:bg-gradient-to-br focus:from-white focus:to-hyperion-cool-aqua/5 focus:ring-0 focus:shadow-[0_8px_24px_rgba(26,95,84,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] focus:scale-[1.01] transition-all duration-300 outline-none`}
          id={id}
          type={inputType}
          placeholder={placeholder}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          {...inputProps}
        />
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-hyperion-deep-sea/40 w-5 h-5 transition-all duration-300 peer-focus:text-hyperion-deep-sea peer-focus:scale-110 peer-focus:rotate-3 peer-focus:drop-shadow-[0_0_12px_rgba(26,95,84,0.8)] pointer-events-none" />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? t("common.hidePassword", "Hide password") : t("common.showPassword", "Show password")}
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 flex min-h-11 min-w-11 items-center justify-center text-hyperion-deep-sea/40 hover:text-hyperion-deep-sea transition-all duration-300 hover:scale-110 focus:outline-none ${isCancellable ? "right-14" : "right-2"}`}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
        {isCancellable && (
          <button
            type="button"
            aria-label={t("common.clearField", "Clear field")}
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex min-h-11 min-w-11 items-center justify-center text-hyperion-deep-sea/40 hover:text-hyperion-deep-sea transition-all duration-300 hover:scale-110 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
