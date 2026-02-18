import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface MorphBoxProps {
  children: ReactNode;
  className?: string;
  blobShape: string;
  onClick?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const MorphBox = ({ children, className, blobShape, onClick, onDragLeave, onDragOver, onDrop }: MorphBoxProps) => {
  const standardShape = "12px";

  return (
    <motion.div
      className={className}
      initial={{ borderRadius: standardShape }}
      whileInView={{ borderRadius: blobShape }}
      transition={{
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
        delay: 0.2,
      }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </motion.div>
  );
};
