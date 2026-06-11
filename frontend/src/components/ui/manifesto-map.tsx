import React from "react";
import { motion } from "framer-motion";

export const ManifestoMap: React.FC = () => {
  // Grid configuration: 12 columns, 10 rows
  const cols = 12;
  const rows = 10;

  // Generate grid points
  const gridPoints = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 5 + (c * 90) / (cols - 1);
      const y = 10 + (r * 80) / (rows - 1);
      // Reddish/alert dots on the bottom-left area (c < 4 && r > 4)
      const isAlert = c < 4 && r > 4;
      gridPoints.push({ x, y, isAlert });
    }
  }

  // Staircase path generation coordinates (x%, y%)
  // Curves smoothly from bottom-left to top-right
  const pathPoints = [
    { x: 10, y: 90 },
    { x: 16, y: 80 },
    { x: 21, y: 80 },
    { x: 27, y: 70 },
    { x: 33, y: 70 },
    { x: 38, y: 60 },
    { x: 44, y: 60 },
    { x: 50, y: 50 },
    { x: 55, y: 50 },
    { x: 61, y: 40 },
    { x: 67, y: 40 },
    { x: 72, y: 30 },
    { x: 78, y: 30 },
    { x: 84, y: 20 },
    { x: 89, y: 20 },
    { x: 95, y: 10 },
  ];

  // Draw smooth staircase using SVG path cubic/quadratic commands
  let dPath = "M 10 95 C 10 90, 11 90, 13 90";
  for (let i = 1; i < pathPoints.length; i += 2) {
    const pPrev = pathPoints[i - 1];
    const pCurr = pathPoints[i];
    const pNext = pathPoints[i + 1] || pCurr;
    
    // Vertical rise + curve
    dPath += ` C ${pPrev.x} ${pPrev.y}, ${pPrev.x} ${pPrev.y}, ${pCurr.x} ${pCurr.y}`;
    // Horizontal step
    dPath += ` L ${pNext.x} ${pNext.y}`;
  }

  // Green nodes highlights coordinates (alternating single/double dots)
  const highlightNodes = [
    { x: 10, y: 90, pulse: true },
    { x: 16, y: 80, pulse: false },
    { x: 21, y: 80, pulse: true },
    { x: 27, y: 70, pulse: false },
    { x: 33, y: 70, pulse: true },
    { x: 44, y: 60, pulse: false },
    { x: 55, y: 50, pulse: true },
    { x: 61, y: 40, pulse: false },
    { x: 67, y: 40, pulse: true },
    { x: 72, y: 30, pulse: false },
    { x: 84, y: 20, pulse: true },
    { x: 89, y: 20, pulse: false },
    { x: 95, y: 10, pulse: true },
  ];

  return (
    <div className="w-full aspect-[1.2/1] relative select-none rounded-3xl overflow-hidden bg-emerald-950/20 border border-emerald-500/5 p-6 shadow-xs flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {/* 1. Background Grid of Dots */}
        {gridPoints.map((gp, idx) => (
          <circle
            key={`gp-${idx}`}
            cx={`${gp.x}`}
            cy={`${gp.y}`}
            r="0.75"
            fill={gp.isAlert ? "#ef4444" : "#e2e8f0"}
            opacity={gp.isAlert ? 0.18 : 0.06}
          />
        ))}

        {/* 2. Staircase Dashed Path */}
        <motion.path
          d={dPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="0.8"
          strokeDasharray="1.5,1.5"
          opacity="0.65"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
        />

        {/* 3. Glowing line behind for depth */}
        <motion.path
          d={dPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="1.5,1.5"
          opacity="0.15"
          className="blur-[2px]"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
        />

        {/* 4. Highlight Nodes */}
        {highlightNodes.map((node, idx) => (
          <g key={`hn-${idx}`}>
            {node.pulse && (
              <motion.circle
                cx={`${node.x}`}
                cy={`${node.y}`}
                r="1.8"
                fill="#10b981"
                opacity="0.3"
                animate={{ scale: [1, 1.8, 1], opacity: [0.35, 0, 0.35] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  delay: idx * 0.25,
                }}
              />
            )}
            <circle
              cx={`${node.x}`}
              cy={`${node.y}`}
              r="0.95"
              fill="#059669"
              stroke="#ffffff"
              strokeWidth="0.25"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
