import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SeoCta: React.FC = () => {
  return (
    <div className="relative my-12 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950 p-8 sm:p-12 text-white shadow-xl text-center max-w-4xl mx-auto">
      {/* Decorative Blur */}
      <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-emerald-505/10 blur-[80px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-emerald-505/10 blur-[80px] pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fácil, Rápido e Seguro</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight max-w-2xl mx-auto leading-tight">
          Obtenha seu relatório Registrato e gere sua manifestação gratuitamente no Quita.
        </h3>

        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Nossa inteligência artificial analisa seu SCR e constrói a petição ideal de contestação para o Consumidor.gov.br.
        </p>

        <div className="pt-2">
          <Link href="/wizard">
            <Button variant="primary" className="px-8 py-3.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-950/20">
              Começar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
