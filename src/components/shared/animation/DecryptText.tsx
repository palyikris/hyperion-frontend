import { motion, useInView, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

export const DecryptText = ({
  text,
  className,
  style,
  as = "span",
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "span" | "div" | "p" | "h1" | "h2";
}) => {
  const [displayText, setDisplayText] = useState(text);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();

  const MotionTag =
    as === "h1"
      ? motion.h1
      : as === "h2"
        ? motion.h2
        : as === "p"
          ? motion.p
          : as === "div"
            ? motion.div
            : motion.span;

  useEffect(() => {
    if (!isInView || reducedMotion) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((character, index) => {
            if (index < iteration || character === " ") return character;
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join(""),
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, text, reducedMotion]);

  return (
    <MotionTag ref={ref} className={className} style={style}>
      {reducedMotion ? text : displayText}
    </MotionTag>
  );
};
