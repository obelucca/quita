import React, { useMemo } from "react";
import { motion } from "framer-motion";

export const BrazilMap: React.FC = () => {
  // Approximate geographic dot distribution of Brazil (normalized coords 0-100)
  const dots = useMemo(() => {
    const rawDots = [
      // North / Norte (Amazonas, Acre, Roraima, Pará, Amapá, Tocantins, Rondônia) - Sparse
      { x: 15, y: 35, density: "low" },
      { x: 22, y: 32, density: "low" },
      { x: 28, y: 25, density: "low" },
      { x: 34, y: 22, density: "low" },
      { x: 42, y: 15, density: "low" },
      { x: 38, y: 30, density: "medium" },
      { x: 48, y: 28, density: "medium" },
      { x: 20, y: 45, density: "low" },
      { x: 32, y: 42, density: "low" },
      { x: 45, y: 40, density: "medium" },
      { x: 50, y: 20, density: "low" },
      { x: 58, y: 25, density: "medium" },

      // Northeast / Nordeste (Maranhão, Piauí, Ceará, RN, PB, PE, AL, SE, Bahia) - Higher density coast
      { x: 65, y: 26, density: "medium" },
      { x: 72, y: 22, density: "medium" },
      { x: 78, y: 20, density: "high" },
      { x: 84, y: 24, density: "high" },
      { x: 86, y: 30, density: "high" },
      { x: 82, y: 35, density: "high" },
      { x: 78, y: 40, density: "high" },
      { x: 74, y: 45, density: "medium" },
      { x: 68, y: 38, density: "medium" },
      { x: 75, y: 32, density: "high" },
      { x: 70, y: 30, density: "medium" },

      // Center-West / Centro-Oeste (Mato Grosso, MS, Goiás, DF) - Medium
      { x: 48, y: 50, density: "medium" },
      { x: 56, y: 48, density: "medium" },
      { x: 58, y: 55, density: "high" }, // DF area
      { x: 44, y: 62, density: "low" },
      { x: 50, y: 65, density: "medium" },

      // Southeast / Sudeste (Minas Gerais, Espírito Santo, Rio de Janeiro, São Paulo) - Very High Density
      { x: 64, y: 56, density: "high" },
      { x: 68, y: 58, density: "high" },
      { x: 72, y: 62, density: "high" },
      { x: 76, y: 60, density: "high" },
      { x: 66, y: 68, density: "high" }, // SP capital area
      { x: 62, y: 65, density: "high" },
      { x: 60, y: 60, density: "medium" },
      { x: 70, y: 66, density: "high" }, // RJ capital area
      { x: 73, y: 66, density: "high" },
      { x: 67, y: 62, density: "high" },

      // South / Sul (Paraná, Santa Catarina, Rio Grande do Sul) - Medium/High
      { x: 56, y: 72, density: "medium" },
      { x: 58, y: 78, density: "high" },
      { x: 54, y: 84, density: "medium" },
      { x: 50, y: 88, density: "medium" },
      { x: 52, y: 80, density: "medium" },
    ];
    return rawDots;
  }, []);

  // Emerald route coordinates traversing from left to right (from chaotic area to SP/RJ/DF centers)
  const routePoints = [
    { x: 18, y: 40 },
    { x: 32, y: 42 },
    { x: 48, y: 50 },
    { x: 58, y: 55 },
    { x: 64, y: 56 },
    { x: 66, y: 68 },
  ];

  // Draw continuous SVG path string
  const svgPathString = useMemo(() => {
    return routePoints
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x}% ${p.y}%`)
      .join(" ");
  }, []);

  return (
    <div className="relative bg-[#011410]/40 border border-emerald-500/10 rounded-3xl p-6 sm:p-8 overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[380px] w-full bg-grid-pattern">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#021d17]/40 to-[#021d17] pointer-events-none z-10" />

      <div className="relative w-full h-full max-w-[500px] aspect-[1.3/1]">
        {/* Glowing blur trail behind active path */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full opacity-30">
            <motion.path
              d={svgPathString}
              fill="none"
              stroke="#10b981"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              className="blur-xl"
            />
          </svg>
        </div>

        {/* The Connection Line */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg className="w-full h-full">
            <motion.path
              d={svgPathString}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
            />
          </svg>
        </div>

        {/* Dot Cloud */}
        {dots.map((dot, idx) => {
          const isHigh = dot.density === "high";
          const isMedium = dot.density === "medium";

          // Calculate size and opacity
          const size = isHigh ? "w-2.5 h-2.5" : isMedium ? "w-2 h-2" : "w-1.5 h-1.5";
          const opacity = isHigh ? "opacity-35" : isMedium ? "opacity-20" : "opacity-10";

          return (
            <motion.div
              key={idx}
              className={`absolute rounded-full bg-emerald-400 ${size} ${opacity} -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
              animate={{
                opacity: isHigh
                  ? [0.25, 0.45, 0.25]
                  : isMedium
                  ? [0.15, 0.3, 0.15]
                  : [0.08, 0.2, 0.08],
              }}
              transition={{
                duration: 4 + (idx % 3),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Route point highlights (pulsing dots) */}
        {routePoints.map((p, idx) => (
          <div
            key={`rp-${idx}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                delay: idx * 0.4,
              }}
              className="absolute w-6 h-6 bg-emerald-500/35 rounded-full -left-1.5 -top-1.5"
            />
            <div className="w-3 h-3 bg-emerald-600 rounded-full border border-white shadow-sm shadow-emerald-600/50 relative z-10" />
          </div>
        ))}
      </div>

      {/* Narrative Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 text-[10px] text-emerald-100/60 font-semibold font-sans">
        <span className="text-emerald-450 font-bold">Quita Rota</span> — Milhões perdidos, um caminho claro.
      </div>
    </div>
  );
};
