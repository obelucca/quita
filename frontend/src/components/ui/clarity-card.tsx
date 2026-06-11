import React from "react";
import { HelpCircle } from "lucide-react";

interface ClarityCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string | React.ReactNode;
  icon?: React.ComponentType<any>;
  variant?: "info" | "warning" | "success";
}

export const ClarityCard: React.FC<ClarityCardProps> = ({
  title,
  description,
  icon: IconComponent = HelpCircle,
  variant = "info",
  className = "",
  ...props
}) => {
  const variantStyles = {
    info: "border-slate-200 bg-brand-offwhite-50/70 text-brand-petroleo",
    warning: "border-brand-orange/20 bg-amber-50/40 text-brand-petroleo",
    success: "border-brand-emerald-500/20 bg-brand-emerald-50/20 text-brand-petroleo",
  };

  const iconColors = {
    info: "text-brand-emerald-600 bg-brand-emerald-50",
    warning: "text-brand-orange bg-amber-50",
    success: "text-brand-emerald-650 bg-brand-emerald-50",
  };

  return (
    <div
      className={`border rounded-2xl p-5 sm:p-6 shadow-sm flex items-start gap-4 transition-all duration-200 hover:shadow-md ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconColors[variant]} border border-slate-100`}>
        <IconComponent className="w-5 h-5" />
      </div>
      <div className="space-y-1 text-left">
        <h4 className="text-sm font-bold tracking-tight text-brand-petroleo uppercase tracking-wider text-[11px] mb-0.5">
          {title}
        </h4>
        <div className="text-slate-600 text-xs leading-relaxed font-medium">
          {description}
        </div>
      </div>
    </div>
  );
};
