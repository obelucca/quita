import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, ArrowRight, Compass } from "lucide-react";

export const SecurityIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[400px] aspect-[1.2/1] p-6 flex flex-col justify-between overflow-hidden">
      {/* Network Nodes and Paths */}
      <div className="relative flex-grow flex items-center justify-center min-h-[160px] z-10">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Path lines linking nodes */}
          <motion.line
            x1="20%" y1="50%" x2="50%" y2="30%"
            stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4"
          />
          <motion.line
            x1="20%" y1="50%" x2="50%" y2="70%"
            stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4"
          />
          <motion.line
            x1="50%" y1="30%" x2="80%" y2="50%"
            stroke="#059669" strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.line
            x1="50%" y1="70%" x2="80%" y2="50%"
            stroke="#059669" strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />

          {/* Core glow */}
          <circle cx="80%" cy="50%" r="20" fill="rgba(16, 185, 129, 0.08)" className="blur-xs" />
        </svg>

        {/* Node 1: Input (User Registrato) */}
        <div className="absolute left-[10%] top-[40%] flex flex-col items-center gap-1.5">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs"
          >
            <FileText className="w-5 h-5" />
          </motion.div>
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Registrato</span>
        </div>

        {/* Node 2A: Processing Node (Isolado) */}
        <div className="absolute left-[42%] top-[15%] flex flex-col items-center gap-1.5">
          <motion.div
            animate={{ y: [2, -2, 2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-750 shadow-xs"
          >
            <span className="text-xs font-bold font-mono">IA</span>
          </motion.div>
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Análise</span>
        </div>

        {/* Node 2B: Processing Node (Local) */}
        <div className="absolute left-[42%] top-[60%] flex flex-col items-center gap-1.5">
          <motion.div
            animate={{ y: [-1, 2, -1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-xs"
          >
            <ShieldCheck className="w-5 h-5" />
          </motion.div>
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Isolamento</span>
        </div>

        {/* Node 3: Output (Protected Action) */}
        <div className="absolute left-[72%] top-[40%] flex flex-col items-center gap-1.5">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-12 h-12 rounded-2xl bg-[#021d17] border border-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/20"
          >
            <Compass className="w-6 h-6 text-emerald-400" />
          </motion.div>
          <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Sua Rota</span>
        </div>
      </div>

      {/* Info Status footer inside illustration */}
      <div className="border border-slate-200/60 pt-3 flex items-center justify-between text-[9px] font-bold text-slate-600 bg-slate-100/70 p-3 rounded-xl z-20">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          FLUXO LOCAL PROTEGIDO
        </span>
        <span className="text-emerald-700">LGPD ATIVA</span>
      </div>
    </div>
  );
};
