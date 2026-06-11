import React from "react";
import { motion } from "framer-motion";

interface RouteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
  gridBackground?: boolean;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  children,
  active = false,
  gridBackground = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`
        relative 
        bg-white 
        border 
        rounded-2xl 
        p-6 sm:p-8 
        overflow-hidden
        transition-all 
        duration-300 
        ease-out
        ${active 
          ? "border-emerald-500/35 shadow-lg shadow-emerald-600/5 ring-1 ring-emerald-500/10 scale-[1.01]" 
          : "border-slate-200 hover:scale-[1.01] hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-600/5"
        }
        ${className}
      `}
      {...props}
    >
      {gridBackground && (
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.45] pointer-events-none z-0" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
