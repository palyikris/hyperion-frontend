import { motion } from "framer-motion";
import { Award, Compass, Cpu, Maximize, Target } from "lucide-react";
import type { FunFact } from "../../../types/stats";

type FunFactBoxProps = {
  funFact: FunFact | undefined;
  index?: number;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  maximize: Maximize,
  target: Target,
  compass: Compass,
  award: Award,
};

const FunFactBox = ({ funFact, index = 0 }: FunFactBoxProps) => {
  const Icon = iconMap[funFact?.icon || ""] || Award;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="stats-fact group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-hyperion-deep-sea/10 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300"
    >
      <div className="relative z-10 flex items-start gap-3 sm:gap-4">
        <div className="shrink-0">
          <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-hyperion-deep-sea/10">
            <Icon className="h-5 w-5 text-hyperion-deep-sea" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-hyperion-slate-grey/80 sm:uppercase sm:tracking-[0.2em]">
            {funFact?.title}
          </h3>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-hyperion-deep-sea">
            {funFact?.fact}
          </p>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br from-hyperion-sage-mint/20 to-hyperion-cool-aqua/20 blur-3xl transition-opacity duration-300 group-hover:opacity-70" />
    </motion.article>
  );
};

export default FunFactBox;
