import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Upload, FileText, ChevronRight, Check } from "lucide-react";

export const HeroMockup: React.FC = () => {
  return (
    <div className="relative w-full max-w-[480px] aspect-[1.1/1] mx-auto select-none mt-6 lg:mt-0">
      {/* PERSPECTIVE WRAPPER */}
      <div 
        className="w-full h-full relative" 
        style={{ perspective: "1000px" }}
      >
        {/* LAYER 1: Upload (Bottom-most, shifted back/left) */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ rotateY: "12deg", rotateX: "6deg", rotateZ: "-2deg" }}
          className="absolute left-[5%] top-[10%] w-[65%] bg-white border border-slate-200 p-4 rounded-xl shadow-md z-10 opacity-90 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[9px] text-slate-400 font-mono ml-1">upload_registrato.sh</span>
          </div>
          <div className="border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
            <Upload className="w-5 h-5 text-slate-450 mb-1.5" />
            <span className="text-[10px] font-bold text-slate-900">relatorio_registrato.pdf</span>
            <span className="text-[8px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> Processado com sucesso
            </span>
          </div>
        </motion.div>

        {/* LAYER 2: Parser (Middle-left, shifted forward/right) */}
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ rotateY: "12deg", rotateX: "6deg", rotateZ: "-1deg" }}
          className="absolute left-[38%] top-[18%] w-[58%] bg-white border border-slate-200 p-4 rounded-xl shadow-lg z-20 transition-all duration-300 ring-1 ring-slate-100"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Credores Extraídos</span>
            <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">2 Encontrados</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="text-left">
                <p className="text-[9px] font-extrabold text-slate-900 leading-tight">BANCO ORIGINAL S.A.</p>
                <p className="text-[7px] text-slate-400 font-semibold">Cartão de Crédito</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700">R$ 2.774,19</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="text-left">
                <p className="text-[9px] font-extrabold text-slate-900 leading-tight">BANCO INTER S.A.</p>
                <p className="text-[7px] text-slate-400 font-semibold">Operações de Crédito</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700">R$ 386,08</span>
            </div>
          </div>
        </motion.div>

        {/* LAYER 3: IA structured complaint (Top-middle, shifted forward) */}
        <motion.div
          animate={{ y: [1, -3, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{ rotateY: "10deg", rotateX: "5deg", rotateZ: "1deg" }}
          className="absolute left-[10%] top-[45%] w-[68%] bg-white border border-slate-200 p-4 rounded-xl shadow-xl z-30 transition-all duration-300"
        >
          <div className="flex items-center gap-1.5 mb-2 border-b border-slate-100 pb-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-900 font-sans">Peticao_Banco_Original.docx</span>
          </div>
          <div className="space-y-1.5 text-left font-mono text-[7px] text-slate-650 leading-relaxed max-h-[70px] overflow-hidden bg-slate-50 p-2 rounded border border-slate-100">
            <p className="font-bold text-emerald-700">À OUVIDORIA DO BANCO ORIGINAL S.A.</p>
            <p>Ref: Contestação de registro indevido de prejuízo no SCR.</p>
            <p className="text-[6.5px]">
              O cliente solicita a imediata retificação do histórico cadastral apontado no sistema de informações de crédito do Banco Central...
            </p>
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-[8px] bg-slate-100 text-slate-700 border border-slate-200 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
              Minuta gerada com IA <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </motion.div>

        {/* LAYER 4: Checklist Consumidor.gov (Top-right, closest to user) */}
        <motion.div
          animate={{ y: [-1, 2, -1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ rotateY: "8deg", rotateX: "4deg", rotateZ: "2deg" }}
          className="absolute left-[45%] top-[60%] w-[50%] bg-[#021d17] text-white p-4 rounded-xl shadow-2xl z-40 transition-all duration-300 border border-emerald-500/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-emerald-450" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase text-emerald-400">Resolução Rápida</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[8.5px] font-bold">
              <div className="w-3.5 h-3.5 rounded bg-[#011410] flex items-center justify-center text-emerald-450">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Copiar petição da IA</span>
            </div>
            <div className="flex items-center gap-2 text-[8.5px] font-bold">
              <div className="w-3.5 h-3.5 rounded bg-[#011410] flex items-center justify-center text-emerald-450">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Acessar Consumidor.gov</span>
            </div>
            <div className="flex items-center gap-2 text-[8.5px] font-bold">
              <div className="w-3.5 h-3.5 rounded bg-[#011410] flex items-center justify-center text-emerald-450">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Colar e enviar protocolo</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Blur Background Glow */}
      <div className="absolute top-[30%] left-[25%] w-[50%] h-[40%] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none z-0" />
    </div>
  );
};
