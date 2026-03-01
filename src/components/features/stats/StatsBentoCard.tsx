import { motion, type Variants } from "framer-motion";
import { useState, type ReactNode } from "react";

type StatsBentoCardProps = {
  title: string;
  description: string;
  className: string;
  children: ReactNode;
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const StatsBentoCard = ({
  title,
  description,
  className,
  children,
}: StatsBentoCardProps) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <motion.article
      layout
      variants={cardVariants}
      className={`relative ${className}`}
    >
      <div className="relative mb-3 flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.32em] text-hyperion-slate-grey/70">
          {title}
        </p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsInfoOpen((prev) => !prev)}
            aria-expanded={isInfoOpen}
            aria-label={`${title} info`}
            className="h-7 w-7 rounded-full border border-white/60 bg-white/60 text-xs font-bold text-hyperion-deep-sea transition-colors duration-300 hover:bg-hyperion-cool-aqua/35"
          >
            i
          </button>
          {isInfoOpen && (
            <div className="absolute right-0 top-9 z-20 w-60 rounded-2xl border border-white/60 bg-white/95 p-3 text-xs leading-relaxed text-hyperion-slate-grey shadow-lg backdrop-blur-md">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="relative">{children}</div>
    </motion.article>
  );
};

export default StatsBentoCard;
