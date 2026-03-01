import { motion, type MotionValue } from "framer-motion";

type StatsAtmosphereProps = {
  parallaxY: MotionValue<number>;
};

const StatsAtmosphere = ({ parallaxY }: StatsAtmosphereProps) => {
  return (
    <motion.div
      style={{ y: parallaxY }}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <motion.div
        className="absolute -top-[12%] right-[2%] h-[560px] w-[560px] rounded-full bg-hyperion-soft-sky/12 blur-[120px]"
        animate={{
          x: [0, 20, -10, 0],
          y: [0, 10, -15, 0],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[12%] -left-[8%] h-[430px] w-[430px] rounded-full bg-hyperion-sage-mint/12 blur-[120px]"
        animate={{ x: [0, -25, 15, 0], y: [0, 18, -8, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[8%] right-[20%] h-[350px] w-[350px] rounded-full bg-hyperion-burnt-orange/10 blur-[120px]"
        animate={{
          x: [0, 14, -20, 0],
          y: [0, -10, 12, 0],
          scale: [1, 1.07, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[18%] left-[24%] h-[300px] w-[300px] rounded-full bg-hyperion-cool-aqua/12 blur-[120px]"
        animate={{ x: [0, 12, -10, 0], y: [0, 6, -12, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[55%] right-[45%] h-[260px] w-[260px] rounded-full bg-hyperion-deep-sea/10 blur-[120px]"
        animate={{ x: [0, -18, 8, 0], y: [0, 10, -8, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default StatsAtmosphere;
