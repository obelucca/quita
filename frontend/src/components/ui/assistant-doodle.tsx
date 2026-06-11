import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare } from "lucide-react";

interface AssistantDoodleProps {
  lookLeft?: boolean;
}

export const AssistantDoodle: React.FC<AssistantDoodleProps> = ({ lookLeft = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (lookLeft) {
        return; // Glancing at the FAQ holds focus
      }
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      
      const maxOffset = 5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;
      
      const angle = Math.atan2(dy, dx);
      const amount = Math.min(dist * 0.015, maxOffset);
      
      setEyeOffset({
        x: Math.cos(angle) * amount,
        y: Math.sin(angle) * amount,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [lookLeft]);

  return (
    <div ref={containerRef} className="relative w-full max-w-[320px] aspect-square flex items-center justify-center select-none">
      {/* Background soft glowing circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-56 h-56 bg-slate-500/5 rounded-full blur-2xl" />
        <div className="w-36 h-36 bg-emerald-500/5 rounded-full blur-xl animate-pulse" />
      </div>

      {/* Floating Sparkles & Dialogue Doodles (low opacity) */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-8 left-8 text-emerald-500/15"
      >
        <Sparkles className="w-5 h-5" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-8 right-8 text-slate-300/20"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.div>

      {/* Magnifying Glass (Lupa) appearing to the left, pointing to the FAQ */}
      <motion.div
        initial={{ opacity: 0, x: 10, y: 10, scale: 0.7, rotate: 15 }}
        animate={
          lookLeft
            ? { opacity: 1, x: -75, y: -15, scale: 1.1, rotate: -25 }
            : { opacity: 0, x: 10, y: 10, scale: 0.7, rotate: 15 }
        }
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="absolute z-20 pointer-events-none"
      >
        <motion.div
          animate={lookLeft ? { y: [0, -4, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            {/* Handle */}
            <line x1="22" y1="42" x2="6" y2="58" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="22" y1="42" x2="6" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            
            {/* Grip Connector Ring */}
            <circle cx="22" cy="42" r="3.5" fill="#cbd5e1" />

            {/* Lens Rim (Emerald highlight) */}
            <circle cx="40" cy="24" r="16" stroke="#475569" strokeWidth="3.5" fill="rgba(16, 185, 129, 0.05)" />
            <circle cx="40" cy="24" r="13" stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.4" />
            
            {/* Lens Glare reflection */}
            <path d="M 30 24 A 10 10 0 0 1 40 14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
            
            {/* Internal Sparkle/Focus Icon */}
            <path d="M 40 21 L 41.2 24 L 44 24.5 L 41.8 26.8 L 42.4 29.8 L 40 28.2 L 37.6 29.8 L 38.2 26.8 L 36 24.5 L 38.8 24 Z" fill="#10b981" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Main Avatar Character Shape (Slate-900 body) */}
      <motion.div
        className="relative z-10 w-44 h-44 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-[40px] shadow-lg shadow-slate-950/20 p-6 cursor-pointer"
        initial={{ opacity: 0, scale: 0.8, y: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -8, 0],
          rotate: [0, 1.5, -1.5, 0]
        }}
        whileHover={{
          scale: 1.06,
          y: -14,
          rotate: 3
        }}
        whileTap={{
          scale: 0.96
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 0.6 },
          y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" },
          default: { type: "spring", stiffness: 300, damping: 15 }
        }}
      >
        {/* Subtle grid pattern inside */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] rounded-[40px] pointer-events-none" />

        {/* Head Antenna (Emerald-600 starting point of the Rota) */}
        <div className="absolute -top-3 flex flex-col items-center">
          <div className="w-1.5 h-3 bg-emerald-600 rounded-full" />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm shadow-emerald-400"
          />
        </div>

        {/* Screen/Eyes Box (Slate-100 face plate) */}
        <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3 relative overflow-hidden">
          {/* Eyes (Emerald-500) */}
          <div className="flex gap-4 relative">
            {/* Left Eye */}
            <motion.div
              animate={{
                x: lookLeft ? -6 : eyeOffset.x,
                y: lookLeft ? 1 : eyeOffset.y,
                scaleY: lookLeft ? 1.15 : [1, 1, 0.1, 1, 1]
              }}
              transition={
                lookLeft
                  ? { type: "spring", stiffness: 150, damping: 12 }
                  : {
                      x: { type: "spring", stiffness: 150, damping: 15 },
                      y: { type: "spring", stiffness: 150, damping: 15 },
                      scaleY: { repeat: Infinity, duration: 6, times: [0, 0.25, 0.28, 0.32, 1], repeatDelay: 1.5 }
                    }
              }
              className="w-3 h-5 bg-emerald-500 rounded-full origin-center shadow-xs shadow-emerald-500/10"
            />
            {/* Right Eye */}
            <motion.div
              animate={{
                x: lookLeft ? -6 : eyeOffset.x,
                y: lookLeft ? 1 : eyeOffset.y,
                scaleY: lookLeft ? 1.15 : [1, 1, 0.1, 1, 1]
              }}
              transition={
                lookLeft
                  ? { type: "spring", stiffness: 150, damping: 12 }
                  : {
                      x: { type: "spring", stiffness: 150, damping: 15 },
                      y: { type: "spring", stiffness: 150, damping: 15 },
                      scaleY: { repeat: Infinity, duration: 6, times: [0, 0.25, 0.28, 0.32, 1], repeatDelay: 1.5 }
                    }
              }
              className="w-3 h-5 bg-emerald-500 rounded-full origin-center shadow-xs shadow-emerald-500/10"
            />
          </div>

          {/* Happy Mouth (Emerald-500) */}
          <svg className="w-8 h-3 text-emerald-500" viewBox="0 0 40 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 5 2 Q 20 15 35 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Status indicator bubble under the assistant (Slate-300 base/label) */}
        <div className="absolute -bottom-2 bg-slate-200 border border-slate-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[9px] font-bold text-slate-700 tracking-wider uppercase">Quita Assist</span>
        </div>
      </motion.div>
    </div>
  );
};
