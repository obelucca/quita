import React from "react";
import { Card } from "./card";
import { Clock, HelpCircle, Check, X, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export const BureaucracyComparison: React.FC = () => {
  const traditionalSteps = [
    "Interpretar relatórios SCR codificados do BC",
    "Localizar canais de ouvidoria corretos",
    "Estudar regulamentações bancárias complexas",
    "Redigir petições formais em termos jurídicos",
    "Descobrir prazos e regras do Consumidor.gov",
  ];

  const quitaSteps = [
    "Upload simples do PDF extraído do Registrato",
    "Visualização clara e consolidada dos credores",
    "Informações regulamentares explicadas em linguagem humana",
    "Petição gerada instantaneamente por Inteligência Artificial",
    "Passo a passo com link direto para o protocolo",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-4">
      {/* Traditional Path */}
      <Card className="bg-white border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full flex items-center justify-center opacity-70 group-hover:scale-105 transition-transform duration-300">
          <ShieldAlert className="w-5 h-5 text-rose-500 translate-x-1.5 -translate-y-1.5" />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Rota Tradicional</span>
          </div>
          <h3 className="text-xl font-bold text-brand-petroleo mb-6">Como resolver por conta própria</h3>
          
          <ul className="space-y-4 mb-8">
            {traditionalSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Esforço Estimado:</span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Várias horas ou dias
          </span>
        </div>
      </Card>

      {/* Quita Path */}
      <Card className="border-brand-emerald-500/30 bg-white p-6 flex flex-col justify-between shadow-md shadow-brand-emerald-600/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-emerald-50 rounded-bl-full flex items-center justify-center opacity-70">
          <Check className="w-5 h-5 text-brand-emerald-600 translate-x-1.5 -translate-y-1.5" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-brand-emerald-650 uppercase tracking-wider">
            <span>Rota do Quita</span>
          </div>
          <h3 className="text-xl font-bold text-brand-petroleo mb-6">Com o Assistente do Quita</h3>

          {/* Mini Recovery Map Indicator */}
          <div className="mb-6 h-6 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <React.Fragment key={idx}>
                <div className="w-2 h-2 rounded-full bg-brand-emerald-600 shadow-sm shadow-brand-emerald-600/50" />
                {idx < 4 && (
                  <div className="flex-1 h-0.5 bg-brand-emerald-600" />
                )}
              </React.Fragment>
            ))}
          </div>

          <ul className="space-y-4 mb-8">
            {quitaSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-semibold">
                <Check className="w-4 h-4 text-brand-emerald-650 flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-brand-emerald-500/10 pt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Esforço Estimado:</span>
          <span className="text-xs font-bold text-brand-emerald-700 bg-brand-emerald-50 border border-brand-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Menos de 10 minutos
          </span>
        </div>
      </Card>
    </div>
  );
};
