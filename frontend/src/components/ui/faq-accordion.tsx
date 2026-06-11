import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  onItemToggle?: (isOpen: boolean) => void;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ onItemToggle }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      q: "O Quita negocia minhas dívidas?",
      a: "Não. O Quita é uma plataforma informativa e de auxílio de redação baseada em inteligência artificial. Nós traduzimos os dados do Registrato e ajudamos você a formatar sua petição fundamentada nas regras do Banco Central, mas a negociação e decisão final de pagamento ficam sob sua inteira responsabilidade.",
    },
    {
      q: "O Quita envia reclamações automaticamente?",
      a: "Não enviamos reclamações de forma autônoma. O Quita funciona de forma assistida: nós estruturamos o texto exato com as fundamentações adequadas e fornecemos um checklist detalhado para que você copie o texto e submeta no portal oficial Consumidor.gov.br ou Ouvidorias das instituições financeiras.",
    },
    {
      q: "Preciso pagar para usar?",
      a: "A análise básica do relatório do Registrato e a elaboração da sua primeira minuta de contestação baseada nas informações extraídas são totalmente gratuitas. Oferecemos opções adicionais apenas caso precise de acompanhamento para múltiplos credores ou renegociações avançadas.",
    },
    {
      q: "Meus dados ficam armazenados?",
      a: "A segurança e privacidade são pilares essenciais. Processamos o arquivo Registrato de forma isolada, extraímos os dados necessários e deletamos o PDF original do servidor após a extração. Seus dados cadastrais e o rascunho da reclamação permanecem sob sua conta para que você possa baixar o PDF gerado a qualquer momento.",
    },
    {
      q: "Funciona para qualquer banco?",
      a: "Sim, funciona para qualquer instituição financeira regulada pelo Banco Central do Brasil. Qualquer banco, cooperativa de crédito ou emissora de cartão de crédito que registre dados no Sistema de Informações de Crédito (SCR) pode ser selecionado e contestado utilizando a minuta gerada.",
    },
  ];

  const toggle = (idx: number) => {
    const nextVal = openIdx === idx ? null : idx;
    setOpenIdx(nextVal);
    if (onItemToggle) {
      onItemToggle(nextVal !== null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3.5 text-left">
      {faqs.map((faq, idx) => {
        const isOpen = idx === openIdx;
        return (
          <div
            key={idx}
            className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-300 shadow-xs"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <span className="font-bold text-slate-800 flex items-center gap-3 text-sm">
                <HelpCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-emerald-650" : ""
                }`}
              />
            </button>
            
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-5 pt-1.5 text-xs sm:text-sm text-slate-600 border-t border-slate-100 bg-slate-50/40 leading-relaxed font-medium">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
