import type {
  ComponentType,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  id: string;
  options: SelectOption[];
  rightIcon?: ReactNode;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
  error?: string;
};

export const SelectField = ({
  label,
  icon: Icon,
  id,
  options,
  rightIcon,
  selectProps,
  error,
}: SelectFieldProps) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 ml-2">
        <label
          className="block text-xs font-bold text-hyperion-slate-grey/60 uppercase tracking-widest"
          htmlFor={id}
        >
          {label}
        </label>
        {error && (
          <p
            id={errorId}
            className="mt-1 ml-2 text-sm font-medium text-hyperion-burnt-orange"
          >
            {error}
          </p>
        )}
      </div>
      <div className="relative">
        <select
          className="peer w-full pl-12 pr-12 py-4 bg-white border-2 border-hyperion-fog-grey rounded-2xl text-hyperion-slate-grey focus:border-hyperion-deep-sea focus:bg-gradient-to-br focus:from-white focus:to-hyperion-cool-aqua/5 focus:ring-0 focus:shadow-[0_8px_24px_rgba(26,95,84,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] focus:scale-[1.01] transition-all duration-300 outline-none appearance-none"
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          {...selectProps}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-hyperion-deep-sea/40 w-5 h-5 transition-all duration-300 peer-focus:text-hyperion-deep-sea peer-focus:scale-110 peer-focus:rotate-3 peer-focus:drop-shadow-[0_0_12px_rgba(26,95,84,0.8)] pointer-events-none" />
        {rightIcon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-hyperion-deep-sea/40 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
};

export default SelectField;
