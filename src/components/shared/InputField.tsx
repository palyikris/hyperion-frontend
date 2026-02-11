import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputFieldProps = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  id: string;
  placeholder: string;
  rightAction?: React.ReactNode;
};

export const InputField = ({
  label,
  icon: Icon,
  type,
  id,
  placeholder,
  rightAction,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 ml-2">
        <label
          className="block text-xs font-bold text-hyperion-slate-grey/60 uppercase tracking-widest"
          htmlFor={id}
        >
          {label}
        </label>
        {rightAction}
      </div>
      <div className="relative">
        <input
          className={`peer w-full pl-12 ${isPassword ? "pr-12" : "pr-6"} py-4 bg-white border-2 border-hyperion-fog-grey rounded-2xl text-hyperion-slate-grey placeholder-hyperion-fog-grey/80 focus:border-hyperion-deep-sea focus:bg-gradient-to-br focus:from-white focus:to-hyperion-cool-aqua/5 focus:ring-0 focus:shadow-[0_8px_24px_rgba(26,95,84,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] focus:scale-[1.01] transition-all duration-300 outline-none`}
          id={id}
          type={inputType}
          placeholder={placeholder}
        />
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-hyperion-deep-sea/40 w-5 h-5 transition-all duration-300 peer-focus:text-hyperion-deep-sea peer-focus:scale-110 peer-focus:rotate-3 peer-focus:drop-shadow-[0_0_12px_rgba(26,95,84,0.8)] pointer-events-none" />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-hyperion-deep-sea/40 hover:text-hyperion-deep-sea transition-all duration-300 hover:scale-110 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
