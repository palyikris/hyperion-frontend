import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

type StatsBentoCardProps = {
  id: string;
  title?: string;
  description?: string;
  className: string;
  children: ReactNode;
};

const StatsBentoCard = ({
  id,
  title,
  description,
  className,
  children,
}: StatsBentoCardProps) => {
  const { t } = useTranslation();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <article id={id} className={`stats-card ${title ? "stats-data-card" : ""} relative min-w-0 [overflow-wrap:anywhere] ${className}`}>
      {title && (
        <div className="relative mb-3 flex items-start justify-between gap-3">
          <h2 className="stats-card-title self-center text-base font-bold text-hyperion-deep-sea sm:text-xs sm:uppercase sm:tracking-[0.22em] sm:text-hyperion-slate-grey/70">
            {title}
          </h2>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsInfoOpen((prev) => !prev)}
              aria-expanded={isInfoOpen}
              aria-controls={`${id}-info`}
              aria-label={`${title} ${t("stats.shared.info")}`}
              className="min-h-11 min-w-11 shrink-0 rounded-xl bg-hyperion-deep-sea/5 text-sm font-bold text-hyperion-deep-sea transition-colors duration-300 hover:bg-hyperion-cool-aqua/35"
            >
              i
            </button>
            {isInfoOpen ? (
              <AnimatePresence>
                {isInfoOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    id={`${id}-info`}
                    className="absolute right-0 top-12 z-20 w-[min(18rem,calc(100vw-4rem))] rounded-2xl border border-hyperion-deep-sea/20 bg-white p-4 text-xs leading-relaxed text-hyperion-slate-grey shadow-lg"
                  >
                    {description}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : null}
          </div>
        </div>
      )}
      <div className="relative min-w-0">{children}</div>
    </article>
  );
};

export default StatsBentoCard;
