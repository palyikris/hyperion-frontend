import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  defaultMonth?: string;
  range?: { start: string; end: string };
  className?: string;
  calendarClassName?: string;
}

// Calendar dates stay at local noon; converting them to UTC can change the day.
function calendarDate(year: number, month: number, day: number) {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(12, 0, 0, 0);
  return date;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return calendarDate(year, month - 1, day);
}

function dateValue(date: Date) {
  return [date.getFullYear().toString().padStart(4, "0"),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0")].join("-");
}

function moveMonth(date: Date, offset: number) {
  const first = calendarDate(date.getFullYear(), date.getMonth() + offset, 1);
  const last = calendarDate(first.getFullYear(), first.getMonth() + 1, 0);
  return calendarDate(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), last.getDate()));
}

const focusStyle = "outline-none focus-visible:ring-2 focus-visible:ring-hyperion-deep-sea focus-visible:ring-offset-2";

interface CalendarProps {
  value: string;
  defaultMonth?: string;
  range?: DatePickerProps["range"];
  locale: string;
  id: string;
  label: string;
  onSelect: (value: string) => void;
  className?: string;
}

function Calendar({ value, defaultMonth, range, locale, id, label, onSelect, className = "" }: CalendarProps) {
  const { t } = useTranslation();
  const [focusedDate, setFocusedDate] = useState(() => {
    const initialDate = value || defaultMonth;
    return initialDate ? parseDate(initialDate) : new Date();
  });
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const calendar = useRef<HTMLDivElement>(null);
  const focusDay = useRef(true);
  const year = focusedDate.getFullYear();
  const month = focusedDate.getMonth();
  const focusedValue = dateValue(focusedDate);
  const today = dateValue(new Date());
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "long" });
  const fullFormat = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const heading = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(focusedDate);
  const first = calendarDate(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, index) => calendarDate(year, month, index - offset + 1));
  const yearStart = Math.floor((year - 1) / 12) * 12 + 1;

  useEffect(() => {
    if (view === "days" && focusDay.current) {
      calendar.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedValue}"]`)?.focus();
      focusDay.current = false;
    }
  }, [focusedValue, view]);

  const navigate = (direction: number) => {
    const next = moveMonth(focusedDate, direction * (view === "years" ? 144 : view === "months" ? 12 : 1));
    if (next.getFullYear() >= 1 && next.getFullYear() <= 9999) setFocusedDate(next);
  };

  const handleDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    let next: Date;
    const dayOfWeek = (date.getDay() + 6) % 7;
    switch (event.key) {
      case "ArrowLeft": next = calendarDate(year, month, date.getDate() - 1); break;
      case "ArrowRight": next = calendarDate(year, month, date.getDate() + 1); break;
      case "ArrowUp": next = calendarDate(year, month, date.getDate() - 7); break;
      case "ArrowDown": next = calendarDate(year, month, date.getDate() + 7); break;
      case "Home": next = calendarDate(year, month, date.getDate() - dayOfWeek); break;
      case "End": next = calendarDate(year, month, date.getDate() + 6 - dayOfWeek); break;
      case "PageUp": next = moveMonth(date, event.shiftKey ? -12 : -1); break;
      case "PageDown": next = moveMonth(date, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    if (next.getFullYear() < 1 || next.getFullYear() > 9999) return;
    focusDay.current = true;
    setFocusedDate(next);
  };

  const navLabel = (direction: "previous" | "next") => {
    if (view === "years") return direction === "previous"
      ? t("datePicker.previousYears", "Previous years") : t("datePicker.nextYears", "Next years");
    if (view === "months") return direction === "previous"
      ? t("datePicker.previousYear", "Previous year") : t("datePicker.nextYear", "Next year");
    return direction === "previous"
      ? t("datePicker.previousMonth", "Previous month") : t("datePicker.nextMonth", "Next month");
  };

  return (
    <div
      ref={calendar}
      id={id}
      role="dialog"
      aria-label={t("datePicker.calendarFor", "Calendar for {{label}}", { label })}
      className={`mt-2 overflow-hidden rounded-3xl border border-hyperion-sage-mint/50 bg-white p-3 shadow-[0_8px_24px_rgba(26,95,84,0.08)] sm:p-4 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-1 rounded-2xl bg-hyperion-soft-sky/40 p-1">
        <button
          type="button" aria-label={navLabel("previous")} onClick={() => navigate(-1)}
          disabled={view === "years" ? yearStart === 1 : view === "months" ? year === 1 : year === 1 && month === 0}
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-hyperion-deep-sea transition-colors hover:bg-white disabled:opacity-30 ${focusStyle}`}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className="flex min-w-0 items-center justify-center gap-1">
          {view !== "years" ? (
            <button
              type="button" aria-label={t("datePicker.chooseMonth", "Choose month")}
              onClick={() => setView(view === "months" ? "days" : "months")}
              className={`rounded-lg px-2 py-1.5 text-sm font-bold capitalize text-hyperion-deep-sea hover:bg-white ${focusStyle}`}
            >
              {monthFormat.format(focusedDate)}
            </button>
          ) : null}
          <button
            type="button" aria-label={t("datePicker.chooseYear", "Choose year")}
            onClick={() => { focusDay.current = true; setView(view === "years" ? "days" : "years"); }}
            className={`rounded-lg px-2 py-1.5 text-sm font-bold tabular-nums text-hyperion-deep-sea hover:bg-white ${focusStyle}`}
          >
            {view === "years" ? `${yearStart} – ${Math.min(yearStart + 11, 9999)}` : year}
          </button>
        </div>
        <button
          type="button" aria-label={navLabel("next")} onClick={() => navigate(1)}
          disabled={view === "years" ? yearStart + 12 > 9999 : view === "months" ? year === 9999 : year === 9999 && month === 11}
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-hyperion-deep-sea transition-colors hover:bg-white disabled:opacity-30 ${focusStyle}`}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p id={`${id}-heading`} aria-live="polite" className="sr-only">{heading}</p>
      <p id={`${id}-help`} className="sr-only">
        {t("datePicker.keyboardHelp", "Use arrow keys to move by day or week, Page Up and Page Down to change month, and Enter to select. Escape closes the calendar.")}
      </p>
      {view === "days" ? (
        <table role="grid" aria-labelledby={`${id}-heading`} aria-describedby={`${id}-help`} className="w-full table-fixed border-separate border-spacing-y-1 text-center">
          <thead>
            <tr>
              {Array.from({ length: 7 }, (_, index) => {
                const weekday = calendarDate(2026, 0, 5 + index);
                return (
                  <th key={index} scope="col" aria-label={new Intl.DateTimeFormat(locale, { weekday: "long" }).format(weekday)} className="pb-1 text-[10px] font-bold uppercase tracking-wide text-hyperion-slate-grey/70">
                    {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(weekday)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, week) => (
              <tr key={week}>
                {days.slice(week * 7, week * 7 + 7).map(date => {
                  const iso = dateValue(date);
                  const selected = iso === value;
                  const inRange = range?.start && range.end && iso >= range.start && iso <= range.end;
                  return (
                    <td key={iso} aria-selected={selected} className="p-0.5">
                      <button
                        type="button" data-date={iso} aria-label={fullFormat.format(date)}
                        aria-current={iso === today ? "date" : undefined}
                        tabIndex={iso === focusedValue ? 0 : -1}
                        disabled={date.getFullYear() < 1 || date.getFullYear() > 9999}
                        onKeyDown={event => handleDayKeyDown(event, date)}
                        onClick={() => onSelect(iso)}
                        className={`relative flex h-8 w-full items-center justify-center rounded-xl text-sm tabular-nums transition-colors sm:h-9 ${focusStyle} ${selected
                          ? "bg-hyperion-deep-sea text-white shadow-sm"
                          : inRange ? "bg-hyperion-soft-sky/70 text-hyperion-deep-sea hover:bg-hyperion-sage-mint/50"
                          : date.getMonth() === month ? "text-hyperion-deep-sea hover:bg-hyperion-soft-sky/60"
                          : "text-hyperion-slate-grey/40 hover:bg-hyperion-soft-sky/40"}`}
                      >
                        {date.getDate()}
                        {iso === today ? <span aria-hidden="true" className={`absolute bottom-1 size-1 rounded-full ${selected ? "bg-white" : "bg-hyperion-deep-sea"}`} /> : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div role="group" aria-label={view === "months" ? t("datePicker.chooseMonth", "Choose month") : t("datePicker.chooseYear", "Choose year")} className="grid grid-cols-3 gap-2 py-2">
          {Array.from({ length: 12 }, (_, index) => {
            const optionYear = view === "years" ? yearStart + index : year;
            const optionMonth = view === "months" ? index : month;
            const active = view === "months" ? month === index : year === optionYear;
            return (
              <button
                key={index} type="button" disabled={optionYear > 9999}
                autoFocus={active} aria-pressed={active}
                onClick={() => {
                  setFocusedDate(calendarDate(optionYear, optionMonth, 1));
                  focusDay.current = true;
                  setView(view === "months" ? "days" : "months");
                }}
                className={`min-h-11 rounded-xl px-1 py-3 text-sm capitalize transition-colors disabled:opacity-30 ${focusStyle} ${active ? "bg-hyperion-deep-sea text-white" : "bg-hyperion-cream text-hyperion-deep-sea hover:bg-hyperion-soft-sky/60"}`}
              >
                {view === "years" ? optionYear : new Intl.DateTimeFormat(locale, { month: "short" }).format(calendarDate(year, index, 1))}
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t border-hyperion-fog-grey/70 pt-2">
        <button type="button" onClick={() => onSelect(today)} className={`rounded-lg px-3 py-2 text-xs font-bold text-hyperion-deep-sea hover:bg-hyperion-soft-sky/50 ${focusStyle}`}>
          {t("datePicker.today", "Today")}
        </button>
        <button type="button" disabled={!value} onClick={() => onSelect("")} className={`rounded-lg px-3 py-2 text-xs text-hyperion-slate-grey hover:bg-hyperion-cream disabled:opacity-40 ${focusStyle}`}>
          {t("datePicker.clear", "Clear date")}
        </button>
      </div>
    </div>
  );
}

export default function DatePicker({ label, value, onChange, open, onOpenChange, disabled, invalid, describedBy, defaultMonth, range, className, calendarClassName }: DatePickerProps) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const tabbing = useRef(false);
  const locale = (i18n.resolvedLanguage ?? i18n.language ?? "en").startsWith("hu") ? "hu-HU" : "en-GB";
  const expanded = open && !disabled;
  const formatted = value ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(parseDate(value)) : t("datePicker.placeholder", "Select a date");

  useEffect(() => {
    if (!expanded) return;
    // Wait until the click target is resolved before collapsing the inline panel.
    // Collapsing on pointerdown can move that target under the modal's backdrop.
    const dismiss = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) {
        trigger.current?.focus();
        onOpenChange(false);
      }
    };
    document.addEventListener("click", dismiss, true);
    return () => document.removeEventListener("click", dismiss, true);
  }, [expanded, onOpenChange]);

  return (
    <div
      ref={container}
      className={className}
      onBlur={event => {
        if (!tabbing.current) return;
        tabbing.current = false;
        if (!event.currentTarget.contains(event.relatedTarget)) onOpenChange(false);
      }}
      onKeyDown={event => {
        if (event.key === "Tab") tabbing.current = true;
        if (event.key === "Escape" && expanded) {
          event.stopPropagation();
          onOpenChange(false);
          trigger.current?.focus();
        }
      }}
    >
      <div className="min-w-0">
        <label id={`${id}-label`} htmlFor={id} className="mb-2 ml-2 block text-xs font-bold uppercase tracking-widest text-hyperion-slate-grey/60">{label}</label>
        <button
          ref={trigger} type="button" id={id} disabled={disabled}
          aria-labelledby={`${id}-label`} aria-describedby={[`${id}-value`, describedBy].filter(Boolean).join(" ")}
          aria-haspopup="dialog" aria-expanded={expanded} aria-controls={expanded ? `${id}-calendar` : undefined}
          aria-invalid={invalid || undefined}
          onClick={() => onOpenChange(!expanded)}
          className={`flex min-h-13 w-full items-center gap-2 rounded-2xl border-2 bg-white px-3 py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusStyle} ${invalid ? "border-hyperion-burnt-orange" : expanded ? "border-hyperion-deep-sea bg-hyperion-soft-sky/10 shadow-[0_8px_24px_rgba(26,95,84,0.08)]" : "border-hyperion-fog-grey hover:border-hyperion-sage-mint"}`}
        >
          <CalendarDays size={18} aria-hidden="true" className={`shrink-0 ${expanded ? "text-hyperion-deep-sea" : "text-hyperion-deep-sea/40"}`} />
          <span id={`${id}-value`} className={`min-w-0 flex-1 text-[13px] leading-5 ${value ? "text-hyperion-deep-sea" : "text-hyperion-slate-grey/50"}`}>{formatted}</span>
          <ChevronDown size={14} aria-hidden="true" className={`hidden shrink-0 text-hyperion-deep-sea/50 transition-transform sm:block ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
      {expanded ? (
        <Calendar
          id={`${id}-calendar`} label={label} locale={locale} value={value}
          defaultMonth={defaultMonth} range={range} className={calendarClassName}
          onSelect={next => { onChange(next); onOpenChange(false); trigger.current?.focus(); }}
        />
      ) : null}
    </div>
  );
}
