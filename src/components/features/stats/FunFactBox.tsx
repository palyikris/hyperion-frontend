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
      className="group relative overflow-hidden rounded-3xl border border-white/60 bg-linear-to-br from-white/95 to-white/85 p-6 shadow-[0_8px_30px_rgba(26,95,84,0.12)] backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(26,95,84,0.2)]"
    >
      <div className="relative z-10 flex items-start gap-4">
        <div className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-hyperion-deep-sea to-hyperion-cool-aqua shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-hyperion-slate-grey/80">
            {funFact?.title}
          </h3>
          <p className="mt-2 text-base leading-relaxed text-hyperion-deep-sea">
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
