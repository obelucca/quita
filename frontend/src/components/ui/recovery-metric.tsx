import React from "react";

interface RecoveryMetricProps {
  value: string;
  label: string;
  description: string;
  className?: string;
}

export const RecoveryMetric: React.FC<RecoveryMetricProps> = ({
  value,
  label,
  description,
  className = "",
}) => {
  return (
    <div className={`py-4 border-t border-emerald-500/15 flex flex-col justify-between transition-all duration-300 ${className}`}>
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-450" />
          <span className="text-[10px] text-emerald-300/60 font-bold uppercase tracking-wider">{label}</span>
        </div>
        <h4 className="text-4xl font-extrabold text-white tracking-tight leading-none">
          {value}
        </h4>
      </div>
      <p className="text-xs text-emerald-100/70 mt-3 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
};
