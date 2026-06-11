import React from "react";
import { TrendingDown, Building, FileText, Sparkles } from "lucide-react";

interface RecoveryInsightProps {
  totalAmount?: number;
  institutionsCount?: number;
  largestInstitution?: string;
  className?: string;
}

export const RecoveryInsight: React.FC<RecoveryInsightProps> = ({
  totalAmount = 0,
  institutionsCount = 0,
  largestInstitution = "—",
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dynamic editorial stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-brand-offwhite-100 border border-slate-200 p-4.5 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-brand-emerald-50 border border-brand-emerald-100 text-brand-emerald-600 rounded-lg flex-shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Mapeado</span>
            <span className="font-mono font-bold text-brand-emerald-650 text-base">
              {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>

        <div className="bg-brand-offwhite-100 border border-slate-200 p-4.5 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-brand-emerald-50 border border-brand-emerald-100 text-brand-emerald-600 rounded-lg flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Credores Mapeados</span>
            <span className="font-bold text-brand-petroleo text-base">
              {institutionsCount} {institutionsCount === 1 ? "instituição" : "instituições"}
            </span>
          </div>
        </div>

        <div className="bg-brand-offwhite-100 border border-slate-200 p-4.5 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-brand-emerald-50 border border-brand-emerald-100 text-brand-emerald-600 rounded-lg flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maior Pendência</span>
            <span className="font-bold text-rose-650 text-xs truncate max-w-[120px] block mt-0.5">
              {largestInstitution}
            </span>
          </div>
        </div>

      </div>

      {/* Helpful AI feedback banner */}
      <div className="bg-brand-emerald-50/35 border border-brand-emerald-500/10 p-4 rounded-xl flex items-start gap-2.5 text-xs text-brand-emerald-750 font-medium leading-relaxed">
        <Sparkles className="w-4.5 h-4.5 text-brand-emerald-600 flex-shrink-0 mt-0.5" />
        <span>
          Detectamos que a maior parte das pendências mapeadas no Registrato envolve credores ativos. Você pode selecionar um por vez para formular a contestação correspondente.
        </span>
      </div>
    </div>
  );
};
