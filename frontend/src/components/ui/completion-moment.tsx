import React from "react";
import { CheckCircle, ArrowRight, ExternalLink } from "lucide-react";
import { RecoveryMap } from "./recovery-map";
import { Button } from "./button";

interface CompletionMomentProps {
  institution: string;
  onFinish: () => void;
  className?: string;
}

export const CompletionMoment: React.FC<CompletionMomentProps> = ({
  institution,
  onFinish,
  className = "",
}) => {
  return (
    <div className={`space-y-6 text-center max-w-2xl mx-auto py-4 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-brand-emerald-50 border border-brand-emerald-150 flex items-center justify-center text-brand-emerald-600 mb-2">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-brand-petroleo">Sua rota foi concluída!</h2>
        <p className="text-xs text-slate-505 max-w-sm">
          A contestação contra o <strong>{institution}</strong> foi devidamente estruturada. Acompanhe a seguir o checklist de envio.
        </p>
      </div>

      {/* Large scale map showing fully completed path */}
      <RecoveryMap state={5} showYouAreHere={true} className="max-w-[480px] mx-auto" />

      <div className="bg-brand-emerald-50/50 border border-brand-emerald-500/10 p-4.5 rounded-2xl text-xs text-brand-emerald-750 font-semibold leading-relaxed text-left space-y-2.5">
        <p className="font-bold text-brand-petroleo text-sm mb-1">💡 Lembretes Importantes para o Envio:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Copie a petição elaborada no Passo 10;</li>
          <li>Acesse a plataforma oficial <a href="https://www.consumidor.gov.br" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">Consumidor.gov.br <ExternalLink className="w-3 h-3" /></a>;</li>
          <li>Anexe o PDF formatado do Quita juntamente com o seu relatório Registrato original.</li>
        </ul>
      </div>

      <div className="pt-4 flex justify-center">
        <Button variant="primary" onClick={onFinish} className="w-full sm:w-auto h-12">
          Ver meu Painel Geral <ArrowRight className="w-5 h-5 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
