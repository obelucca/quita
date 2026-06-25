import React from "react";
import { motion } from "framer-motion";

interface YouAreHereMarkerProps {
  className?: string;
  label?: string;
  align?: "left" | "center" | "right";
}

export const YouAreHereMarker: React.FC<YouAreHereMarkerProps> = ({
  className = "",
  label = "você está aqui",
  align = "center",
}) => {
  const alignClass = 
    align === "left" 
      ? "" 
      : align === "right" 
      ? "-translate-x-full" 
      : "-translate-x-1/2";

  const tailClass = 
    align === "left" 
      ? "left-3 -translate-x-0" 
      : align === "right" 
      ? "right-3 left-auto -translate-x-0" 
      : "left-1/2 -translate-x-1/2";

  return (
    <div className={`absolute flex flex-col items-center z-30 pointer-events-none -translate-y-[135%] ${alignClass} ${className}`}>
      {/* Floating Tooltip Bubble */}
      <motion.div
        initial={{ y: 4, opacity: 0 }}
        animate={{ y: [0, -4, 0], opacity: 1 }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          },
          opacity: { duration: 0.3 }
        }}
        className="bg-brand-petroleo text-brand-offwhite-50 text-[10px] font-bold px-2 py-1 rounded-md shadow-md border border-slate-700 flex items-center justify-center whitespace-nowrap"
      >
        <span className="relative z-10">{label}</span>
        {/* Tooltip triangle tail */}
        <div className={`absolute w-2.5 h-2.5 bg-brand-petroleo rotate-45 bottom-[-4px] border-r border-b border-slate-705 ${tailClass}`} />
      </motion.div>

      {/* Floating spacer to position exactly above the target dot */}
      <div className="h-2" />
    </div>
  );
};
