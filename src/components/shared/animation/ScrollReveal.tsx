/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, type TargetAndTransition } from "framer-motion";
import { type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  whileHover?: TargetAndTransition;
}

export const ScrollReveal = ({
  children,
  onClick,
  delay = 0.3,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  whileHover,
}: ScrollRevealProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={whileHover}
    viewport={{ once: true, amount: 0.3 }}
    transition={{
      duration: 0.6,
      delay: delay,
      ease: [0.21, 0.47, 0.32, 0.98], // snappy easing
    }}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);
