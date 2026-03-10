import { motion, useInView } from "framer-motion";
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
    if (!isInView) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((_, index) => {
            if (index < iteration) return text[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join(""),
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, text]);

  return (
    <MotionTag ref={ref} className={className} style={style}>
      {displayText}
    </MotionTag>
  );
};
