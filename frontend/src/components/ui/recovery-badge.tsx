import React from "react";

interface RecoveryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "emerald" | "slate" | "amber";
}

export const RecoveryBadge: React.FC<RecoveryBadgeProps> = ({
  children,
  variant = "emerald",
  className = "",
  ...props
}) => {
  const styles = {
    emerald: "bg-emerald-50/80 border-emerald-500/25 text-emerald-800",
    slate: "bg-slate-50 border-slate-200 text-slate-600",
    amber: "bg-amber-50/80 border-amber-500/20 text-amber-800",
  };

  return (
    <span
      className={`
        inline-flex 
        items-center 
        gap-1.5 
        px-3 
        py-1 
        rounded-full 
        border 
        text-xs 
        font-semibold 
        tracking-wide
        shadow-sm
        ${styles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};
