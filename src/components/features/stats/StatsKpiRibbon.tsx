import { motion, type Variants } from "framer-motion";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { DecryptText } from "../../shared/animation/DecryptText";

type MetricItem = {
  label: string;
  value: number;
  postfix: string;
};

type StatsKpiRibbonProps = {
  metrics: MetricItem[];
  dateRangeDays: number;
  windowLabel: string;
  windowDetailLabel: string;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const StatsKpiRibbon = ({
  metrics,
  dateRangeDays,
  windowLabel,
  windowDetailLabel,
}: StatsKpiRibbonProps) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-10 grid grid-cols-12 gap-4 md:gap-6 xl:gap-10"
    >
      {metrics.map((metric) => (
        <motion.div
          layout
          key={metric.label}
          variants={itemVariants}
          className="col-span-12 sm:col-span-6 xl:col-span-2"
        >
          <div className="rounded-[30px] border border-white/45 bg-white/55 p-4 backdrop-blur-xl">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-hyperion-slate-grey/70">
              {metric.label}
            </p>
            <DecryptText
              text={String(metric.value)}
              className="text-[11px] font-semibold uppercase tracking-[0.26em] text-hyperion-deep-sea/60"
            />
            <RollingNumber
              value={metric.value}
              postfix={metric.postfix}
              className="mt-2 block text-2xl font-semibold text-hyperion-deep-sea"
            />
          </div>
        </motion.div>
      ))}
      <motion.div
        layout
        variants={itemVariants}
        className="col-span-12 xl:col-span-2"
      >
        <div className="h-full rounded-[30px] border border-white/45 bg-linear-to-br from-hyperion-deep-sea/90 to-hyperion-deep-sea p-4 text-white shadow-[0_16px_40px_rgba(10,30,27,0.25)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/65">
            {windowLabel}
          </p>
          <p className="mt-2 text-4xl font-light leading-none">{dateRangeDays}D</p>
          <p className="mt-3 text-xs leading-relaxed text-white/75">
            {windowDetailLabel}
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default StatsKpiRibbon;
export type { MetricItem };
