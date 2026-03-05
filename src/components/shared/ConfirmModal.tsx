import React, { type ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  icon?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

const ConfirmModal = ({
  isOpen,
  title,
  description,
  icon,
  onConfirm,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
}: ConfirmModalProps) => {

  const [loading, setLoading] = React.useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 overflow-hidden"
            style={{
              borderRadius: "36px 64px 40px 72px / 52px 34px 60px 44px",
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
          >
            {/* Decorative backgrounds */}
            <div className="pointer-events-none absolute -top-8 right-8 h-16 w-16 bg-hyperion-soft-sky/40 rounded-full" />
            <div className="pointer-events-none absolute -bottom-6 left-6 h-12 w-12 bg-hyperion-sage-mint/40 rounded-full" />

            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-hyperion-fog-grey/20 rounded-full transition-colors"
              aria-label="Close modal"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} className="text-hyperion-slate-grey" />
            </motion.button>

            {/* Content */}
            <motion.div
              className="relative z-10 space-y-6 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {icon && (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                  }}
                >
                  <div
                    className={`p-4 rounded-full ${
                      isDangerous
                        ? "bg-hyperion-burnt-orange/20"
                        : "bg-hyperion-cool-aqua/20"
                    }`}
                  >
                    <div
                      className={`${
                        isDangerous
                          ? "text-hyperion-burnt-orange"
                          : "text-hyperion-cool-aqua"
                      }`}
                    >
                      {icon}
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-hyperion-deep-sea text-center">
                  {title}
                </h2>
                <p className="text-hyperion-slate-grey text-center leading-relaxed">
                  {description}
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex gap-3 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-hyperion-fog-grey text-hyperion-deep-sea font-semibold hover:bg-hyperion-fog-grey/30 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    setLoading(true);
                    onConfirm();
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-colors ${
                    isDangerous
                      ? "bg-hyperion-burnt-orange hover:bg-hyperion-burnt-orange/90"
                      : "bg-hyperion-deep-sea hover:bg-hyperion-deep-sea/90"
                  }`}
                >
                  {loading ? confirmText + "..." : confirmText}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
