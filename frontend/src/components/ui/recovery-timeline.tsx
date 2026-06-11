import React from "react";
import { Check } from "lucide-react";

interface TimelineItem {
  label: string;
  description: string;
  status: "completed" | "active" | "upcoming";
}

interface RecoveryTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const RecoveryTimeline: React.FC<RecoveryTimelineProps> = ({
  items,
  className = "",
}) => {
  return (
    <div className={`space-y-6 relative ${className}`}>
      {/* Central Line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-[1.5px] bg-slate-200 z-0" />

      {items.map((item, idx) => {
        const isCompleted = item.status === "completed";
        const isActive = item.status === "active";

        return (
          <div key={idx} className="flex gap-4 relative z-10 text-left items-start">
            {/* Step Node */}
            <div
              className={`
                w-8 
                h-8 
                rounded-xl 
                border 
                flex 
                items-center 
                justify-center 
                flex-shrink-0 
                transition-all 
                duration-300
                ${isCompleted
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                  : isActive
                  ? "bg-white border-emerald-600 text-emerald-600 shadow-sm shadow-emerald-600/5 ring-4 ring-emerald-50"
                  : "bg-white border-slate-200 text-slate-400"
                }
              `}
            >
              {isCompleted ? (
                <Check className="w-4.5 h-4.5" />
              ) : (
                <span className="text-xs font-bold font-mono">{idx + 1}</span>
              )}
            </div>

            {/* Description */}
            <div className="pt-0.5 space-y-0.5">
              <h5
                className={`
                  text-xs 
                  font-bold 
                  ${isActive ? "text-emerald-700" : isCompleted ? "text-slate-800" : "text-slate-500"}
                `}
              >
                {item.label}
              </h5>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
