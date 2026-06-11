import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, HelpCircle, Check, Cpu, ArrowLeft, ArrowRight, ShieldCheck, Copy, ExternalLink } from "lucide-react";

interface CarouselStep {
  title: string;
  question: string;
  answer: string;
  visual: React.ReactNode;
}

export const ProductCarousel: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const steps: CarouselStep[] = [
    {
      title: "Envie seu Registrato",
      question: "O que acontece agora?",
      answer: "Você faz o upload do PDF oficial de empréstimos e financiamentos (SCR) emitido pelo Banco Central. O processamento é totalmente local e seguro.",
      visual: (
        <div className="w-full h-full flex flex-col justify-center items-center p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
          <Upload className="w-12 h-12 text-emerald-600 mb-3 animate-pulse" />
          <p className="text-xs font-bold text-slate-800 mb-1">arrastar_registrato.pdf</p>
          <p className="text-[10px] text-slate-400">PDF do Banco Central (Max 10MB)</p>
          
          <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-4">
            <motion.div
              className="bg-emerald-600 h-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            />
          </div>
          <span className="text-[9px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
            <Check className="w-3 h-3" /> Processando dados locais...
          </span>
        </div>
      ),
    },
    {
      title: "Descubra quem cobra você",
      question: "O que acontece agora?",
      answer: "Nossos algoritmos analisam o relatório e listam claramente todas as instituições credoras registradas sob seu CPF, decifrando códigos complexos.",
      visual: (
        <div className="w-full h-full flex flex-col justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Extrato traduzido</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-150 shadow-xs">
              <div>
                <p className="text-xs font-extrabold text-slate-900">BANCO ORIGINAL S.A.</p>
                <p className="text-[9px] text-slate-400">Tipo: Cartão de Crédito</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">R$ 2.774,19</span>
            </div>
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-150 shadow-xs">
              <div>
                <p className="text-xs font-extrabold text-slate-900">BANCO INTER S.A.</p>
                <p className="text-[9px] text-slate-400">Tipo: Crédito Pessoal</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">R$ 386,08</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Escolha qual contestar",
      question: "O que acontece agora?",
      answer: "Você seleciona qual instituição financeira deseja questionar. Caso existam outros credores que não aparecem no Registrato, você pode adicioná-los manualmente.",
      visual: (
        <div className="w-full h-full flex flex-col justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Selecionar para contestação</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-500 ring-1 ring-emerald-500/10 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">BANCO ORIGINAL S.A.</p>
                  <p className="text-[9px] text-emerald-700 font-semibold">Selecionado</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">R$ 2.774,19</span>
            </div>
            <div className="flex items-center justify-between bg-white/70 p-3 rounded-xl border border-slate-150 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-slate-300" />
                <div>
                  <p className="text-xs font-extrabold text-slate-800">BANCO INTER S.A.</p>
                  <p className="text-[9px] text-slate-400">Não selecionado</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">R$ 386,08</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Receba uma minuta estruturada",
      question: "O que acontece agora?",
      answer: "Nossa inteligência artificial cria uma contestação fundamentada sob as normas do Banco Central (como resoluções específicas do CMN) e o Código de Defesa do Consumidor.",
      visual: (
        <div className="w-full h-full flex flex-col justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">
          <div className="flex items-center gap-1 pb-2 border-b border-slate-200">
            <Cpu className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-[10px] font-bold text-slate-800">Minuta_Contestacao.txt</span>
          </div>
          <div className="font-mono text-[8px] text-slate-600 leading-relaxed bg-white border border-slate-150 p-2.5 rounded-lg flex-grow overflow-hidden my-2.5">
            <p className="font-bold text-slate-900">À OUVIDORIA DO BANCO ORIGINAL S.A.</p>
            <p>CONTESTAÇÃO DE REGISTRO INDEVIDO</p>
            <p className="text-emerald-700 font-semibold mt-1">
              Com fulcro nas Resoluções do Banco Central do Brasil, venho requerer a retificação...
            </p>
          </div>
          <div className="flex justify-between items-center text-[9px]">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Baseado em normas do BC
            </span>
            <button className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow-xs hover:bg-emerald-700">
              <Copy className="w-3 h-3" /> Copiar texto
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "Finalize com confiança",
      question: "O que acontece agora?",
      answer: "O Quita orienta você nas etapas finais: acessar o Consumidor.gov.br ou as Ouvidorias do banco, colar o texto gerado e submeter o protocolo de forma autônoma.",
      visual: (
        <div className="w-full h-full flex flex-col justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Checklist Final de Protocolo</p>
          <div className="space-y-2.5 text-left">
            <div className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
              <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Check className="w-3 h-3" />
              </div>
              <span>1. Copiar petição estruturada do Quita</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
              <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Check className="w-3 h-3" />
              </div>
              <span>2. Abrir o canal Consumidor.gov.br</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
              <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <span className="text-[8px] font-bold font-mono">▸</span>
              </div>
              <span className="flex items-center gap-1 text-emerald-800">
                3. Submeter reclamação e aguardar resposta 
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* TABS INDICATORS */}
      <div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-none justify-start md:justify-center gap-6 pb-2">
        {steps.map((step, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`
                pb-2
                text-xs 
                font-bold 
                border-b-2
                transition-all 
                duration-300
                cursor-pointer
                ${isActive
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
                }
              `}
            >
              {idx + 1}. {step.title}
            </button>
          );
        })}
      </div>

      {/* VIEWPORT AREA */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-2 sm:p-4">
        {/* NARRATIVE COLUMN */}
        <div className="md:col-span-5 space-y-4 text-left">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            {steps[activeIdx].question}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {steps[activeIdx].title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
            {steps[activeIdx].answer}
          </p>

          {/* CONTROLS */}
          <div className="flex items-center gap-3.5 pt-2">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors shadow-xs cursor-pointer"
              aria-label="Anterior"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-400">
              {activeIdx + 1} / {steps.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors shadow-xs cursor-pointer"
              aria-label="Próximo"
            >
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* VISUAL MOCKUP COLUMN */}
        <div className="md:col-span-7 h-[260px] sm:h-[300px] flex items-center justify-center relative overflow-hidden bg-slate-50/50 rounded-3xl p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full h-full"
            >
              {steps[activeIdx].visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
