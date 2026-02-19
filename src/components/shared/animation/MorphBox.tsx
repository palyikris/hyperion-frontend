import { motion } from "framer-motion";
import { type ReactNode, useState } from "react";

interface MorphBoxProps {
  children: ReactNode;
  className?: string;
  blobShape: string;
  hoverShape?: string;
  onClick?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const MorphBox = ({
  children,
  className,
  blobShape,
  hoverShape,
  onClick,
  onDragLeave,
  onDragOver,
  onDrop,
}: MorphBoxProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const standardShape = "12px";

  return (
    <motion.div
      className={className}
      initial={{ borderRadius: standardShape }}
      animate={{
        borderRadius: isHovering && hoverShape ? hoverShape : blobShape,
      }}
      transition={{
        duration: isHovering && hoverShape ? 0.15 : 1.5,
        ease: isHovering && hoverShape ? "easeOut" : "easeInOut",
        ...(isHovering && hoverShape
          ? {}
          : {
              repeat: Infinity,
              repeatType: "reverse",
            }),
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </motion.div>
  );
};
