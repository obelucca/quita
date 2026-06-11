import React from "react";
import { motion } from "framer-motion";

export const RoadMapCta: React.FC = () => {
  // Path points representing the complete linear route
  const points = [
    { x: 5, y: 80 },
    { x: 20, y: 50 },
    { x: 35, y: 65 },
    { x: 50, y: 35 },
    { x: 65, y: 45 },
    { x: 80, y: 20 },
    { x: 95, y: 30 },
  ];

  const pathString = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x}% ${p.y}%`)
    .join(" ");

  return (
    <div className="absolute inset-0 w-full h-full opacity-25 overflow-hidden pointer-events-none select-none z-0">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Glow behind the path */}
        <motion.path
          d={pathString}
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="blur-md"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />

        {/* The Solid Line */}
        <motion.path
          d={pathString}
          fill="none"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />

        {/* Nodes */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={`${p.x}%`}
              cy={`${p.y}%`}
              r="6"
              fill="#047857"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
