import React from "react";
import { motion } from "framer-motion";
import { YouAreHereMarker } from "./you-are-here-marker";

export type RecoveryMapState = 1 | 2 | 3 | 4 | 5 | "nevoa" | "descoberta" | "clareza" | "acao" | "conclusao";

interface RecoveryMapProps {
  className?: string;
  state?: RecoveryMapState;
  showYouAreHere?: boolean;
}

export const RecoveryMap: React.FC<RecoveryMapProps> = ({
  className = "",
  state = 5,
  showYouAreHere = true,
}) => {
  // Grid size
  const cols = 15;
  const rows = 10;

  // Resolve state to number 1-5
  const numState = React.useMemo(() => {
    if (typeof state === "number") return state;
    const map: Record<string, number> = {
      nevoa: 1,
      descoberta: 2,
      clareza: 3,
      acao: 4,
      conclusao: 5,
    };
    return map[state] || 1;
  }, [state]);

  // Define the "solution path" coordinates (col, row)
  const pathPoints = [
    { c: 1, r: 8 },
    { c: 2, r: 7 },
    { c: 3, r: 7 },
    { c: 4, r: 6 },
    { c: 5, r: 6 },
    { c: 6, r: 5 },
    { c: 7, r: 4 },
    { c: 8, r: 4 },
    { c: 9, r: 3 },
    { c: 10, r: 3 },
    { c: 11, r: 4 },
    { c: 12, r: 4 },
    { c: 13, r: 3 },
  ];

  // Map state to limit index in pathPoints
  const activeLimitIdx = React.useMemo(() => {
    if (numState === 1) return -1;
    if (numState === 2) return 3;
    if (numState === 3) return 7;
    if (numState === 4) return 10;
    return 12; // State 5 (Conclusão)
  }, [numState]);

  // Helper to check if a cell is on the path and if it's active
  const getPathStatus = (c: number, r: number) => {
    const idx = pathPoints.findIndex((p) => p.c === c && p.r === r);
    if (idx === -1) return { onPath: false, isActive: false, pathIdx: -1 };
    return {
      onPath: true,
      isActive: idx <= activeLimitIdx,
      pathIdx: idx,
    };
  };

  // Generate grid points
  const points = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const status = getPathStatus(c, r);
      points.push({
        id: `${r}-${c}`,
        col: c,
        row: r,
        ...status,
      });
    }
  }

  // Draw continuous SVG path underneath up to the active limit
  const generateSvgPath = (limitIdx: number) => {
    if (limitIdx < 0) return "";
    const activePoints = pathPoints.slice(0, limitIdx + 1);
    return activePoints
      .map((p, idx) => {
        const x = (p.c / (cols - 1)) * 100;
        const y = (p.r / (rows - 1)) * 100;
        return `${idx === 0 ? "M" : "L"} ${x}% ${y}%`;
      })
      .join(" ");
  };

  const activePathString = generateSvgPath(activeLimitIdx);
  const fullPathString = generateSvgPath(12);

  // You Are Here position calculations
  const youAreHerePoint = activeLimitIdx >= 0 ? pathPoints[activeLimitIdx] : null;

  return (
    <div className={`relative bg-brand-offwhite-50 border border-slate-250 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-inner flex items-center justify-center min-h-[280px] sm:min-h-[360px] ${className}`}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-brand-offwhite-50/50 to-brand-offwhite-50 pointer-events-none z-10" />

      {/* Concept Background Mist for State 1 (Névoa) */}
      {numState === 1 && (
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-tr from-slate-205 via-transparent to-slate-205 pointer-events-none z-0"
        />
      )}

      <div className="relative w-full h-full max-w-[520px] aspect-[1.5/1]">
        {/* Glow behind the path (Active) */}
        {activeLimitIdx >= 0 && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full opacity-35">
              <motion.path
                d={activePathString}
                fill="none"
                stroke="#10b981"
                strokeWidth={numState === 2 ? "12" : "32"}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="blur-xl"
              />
            </svg>
          </div>
        )}

        {/* The Connection Line */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg className="w-full h-full">
            {/* Background Grey dashed path for context in Claridade/Acao/Conclusao */}
            {numState >= 3 && (
              <path
                d={fullPathString}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Active Path Line */}
            {activeLimitIdx >= 0 && (
              <motion.path
                d={activePathString}
                fill="none"
                stroke="#059669"
                strokeWidth={numState === 2 ? "2" : "3"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={numState === 3 ? "6,5" : "none"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            )}
          </svg>
        </div>

        {/* You Are Here Floating Badge */}
        {showYouAreHere && youAreHerePoint && (
          <div
            className="absolute z-30 transition-all duration-500 ease-out"
            style={{
              left: `${(youAreHerePoint.c / (cols - 1)) * 100}%`,
              top: `${(youAreHerePoint.r / (rows - 1)) * 100}%`,
            }}
          >
            <YouAreHereMarker
              label={
                numState === 5
                  ? "concluído!"
                  : numState === 2
                  ? "você está aqui"
                  : `etapa ${activeLimitIdx + 1}`
              }
            />
          </div>
        )}

        {/* The Grid of Dots */}
        <div
          className="absolute inset-0 grid gap-2 z-20"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {points.map((p) => {
            const isReddish = (parseInt(p.id.split("-")[0]) + parseInt(p.id.split("-")[1])) % 7 === 0;

            if (p.onPath && p.isActive) {
              return (
                <div key={p.id} className="flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: p.pathIdx * 0.08,
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                    className="relative flex items-center justify-center"
                  >
                    {/* Ring glow for the leading/active point */}
                    {p.pathIdx === activeLimitIdx && (
                      <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.2,
                        }}
                        className="absolute w-5 h-5 bg-brand-emerald-500/35 rounded-full"
                      />
                    )}
                    {/* Core dot */}
                    <div className="w-2.5 h-2.5 bg-brand-emerald-600 rounded-full border border-white shadow-sm shadow-brand-emerald-600/50" />
                  </motion.div>
                </div>
              );
            }

            // Normal dots representation
            return (
              <div key={p.id} className="flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.15 }}
                  animate={
                    numState === 1
                      ? { opacity: [0.1, 0.25, 0.1] } // drifting fog feeling
                      : isReddish
                      ? {
                          scale: [1, 1.08, 1],
                          opacity: [0.25, 0.45, 0.25],
                        }
                      : {}
                  }
                  transition={{
                    repeat: Infinity,
                    duration: 3 + Math.random() * 3,
                    ease: "easeInOut",
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                    p.onPath
                      ? "bg-slate-300/60" // inactive path points in state 1 / 2
                      : isReddish
                      ? "bg-rose-300/40" // debt spots
                      : "bg-slate-200/55" // regular background
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
