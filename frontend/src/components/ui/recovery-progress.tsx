import React from "react";
import { motion } from "framer-motion";
import { YouAreHereMarker } from "./you-are-here-marker";
import { Clock } from "lucide-react";

interface RecoveryProgressProps {
  currentStep: number;
  className?: string;
}

export const RecoveryProgress: React.FC<RecoveryProgressProps> = ({
  currentStep,
  className = "",
}) => {
  const totalSteps = 19;

  // Visual label for active step category
  const getStepCategory = (step: number) => {
    if (step <= 2) return "Introdução";
    if (step === 3) return "Envio do Relatório";
    if (step <= 6) return "Análise de Dívidas";
    if (step <= 9) return "Configuração da IA";
    if (step <= 11) return "Revisão e Exportação";
    if (step <= 15) return "Protocolo Assistido";
    return "Jornada de Conquista";
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return "Obtendo Registrato";
      case 2: return "Termos de Privacidade";
      case 3: return "Upload do Relatório";
      case 4: return "Confirmar Dados";
      case 5: return "Ajustar Valores";
      case 6: return "Visualizar Insights";
      case 7: return "Selecionar Credor";
      case 8: return "Saldo Atualizado";
      case 9: return "Processando Petição";
      case 10: return "Revisar Conteúdo";
      case 11: return "Download e Cópia";
      case 12: return "Guia Consumidor";
      case 13: return "Preparação da Reclamação";
      case 14: return "Protocolo Assistido";
      case 15: return "Confirmação de Envio";
      case 16: return "Momento da Conquista";
      case 17: return "De Onde Você Saiu";
      case 18: return "Cenários Futuros";
      case 19: return "Plano de Acompanhamento";
      default: return "";
    }
  };

  const remainingTimes = [
    "~6 min restantes", // 1
    "~6 min restantes", // 2
    "~5 min restantes", // 3
    "~5 min restantes", // 4
    "~4 min restantes", // 5
    "~4 min restantes", // 6
    "~3 min restantes",  // 7
    "~3 min restantes",  // 8
    "~3 min restantes",  // 9
    "~2 min restantes",  // 10
    "~2 min restantes",  // 11
    "~2 min restantes",  // 12
    "~1 min restante",   // 13
    "~1 min restante",   // 14
    "~30 s restantes",   // 15
    "Parabéns",          // 16
    "Sua Evolução",      // 17
    "Próximos Cenários", // 18
    "Plano Final",       // 19
  ];

  return (
    <div className={`w-full bg-brand-offwhite-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm ${className}`}>
      
      {/* Step Info Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 text-xs font-semibold text-slate-500">
        <div>
          <span className="text-brand-emerald-600 font-bold uppercase tracking-wider">
            Fase Atual: {getStepCategory(currentStep)}
          </span>
          <span className="mx-2 text-slate-300">•</span>
          <span className="text-brand-petroleo font-bold">
            Passo {currentStep} de {totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-offwhite-100 border border-slate-200 px-3 py-1 rounded-lg text-brand-petroleo font-bold">
          <Clock className="w-3.5 h-3.5 text-brand-orange" />
          <span>{remainingTimes[currentStep - 1]}</span>
        </div>
      </div>

      {/* SVG Timeline */}
      <div className="relative px-2 py-4">
        <div className="relative w-full h-2 bg-slate-200 rounded-full">
          {/* Active progress track */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-brand-emerald-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Dots along timeline */}
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < currentStep;
              const isActive = stepNum === currentStep;

              return (
                <div key={idx} className="relative flex items-center justify-center w-2.5 h-2.5">
                  <motion.div
                    className={`rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-brand-emerald-600 w-3 h-3 border border-white shadow-sm"
                        : isActive
                        ? "bg-brand-emerald-600 w-4 h-4 border-2 border-white shadow-md shadow-brand-emerald-600/30"
                        : "bg-slate-300 w-2.5 h-2.5"
                    }`}
                    animate={
                      isActive
                        ? {
                            scale: [1, 1.25, 1],
                          }
                        : {}
                    }
                    transition={{
                      repeat: isActive ? Infinity : 0,
                      duration: 2,
                    }}
                  />
                  
                  {/* Glowing ring for active dot */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute w-5 h-5 bg-brand-emerald-600/30 rounded-full"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Step Indicator Text below timeline */}
      <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Passo Atual</span>
          <span className="font-bold text-slate-800 text-base mt-0.5">
            {getStepDescription(currentStep)}
          </span>
        </div>
        <div className="sm:text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fase</span>
          <span className="block font-semibold text-brand-emerald-600 mt-0.5">
            {getStepCategory(currentStep)}
          </span>
        </div>
      </div>
    </div>
  );
};
