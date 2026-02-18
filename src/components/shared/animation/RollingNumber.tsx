import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  motion,
  useTransform,
} from "framer-motion";

type RollingNumberProps = {
  value: number;
  className?: string;
  style?: CSSProperties;
  prefix?: string;
  postfix?: string;
};

export const RollingNumber = ({
  value,
  className,
  style,
  prefix,
  postfix,
}: RollingNumberProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 30 });
  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest).toLocaleString(),
  );

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  return (
    <motion.span ref={ref} style={style} className={className}>
      {prefix}
      <motion.span style={{ display: "inline" }}>{displayValue}</motion.span>
      {postfix}
    </motion.span>
  );
};
