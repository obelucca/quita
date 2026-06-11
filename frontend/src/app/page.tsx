"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Sparkles,
  ChevronDown,
  HelpCircle,
  Compass,
  Building,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecoveryMap } from "@/components/ui/recovery-map";
import { BureaucracyComparison } from "@/components/ui/bureaucracy-comparison";

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const steps = [
    {
      number: "01",
      title: "Baixe seu Registrato",
      description:
        "Obtenha o relatório oficial do Banco Central reunindo suas operações de crédito.",
    },
    {
      number: "02",
      title: "Entenda suas dívidas",
      description:
        "O assistente interpreta o arquivo de forma legível e sem codificações técnicas.",
    },
    {
      number: "03",
      title: "Gere sua reclamação",
      description:
        "Nossa inteligência artificial estrutura uma petição fundamentada nas regras do BC.",
    },
    {
      number: "04",
      title: "Envie ao portal oficial",
      description:
        "Copie o texto gerado e anexe ao Consumidor.gov.br em poucos cliques.",
    },
  ];

  const faqs = [
    {
      q: "Preciso pagar para usar o Quita?",
      a: "Não. A análise inicial e a elaboração da primeira reclamação baseada no Registrato são gratuitas. Oferecemos opções Premium caso necessite contestar múltiplos credores adicionais.",
    },
    {
      q: "Preciso de advogado para esta contestação?",
      a: "Não. O canal Consumidor.gov.br e as ouvidorias do Banco Central são vias públicas projetadas para mediação direta entre cidadãos e instituições financeiras.",
    },
    {
      q: "O Quita negocia dívidas diretamente?",
      a: "Não negociamos ou compramos dívidas. O Quita é um assistente digital que simplifica a visualização do seu Registrato e gera contestações fundamentadas.",
    },
    {
      q: "O que é o Registrato?",
      a: "É um sistema seguro do Banco Central que centraliza todas as suas contas bancárias, empréstimos e cartões de crédito sob seu CPF.",
    },
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite-100 text-brand-petroleo font-sans antialiased">
      {/* Header */}
      <header className="border-b border-slate-200 bg-brand-offwhite-50/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-emerald-600 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              Q
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-petroleo">
              Quita<span className="text-brand-emerald-500">.</span>
            </span>
          </div>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-slate-600 hover:text-brand-petroleo transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/wizard">
                  <Button variant="primary" className="py-2 px-4 text-xs h-9">
                    Iniciar Assistente
                  </Button>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-slate-500 hover:text-rose-650 transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm font-semibold text-slate-650 hover:text-brand-petroleo transition-colors"
                >
                  Entrar
                </Link>
                <Link href="/auth?tab=register">
                  <Button variant="primary" className="py-2 px-4 text-xs h-9">
                    Começar Grátis
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Seção 1 — Hero */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Side: Headline & Badge */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-brand-emerald-500/15 bg-brand-emerald-50/50 text-brand-emerald-750 text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-emerald-600" />
                  <span>Obtenção guiada do Relatório Registrato</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-petroleo leading-[1.1]"
                >
                  Suas dívidas têm um nome. <br />
                  <span className="text-brand-emerald-600">Agora você vai entender todos eles.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-medium"
                >
                  O Quita traduz relatórios financeiros complexos em um caminho visual compreensível, gerando petições fundamentadas em normas do Banco Central.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
                >
                  <Link href={isAuthenticated ? "/wizard" : "/auth?tab=register"}>
                    <Button variant="primary" className="w-full sm:w-auto px-8 py-4 text-base">
                      Começar gratuitamente
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <a href="#como-funciona" className="w-full sm:w-auto">
                    <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-base">
                      Entenda o fluxo
                    </Button>
                  </a>
                </motion.div>
              </div>

              {/* Right Side: Recovery Map (State 2 - Descoberta) */}
              <div className="lg:col-span-5 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <RecoveryMap state={2} showYouAreHere={true} className="w-full" />
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* Seção 2 — O Problema (Editorial Style) */}
        <section className="py-20 bg-brand-offwhite-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="text-brand-orange bg-amber-50 border border-brand-orange/20 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Cenário de Crédito no Brasil
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-petroleo leading-tight">
                  Você não está sozinho nesta jornada de recuperação.
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed max-w-lg font-medium">
                  A maioria das pessoas não contesta cobranças incorretas ou taxas abusivas porque a linguagem bancária e os relatórios oficiais são deliberadamente complexos.
                </p>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-white border-slate-200 p-6 flex flex-col justify-between shadow-sm">
                  <div className="p-2 bg-brand-emerald-50 text-brand-emerald-650 w-9 h-9 rounded-lg flex items-center justify-center mb-4">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-extrabold text-brand-petroleo font-mono leading-none">82.8M</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Inadimplentes</p>
                    <p className="text-[11px] text-slate-550 mt-1 leading-normal">Brasileiros registrados com restrições ativas em órgãos de crédito.</p>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 p-6 flex flex-col justify-between shadow-sm">
                  <div className="p-2 bg-brand-emerald-50 text-brand-emerald-650 w-9 h-9 rounded-lg flex items-center justify-center mb-4">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-extrabold text-brand-petroleo font-mono leading-none">R$ 557B</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Saldo Total</p>
                    <p className="text-[11px] text-slate-550 mt-1 leading-normal">Volume acumulado de juros e endividamentos ativos sob averiguação.</p>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </section>

        {/* Seção 3 — O que esperam que você faça */}
        <section className="py-20 bg-brand-offwhite-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-brand-petroleo sm:text-4xl">
                O que o sistema espera versus o que o Quita faz
              </h2>
              <p className="text-slate-600 text-sm font-medium">
                Desmistificando o processo de retificação cadastral de empréstimos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* O sistema espera */}
              <div className="bg-brand-offwhite-50 border border-slate-200 p-6 sm:p-8 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wider text-xs">O sistema tradicional espera que você:</h3>
                <ul className="space-y-3 text-xs text-slate-600 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Consiga decifrar o código de operações do Registrato (SCR) sem assistência.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Encontre os canais específicos de ouvidoria regulados para cada banco.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Tenha domínio prévio das normativas vigentes do Banco Central do Brasil.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Escreva petições estruturadas formalmente sob linguagem técnica e jurídica.</span>
                  </li>
                </ul>
              </div>

              {/* O Quita ajuda */}
              <div className="bg-brand-emerald-50/20 border border-brand-emerald-500/10 p-6 sm:p-8 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-brand-emerald-700 uppercase tracking-wider text-xs">O Quita ajuda você a:</h3>
                <ul className="space-y-3 text-xs text-brand-petroleo font-bold">
                  <li className="flex items-start gap-2.5">
                    <span className="text-brand-emerald-600 font-bold">•</span>
                    <span>Ver uma síntese traduzida e limpa de todas as pendências ativas.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-brand-emerald-600 font-bold">•</span>
                    <span>Localizar exatamente a credora correspondente para a sua reclamação.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-brand-emerald-600 font-bold">•</span>
                    <span>Reunir as fundamentações jurídicas certas fornecidas pela nossa IA.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-brand-emerald-600 font-bold">•</span>
                    <span>Concluir o envio prático através de um roteiro linear com checklist.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 4 — Comparativo de Caminhos (BureaucracyComparison) */}
        <section className="py-20 bg-brand-offwhite-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-brand-petroleo sm:text-4xl">
                Compare as rotas de resolução
              </h2>
              <p className="text-slate-600 text-sm font-medium">
                Veja o impacto prático de ter um guia na contestação de seus registros.
              </p>
            </div>

            <BureaucracyComparison />
          </div>
        </section>

        {/* Seção 5 — Como Funciona (Roteiro Conectado) */}
        <section id="como-funciona" className="py-20 bg-brand-offwhite-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-brand-petroleo sm:text-4xl">
                O passo a passo para se defender
              </h2>
              <p className="text-slate-600 text-sm font-medium">
                Uma rota linear desenhada do início ao fim sem atritos.
              </p>
            </div>

            {/* Connecting Step Nodes via Flex path */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <Card className="h-full bg-white border-slate-200 p-6 flex flex-col justify-between shadow-sm relative group hover:border-brand-emerald-500/25 transition-all">
                    <div>
                      {/* Highlight route link */}
                      <span className="text-3xl font-extrabold text-brand-emerald-600/10 group-hover:text-brand-emerald-600/25 transition-colors block mb-4 font-mono">
                        {step.number}
                      </span>
                      <h3 className="text-base font-bold text-brand-petroleo mb-2">{step.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.description}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seção 6 — Manifesto Quita */}
        <section className="py-24 bg-gradient-to-b from-brand-offwhite-100 to-brand-offwhite-200 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
            <Compass className="w-10 h-10 text-brand-emerald-600 mx-auto" />
            <h2 className="text-slate-500 uppercase tracking-widest text-[11px] font-bold">Manifesto Quita</h2>
            <blockquote className="text-xl sm:text-2xl font-medium italic text-slate-700 leading-relaxed max-w-2xl mx-auto">
              &ldquo;Ninguém deveria precisar de um diploma em direito bancário para entender uma carta do banco ou retificar informações cadastrais.&rdquo;
            </blockquote>
            <div className="pt-2 space-y-1">
              <p className="text-xs font-semibold text-brand-petroleo">Nossa Missão Social</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-normal font-medium">
                Acreditamos na autonomia do cidadão para contestar bancos usando dados legítimos.
              </p>
            </div>
          </div>
        </section>

        {/* Seção 7 — Segurança & LGPD */}
        <section className="py-20 bg-brand-offwhite-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-6">
                <span className="text-brand-emerald-600 bg-brand-emerald-50 border border-brand-emerald-500/10 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Privacidade & LGPD
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-brand-petroleo sm:text-4xl">
                  Seus dados financeiros protegidos.
                </h2>
                <p className="text-slate-600 leading-relaxed text-xs font-medium">
                  Não salvamos relatórios originais indefinidamente nem compartilhamos dados com intermediários. Todo o processamento é isolado de ponta a ponta.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex gap-4">
                    <div className="bg-brand-emerald-50 border border-brand-emerald-100 p-2 h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-emerald-650">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-petroleo text-sm">Criptografia e Isolamento</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-normal">Os PDFs do Registrato são descartados após o processamento da IA.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line-art editorial layout replacing generic padlock */}
              <div className="flex justify-center">
                <div className="border border-slate-200 rounded-3xl p-6 bg-white w-full max-w-md space-y-4 shadow-sm">
                  <div className="h-2 bg-slate-100 rounded-full w-1/3" />
                  <div className="space-y-2.5">
                    <div className="h-4 bg-slate-100 rounded-lg w-full" />
                    <div className="h-4 bg-slate-100 rounded-lg w-5/6" />
                    <div className="h-4 bg-slate-100 rounded-lg w-4/5" />
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[10px] font-semibold text-brand-emerald-700 bg-brand-emerald-50/50 p-3.5 rounded-xl">
                    <span>STATUS DE PRIVACIDADE: ATIVO</span>
                    <span>Conformidade com a LGPD</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Seção 8 — FAQ */}
        <section className="py-20 bg-brand-offwhite-100 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-brand-petroleo sm:text-4xl">
                Perguntas Frequentes
              </h2>
              <p className="text-slate-550 text-xs font-semibold">
                Respostas diretas sobre o funcionamento do Quita.
              </p>
            </div>

            <div className="space-y-3.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all shadow-sm">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-brand-petroleo flex items-center gap-2.5 text-xs sm:text-sm">
                      <HelpCircle className="w-4.5 h-4.5 text-brand-emerald-600 flex-shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        activeFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-4.5 pt-1.5 text-xs text-slate-550 border-t border-slate-100 bg-brand-offwhite-100/60 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seção 9 — CTA Final (Fully Completed Recovery Map) */}
        <section className="py-20 bg-brand-offwhite-50 border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-brand-petroleo sm:text-4xl leading-tight">
                Você já sabe qual é o próximo passo. <br />
                <span className="text-brand-emerald-600">Nós mostramos a rota.</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Crie sua conta, envie seu Registrato de empréstimos e obtenha sua contestação fundamentada de forma simples.
              </p>
            </div>

            {/* Display State 5 (Conclusão) Map */}
            <div className="max-w-[460px] mx-auto opacity-90 shadow-sm rounded-3xl overflow-hidden">
              <RecoveryMap state={5} showYouAreHere={true} />
            </div>

            <div className="pt-2">
              <Link href={isAuthenticated ? "/wizard" : "/auth?tab=register"}>
                <Button variant="primary" className="px-10 py-4.5 text-base">
                  Começar agora gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-brand-offwhite-50 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Quita.</span>
            <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
          </div>
          <p className="max-w-md text-slate-400 text-center sm:text-right leading-relaxed font-medium">
            O Quita é uma ferramenta de processamento de dados informativos e formatação de contestações baseadas em inteligência artificial. Não fornecemos assessoria advocatícia.
          </p>
        </div>
      </footer>
    </div>
  );
}
