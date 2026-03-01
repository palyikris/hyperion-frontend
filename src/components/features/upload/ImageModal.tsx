import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { DecryptText } from "../../shared/animation/DecryptText";
import { useTranslation } from "react-i18next";
import { getFullResUrl } from "../../../utils/imageUtils";

interface ImageModalProps {
  open: boolean;
  imageUrl: string;
  alt?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  open,
  imageUrl,
  alt,
  onClose,
}) => {
  const { t } = useTranslation();
  const hfBaseUrl =
    "https://huggingface.co/datasets/palyikris/hyperion-media/resolve/main";
  const fullResImageUrl = getFullResUrl(imageUrl);
  const thumbnailSrc = imageUrl ? `${hfBaseUrl}/${imageUrl}` : "";
  const fullResSrc = fullResImageUrl ? `${hfBaseUrl}/${fullResImageUrl}` : "";
  const shouldSwapToFullRes =
    Boolean(fullResImageUrl) && fullResImageUrl !== imageUrl;
  const [visionMode, setVisionMode] = useState<"standard" | "spectral">(
    "standard",
  );
  const [altitude, setAltitude] = useState(124.0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [fullResLoaded, setFullResLoaded] = useState(false);

  // 1. GIMBAL PARALLAX LOGIC
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const hudX = useSpring(
    useTransform(mouseX, [0, window.innerWidth], [-20, 20]),
    springConfig,
  );
  const hudY = useSpring(
    useTransform(mouseY, [0, window.innerHeight], [-20, 20]),
    springConfig,
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Telemetry drift
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setAltitude((prev) => prev + (Math.random() > 0.5 ? 0.04 : -0.04));
    }, 500);
    return () => clearInterval(interval);
  }, [open]);

  // Preload full resolution image while thumbnail remains visible
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      setIsImageLoading(true);
      setFullResLoaded(!shouldSwapToFullRes);
    });

    const minDelayPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 350);
    });

    const fullResPromise = new Promise<void>((resolve) => {
      if (!shouldSwapToFullRes || !fullResSrc) {
        resolve();
        return;
      }

      const fullImage = new Image();
      fullImage.src = fullResSrc;
      fullImage.onload = () => {
        if (isMounted) setFullResLoaded(true);
        resolve();
      };
      fullImage.onerror = () => {
        if (isMounted) setFullResLoaded(false);
        resolve();
      };
    });

    const thumbnailPromise = new Promise<void>((resolve) => {
      if (!thumbnailSrc) {
        resolve();
        return;
      }

      const thumbnailImage = new Image();
      thumbnailImage.src = thumbnailSrc;
      thumbnailImage.onload = () => resolve();
      thumbnailImage.onerror = () => resolve();
    });

    Promise.all([minDelayPromise, thumbnailPromise, fullResPromise]).then(
      () => {
        if (isMounted) setIsImageLoading(false);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [fullResSrc, open, shouldSwapToFullRes, thumbnailSrc]);

  useEffect(() => {
    if (!open) return;

    document.body.setAttribute("data-image-modal-open", "true");
    return () => {
      document.body.removeAttribute("data-image-modal-open");
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-3000 flex items-center justify-center bg-hyperion-deep-sea/80 backdrop-blur-2xl"
          style={{ zIndex: 3000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-[95vw] h-[85vh] max-w-7xl overflow-hidden border border-white/10 shadow-2xl"
            style={{
              borderRadius: "60px 20px 80px 30px / 30px 70px 40px 90px",
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* INTERACTIVE HUD LAYER */}
            <motion.div
              className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center"
              style={{ x: hudX, y: hudY }}
            >
              <div className="relative w-64 h-64 border-[0.5px] border-hyperion-sage-mint/30 rounded-full flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 border-t-2 border-hyperion-muted-gold"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ borderRadius: "48% 52% 44% 56% / 45% 55% 45% 55%" }}
                />
                <div className="w-2 h-2 bg-hyperion-burnt-orange rounded-full shadow-[0_0_10px_#D97B5A]" />

                <span className="absolute -top-8 text-[9px] font-mono text-hyperion-sage-mint/60">
                  {t("upload.imageModal.range", "RNG: 402m")}
                </span>
                <span className="absolute -bottom-8 text-[9px] font-mono text-hyperion-sage-mint/60">
                  {t("upload.imageModal.heading", "HDG: 184°")}
                </span>
              </div>
            </motion.div>

            {/* LEFT TELEMETRY */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 z-40 space-y-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-24 w-1 bg-white/10 relative overflow-hidden">
                  <motion.div
                    className="absolute w-full bg-hyperion-sage-mint bottom-0"
                    animate={{ height: ["40%", "60%", "35%"] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                </div>
                <span className="text-[8px] text-hyperion-cream font-bold uppercase tracking-tighter">
                  {t("upload.imageModal.pitch", "Pitch")}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-24 w-1 bg-white/10 relative overflow-hidden">
                  <motion.div
                    className="absolute w-full bg-hyperion-cool-aqua bottom-0"
                    animate={{ height: ["20%", "45%", "15%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
                <span className="text-[8px] text-hyperion-cream font-bold uppercase tracking-tighter">
                  {t("upload.imageModal.roll", "Roll")}
                </span>
              </div>
            </div>

            {/* TOP BAR */}
            <div className="absolute top-10 left-10 right-10 z-40 flex justify-between items-start">
              <div className="flex gap-10">
                <div>
                  <DecryptText
                    text={t("upload.imageModal.osName", "HYPERION_OS_AERIAL")}
                    className="text-hyperion-sage-mint text-xs font-bold tracking-[0.3em]"
                  />
                  <p className="text-[9px] text-white/30 mt-1 uppercase">
                    {t(
                      "upload.imageModal.transmission",
                      "Transmission: Stable",
                    )}
                  </p>
                </div>
                <div className="flex flex-col">
                  <span className="text-hyperion-muted-gold text-[10px] font-bold">
                    {t("upload.imageModal.power", "POWER: 88%")}
                  </span>
                  <div className="w-20 h-1 bg-white/10 mt-1">
                    <div className="w-[88%] h-full bg-hyperion-muted-gold" />
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setVisionMode((prev) =>
                    prev === "standard" ? "spectral" : "standard",
                  )
                }
                className={`px-4 py-2 border text-[10px] font-bold tracking-widest transition-all duration-500 pointer-events-auto ${
                  visionMode === "spectral"
                    ? "bg-hyperion-sage-mint text-hyperion-deep-sea border-hyperion-sage-mint"
                    : "bg-transparent text-white border-white/20 hover:border-white/50"
                }`}
                style={{ borderRadius: "12px 4px 12px 4px" }}
              >
                {visionMode === "standard"
                  ? t("upload.imageModal.enableSpectral", "ENABLE BIO-SPECTRAL")
                  : t(
                      "upload.imageModal.spectralActive",
                      "SYSTEM: SPECTRAL_ACTIVE",
                    )}
              </button>
            </div>

            {/* RIGHT TELEMETRY */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 z-40">
              <div className="text-right space-y-1">
                <p className="text-[10px] text-hyperion-cream font-bold">
                  {t("upload.imageModal.altitude", "ALTITUDE")}
                </p>
                <p className="text-2xl font-mono text-hyperion-muted-gold font-bold">
                  {altitude.toFixed(2)}m
                </p>
              </div>
            </div>

            {/* MAIN IMAGE CONTENT AREA */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Biotech Loader Overlay */}
              <AnimatePresence>
                {isImageLoading && (
                  <motion.div
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-hyperion-deep-sea space-y-4"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <motion.div
                      className="w-24 h-24 border-2 border-dashed border-hyperion-sage-mint/40 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <DecryptText
                      text="ESTABLISHING_LINK..."
                      className="text-hyperion-sage-mint font-bold text-xs tracking-[0.5em]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="w-full h-full"
                animate={{
                  scale: visionMode === "spectral" ? 1.02 : 1.05,
                  filter:
                    visionMode === "spectral"
                      ? "contrast(1.5) brightness(0.8) hue-rotate(140deg) saturate(1.5)"
                      : "contrast(1.1) brightness(1)",
                  opacity: isImageLoading ? 0 : 1,
                }}
                transition={{ duration: 1 }}
              >
                <img
                  src={thumbnailSrc}
                  alt={alt}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${fullResLoaded ? "opacity-0" : "opacity-100"}`}
                  style={{
                    filter: fullResLoaded ? "none" : "blur(12px)",
                    transform: fullResLoaded ? "scale(1)" : "scale(1.03)",
                  }}
                />
                {shouldSwapToFullRes ? (
                  <img
                    src={fullResSrc}
                    alt={alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${fullResLoaded ? "opacity-100" : "opacity-0"}`}
                  />
                ) : (
                  <img
                    src={thumbnailSrc}
                    alt={alt}
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                  />
                )}
                <AnimatePresence>
                  {visionMode === "spectral" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-30"
                      style={{
                        background:
                          "radial-gradient(circle, transparent 20%, var(--color-hyperion-deep-sea) 100%)",
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ABORT FEED BUTTON */}
            <button
              onClick={onClose}
              className="absolute bottom-10 right-10 z-50 group flex items-center gap-4 bg-hyperion-burnt-orange text-white px-8 py-4 rounded-full font-bold text-[11px] tracking-widest pointer-events-auto shadow-2xl"
              style={{ borderRadius: "40px 10px 40px 10px" }}
            >
              {t("upload.imageModal.terminateLink", "TERMINATE_LINK")}
              <div className="w-6 h-6 border border-white/30 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-hyperion-burnt-orange transition-all">
                ×
              </div>
            </button>

            {/* Post-Process Effects */}
            <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_200px_rgba(0,0,0,0.6)]" />
            <div
              className="absolute inset-0 pointer-events-none z-30 opacity-[0.03]"
              style={{
                backgroundImage:
                  'url("https://grainy-gradients.vercel.app/noise.svg")',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
