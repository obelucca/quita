import React from "react";
import { motion } from "framer-motion";

interface RouteStep {
  number: string;
  title: string;
  description: string;
}

interface RecoveryRouteProps {
  steps: RouteStep[];
  currentStep?: number;
  className?: string;
}

export const RecoveryRoute: React.FC<RecoveryRouteProps> = ({
  steps,
  currentStep = 1,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Horizontal Connector Line for Desktop */}
      <div className="absolute top-[28px] left-[50px] right-[50px] h-[2px] bg-slate-200 hidden md:block z-0">
        <motion.div
          className="h-full bg-emerald-600"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {steps.map((step, idx) => {
          const isCompleted = idx + 1 < currentStep;
          const isActive = idx + 1 === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left group">
              {/* Step indicator node */}
              <div className="flex items-center justify-center mb-4 relative">
                {/* Glow ring on active */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute w-10 h-10 bg-emerald-500/25 rounded-full z-0"
                  />
                )}
                {/* Node circle */}
                <div
                  className={`
                    w-12 
                    h-12 
                    rounded-2xl 
                    border 
                    flex 
                    items-center 
                    justify-center 
                    text-sm 
                    font-extrabold 
                    font-mono 
                    z-10 
                    transition-all 
                    duration-300
                    ${isCompleted 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10" 
                      : isActive 
                      ? "bg-white border-emerald-600 text-emerald-600 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-400"
                    }
                  `}
                >
                  {step.number}
                </div>
              </div>

              {/* Text content */}
              <div className="space-y-1">
                <h4
                  className={`
                    text-sm 
                    font-bold 
                    transition-colors 
                    duration-300
                    ${isActive ? "text-emerald-700" : isCompleted ? "text-slate-800" : "text-slate-600"}
                  `}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px] mx-auto md:mx-0 font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
