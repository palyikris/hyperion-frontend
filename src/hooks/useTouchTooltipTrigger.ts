import { useEffect, useState } from "react";

type TooltipTrigger = "hover" | "click";

export const useTouchTooltipTrigger = (): TooltipTrigger => {
  const [isTouchLike, setIsTouchLike] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const evaluate = () => {
      setIsTouchLike(mediaQuery.matches || navigator.maxTouchPoints > 0);
    };

    evaluate();
    mediaQuery.addEventListener("change", evaluate);

    return () => {
      mediaQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return isTouchLike ? "click" : "hover";
};
