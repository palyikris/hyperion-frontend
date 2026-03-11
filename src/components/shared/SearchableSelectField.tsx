import type { ComponentType, ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export type SelectOption = {
  label: string;
  value: string;
};

type SearchableSelectFieldProps = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  id: string;
  options: SelectOption[];
  rightIcon?: ReactNode;
  error?: string;
  isCancellable?: boolean;
  onClear?: () => void;
  value?: string;
  onChange?: (value: string | React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SearchableSelectField = ({
  label,
  icon: Icon,
  id,
  options,
  rightIcon,
  error,
  isCancellable,
  onClear,
  value,
  onChange,
}: SearchableSelectFieldProps) => {
  const errorId = error ? `${id}-error` : undefined;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const filteredOptions = search.trim()
    ? options.filter((option) =>
        option.label.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : options;

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setFocusedIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="w-full" ref={containerRef}>
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
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={id}
          className={`peer w-full pl-12 ${isCancellable ? "pr-24" : rightIcon ? "pr-12" : "pr-12"} py-4 bg-white border-2 border-hyperion-fog-grey rounded-2xl text-hyperion-slate-grey text-left focus:border-hyperion-deep-sea focus:bg-gradient-to-br focus:from-white focus:to-hyperion-cool-aqua/5 focus:ring-0 focus:shadow-[0_8px_24px_rgba(26,95,84,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] focus:scale-[1.01] transition-all duration-300 outline-none appearance-none flex items-center`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={selectedOption ? "" : "text-hyperion-slate-grey/40"}>
            {selectedOption
              ? selectedOption.label
              : t("searchableSelect.select", "Select...")}
          </span>
          <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-hyperion-deep-sea/40 pointer-events-none" />
        </button>
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-hyperion-deep-sea/40 w-5 h-5 transition-all duration-300 peer-focus:text-hyperion-deep-sea peer-focus:scale-110 peer-focus:rotate-3 peer-focus:drop-shadow-[0_0_12px_rgba(26,95,84,0.8)] pointer-events-none" />
        {isCancellable && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-hyperion-deep-sea/40 hover:text-hyperion-deep-sea transition-all duration-300 hover:scale-110 focus:outline-none"
            tabIndex={-1}
          >
            <X className="w-5 h-5" />
            <span className="sr-only">
              {t("searchableSelect.clear", "Clear selection")}
            </span>
          </button>
        )}
        {rightIcon && !isCancellable && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-hyperion-deep-sea/40 pointer-events-none">
            {rightIcon}
          </span>
        )}
        {open && (
          <div className="absolute left-0 right-0 mt-2 z-20 bg-white border-2 border-hyperion-fog-grey rounded-2xl shadow-lg max-h-[10.5rem] overflow-y-hidden animate-fade-in">
            <div className="px-4 pt-3 pb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setFocusedIndex(0);
                }}
                placeholder={t("searchableSelect.search", "Search...")}
                className="w-full px-2 py-1 rounded bg-hyperion-fog-grey/30 text-xs text-hyperion-slate-grey focus:outline-none focus:ring-2 focus:ring-hyperion-deep-sea/30"
                autoFocus
                aria-label="Search options"
              />
            </div>
            <ul
              tabIndex={-1}
              role="listbox"
              aria-labelledby={id}
              className="max-h-[7.5rem] overflow-y-auto"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-2 text-hyperion-slate-grey/40 select-none">
                  No options found
                  {t("searchableSelect.noOptions", "No options found")}
                </li>
              ) : (
                filteredOptions.map((option, idx) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${option.value === value ? "bg-hyperion-cool-aqua/10 text-hyperion-deep-sea font-semibold" : "hover:bg-hyperion-cool-aqua/10"} ${focusedIndex === idx ? "bg-hyperion-cool-aqua/20" : ""}`}
                    onClick={() => {
                      onChange?.(option.value);
                      setOpen(false);
                      setSearch("");
                      setFocusedIndex(null);
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                  >
                    {option.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableSelectField;
