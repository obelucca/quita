"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles, Clock, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecoveryBadge } from "@/components/ui/recovery-badge";
import { RecoveryMetric } from "@/components/ui/recovery-metric";
import { RouteCard } from "@/components/ui/route-card";
import { BrazilMap } from "@/components/ui/brazil-map";
import { HeroMockup } from "@/components/ui/hero-mockup";
import { ProductCarousel } from "@/components/ui/product-carousel";
import { SecurityIllustration } from "@/components/ui/security-illustration";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { RoadMapCta } from "@/components/ui/road-map-cta";
import { ManifestoMap } from "@/components/ui/manifesto-map";
import { AssistantDoodle } from "@/components/ui/assistant-doodle";

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuth();
  const [faqOpen, setFaqOpen] = React.useState(false);

  const fadeUp = {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.35, ease: "easeOut" as const },
  };

  const stagger = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.08 } },
    viewport: { once: true, margin: "-100px" },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              Q
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Quita<span className="text-emerald-500">.</span>
            </span>
          </div>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs font-bold text-slate-650 hover:text-slate-900 transition-colors"
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
                  className="text-xs font-bold text-slate-550 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-xs font-bold text-slate-650 hover:text-slate-900 transition-colors"
                >
                  Entrar
                </Link>
                <Link href="/auth?tab=register">
                  <Button variant="primary" className="py-2.5 px-4 text-xs h-9">
                    Começar Grátis
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-white border-b border-slate-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Emotion & Value Narrative */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Obtenção guiada e gratuita</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.35 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]"
                >
                  Você não precisa <br />
                  <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-600 bg-clip-text text-transparent">enfrentar bancos sozinho.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.35 }}
                  className="text-base sm:text-lg text-slate-650 max-w-xl leading-relaxed font-medium"
                >
                  O Quita interpreta o Registrato, organiza suas dívidas e transforma informações complexas em próximos passos claros.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.35 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
                >
                  <Link href={isAuthenticated ? "/wizard" : "/auth?tab=register"} className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full sm:w-auto px-8 py-4 text-base">
                      Começar gratuitamente
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <a href="#como-funciona" className="w-full sm:w-auto">
                    <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-base">
                      Ver como funciona
                    </Button>
                  </a>
                </motion.div>

                {/* Selo LGPD */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex items-center gap-2 text-slate-400 text-xs font-semibold pt-4"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Isolamento total de dados e conformidade estrita com a LGPD</span>
                </motion.div>
              </div>

              {/* Right Column: HeroMockup */}
              <div className="lg:col-span-5 flex justify-center">
                <HeroMockup />
              </div>

            </div>
          </div>
        </section>

        {/* SEÇÃO 1: O TAMANHO DO PROBLEMA */}
        <section className="py-20 bg-[#011410] border-b border-emerald-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <motion.div {...fadeUp} className="lg:col-span-5 space-y-5 text-left">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <span>Cenário Nacional de Endividamento</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  Você não está sozinho nesta jornada.
                </h2>
                <p className="text-emerald-100/70 text-sm leading-relaxed max-w-lg font-medium">
                  Milhões de brasileiros enfrentam cadastros de dívidas confusos e taxas que nem sempre sabem de onde vêm. O Quita nasceu para ser a ponte entre a complexidade bancária e a resolução.
                </p>
              </motion.div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <motion.div {...stagger} className="sm:col-span-5 space-y-6">
                  <RecoveryMetric
                    value="82.8M"
                    label="Brasileiros Inadimplentes"
                    description="Cidadãos registrados com alguma restrição ativa ou apuração de pendência financeira."
                  />
                  <RecoveryMetric
                    value="R$ 557B"
                    label="Volume Acumulado"
                    description="Total acumulado em juros e saldos devedores sob verificação."
                  />
                </motion.div>

                <motion.div {...fadeUp} className="sm:col-span-7">
                  <BrazilMap />
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* SEÇÃO 2: ANTES VS DEPOIS (BUREAUCRACY COMPARISON) */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                O que o sistema espera versus o que o Quita faz
              </h2>
              <p className="text-slate-600 text-sm font-semibold">
                Compare o processo de resolução de dívidas com ou sem o assistente.
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* ROTA SEM QUITA (Slate card, heavy feel) */}
              <RouteCard className="border-slate-200 p-6 sm:p-8 flex flex-col justify-between opacity-80 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded">Rota Tradicional</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Como resolver por conta própria</h3>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                      <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>Decifrar os relatórios SCR codificados do Banco Central sem suporte.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                      <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>Pesquisar e encontrar os canais específicos de Ouvidoria para cada banco.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                      <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>Estudar legislações financeiras e resoluções do BC do início ao fim.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                      <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>Redigir petições formais em termos jurídicos complexos manualmente.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                      <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>Achar os formulários adequados dentro do portal oficial Consumidor.gov.</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tempo estimado:</span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Várias horas ou dias
                  </span>
                </div>
              </RouteCard>

              {/* ROTA COM QUITA (Elevated emerald-shadowed card, active state) */}
              <RouteCard active gridBackground className="p-6 sm:p-8 flex flex-col justify-between glow-emerald">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <RecoveryBadge variant="emerald">Com o Assistente do Quita</RecoveryBadge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">A rota mais rápida e transparente</h3>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Enviar o PDF do Registrato de forma simples e segura.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Visualizar valores e credores extraídos automaticamente.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Gerar uma reclamação estruturada e fundamentada com IA.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Copiar o texto final pronto em menos de um minuto.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Seguir um checklist direto com links para o Consumidor.gov.</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-emerald-500/15 pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Tempo estimado:</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Menos de 10 minutos
                  </span>
                </div>
              </RouteCard>
            </motion.div>
          </div>
        </section>

        {/* SEÇÃO 3: VEJA O PRODUTO FUNCIONANDO (CAROUSEL) */}
        <section id="como-funciona" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Veja o produto funcionando
              </h2>
              <p className="text-slate-600 text-sm font-semibold">
                Uma demonstração real de como o Quita ajuda você a recuperar o controle em poucos passos.
              </p>
            </motion.div>

            <motion.div {...fadeUp}>
              <ProductCarousel />
            </motion.div>
          </div>
        </section>

        {/* SEÇÃO 4: MANIFESTO EDITORIAL */}
        <section className="py-24 bg-[#011410] border-b border-emerald-500/10 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* 60% Left Column (Manifesto Text) */}
              <motion.div {...fadeUp} className="lg:col-span-7 space-y-6 text-left">
                <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                <h2 className="text-emerald-450 uppercase tracking-widest text-[10px] font-bold">Nosso Manifesto</h2>
                
                <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white leading-relaxed tracking-tight">
                  &ldquo;Ninguém deveria precisar de um diploma em direito bancário para entender uma cobrança. <br className="hidden sm:inline" />
                  O Quita nasceu porque a informação existe, mas nem sempre é acessível. <br className="hidden sm:inline" />
                  Nosso papel é transformar burocracia em orientação.&rdquo;
                </blockquote>

                <p className="text-[12px] sm:text-sm text-emerald-100/70 max-w-lg leading-relaxed font-semibold">
                  Acreditamos no direito do cidadão de entender seus dados e se posicionar com autonomia.
                </p>
              </motion.div>

              {/* 40% Right Column (ManifestoMap) */}
              <motion.div {...fadeUp} className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[400px]">
                  <ManifestoMap />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 5: SEGURANÇA E LGPD */}
        <section className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <motion.div {...fadeUp} className="lg:col-span-7 space-y-6 text-left">
                <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Privacidade Total</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Seus dados financeiros permanecem sob seu controle.
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-semibold">
                  Seus dados são usados exclusivamente para orientar você — não para definir quem você é.
                </p>
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-550 leading-relaxed font-medium">
                    O Quita realiza o processamento do relatório de forma isolada. Não armazenamos relatórios indefinidamente, não construímos perfis de endividamento para terceiros e não compartilhamos nenhum dado com bancos ou agências de crédito.
                  </p>
                </div>
              </motion.div>

              <motion.div {...fadeUp} className="lg:col-span-5 flex justify-center">
                <SecurityIllustration />
              </motion.div>

            </div>
          </div>
        </section>

        {/* SEÇÃO 6: FAQ */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16 space-y-2 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Perguntas Frequentes
              </h2>
              <p className="text-slate-500 text-sm font-semibold">
                Tire suas dúvidas sobre o funcionamento, privacidade e gratuidade da plataforma.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* FAQ Accordion Column */}
              <motion.div {...fadeUp} className="lg:col-span-7">
                <FaqAccordion onItemToggle={(isOpen) => setFaqOpen(isOpen)} />
              </motion.div>

              {/* Assistant Doodle Column */}
              <motion.div {...fadeUp} className="lg:col-span-5 flex justify-center">
                <AssistantDoodle lookLeft={faqOpen} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 7: CTA FINAL */}
        <section className="relative py-28 bg-emerald-950 text-white overflow-hidden text-center">
          {/* Background Route Path */}
          <RoadMapCta />

          <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-8">
            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
                Comece gratuitamente. <br />
                <span className="text-emerald-350">Entenda quem está cobrando você.</span>
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-medium">
                Crie sua conta agora, faça o upload do Registrato e tome os próximos passos em menos de 10 minutos.
              </p>
            </div>

            <div className="pt-2">
              <Link href={isAuthenticated ? "/wizard" : "/auth?tab=register"}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-10 py-4.5 text-base font-bold shadow-lg shadow-emerald-900/40 transition-all hover:-translate-y-[2px] cursor-pointer">
                  Começar agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 text-sm">Quita.</span>
              <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 font-semibold">
              <Link href="/terms" className="hover:text-brand-emerald-600 transition-colors">Termos de Uso</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-brand-emerald-600 transition-colors">Política de Privacidade</Link>
            </div>
          </div>
          <p className="max-w-md text-slate-400 text-center sm:text-right leading-relaxed font-semibold">
            O Quita é uma plataforma independente. Não fornecemos assessoria jurídica ou representação advocatícia. Nosso objetivo é democratizar o acesso às contestações administrativas reguladas pelo Banco Central.
          </p>
        </div>
      </footer>
    </div>
  );
}
