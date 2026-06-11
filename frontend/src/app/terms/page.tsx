"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite-100 text-brand-petroleo font-sans antialiased flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-brand-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
              Q
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-petroleo">
              Quita<span className="text-brand-emerald-500">.</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold text-slate-550 hover:text-brand-emerald-650 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para a Home
          </Link>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
          <div className="bg-brand-emerald-50 p-2.5 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-petroleo tracking-tight">
              Termos de Uso
            </h1>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Última atualização: Junho de 2026
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
          <p className="text-base text-slate-700 font-medium leading-relaxed">
            Ao utilizar o Quita, você concorda expressamente com os Termos de Uso descritos abaixo. Recomendamos a leitura cuidadosa deste documento antes de utilizar nossos serviços. Caso não concorde com qualquer disposição aqui estabelecida, solicitamos que não faça uso da plataforma.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">1. Finalidade do serviço</h2>
            <p>
              O Quita fornece ferramentas tecnológicas automatizadas destinadas exclusivamente a auxiliar consumidores na organização, leitura técnica e compreensão de dados financeiros extraídos de relatórios oficiais do Registrato do Banco Central do Brasil.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">2. O que o Quita NÃO faz</h2>
            <p className="font-semibold text-rose-955 bg-rose-50/50 border border-rose-200/50 p-3 rounded-lg text-xs leading-relaxed">
              <strong>ISENÇÃO DE ASSESSORIA JURÍDICA:</strong> O Quita NÃO presta qualquer modalidade de consultoria, assessoria jurídica ou representação advocatícia. Nossos serviços não substituem a análise de um advogado, defensor público ou órgão oficial de defesa do consumidor. Nós não representamos usuários em juízo ou perante agências reguladoras ou instituições financeiras privadas.
            </p>
            <p>
              Ademais, o Quita não garante desfechos favoráveis, descontos nas dívidas ou êxito administrativo/judicial decorrentes da utilização das petições e contestações sugeridas pela plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">3. Responsabilidade do usuário</h2>
            <p>Como usuário da plataforma, você assume inteira e exclusiva responsabilidade por:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Fornecer documentos legítimos e informações estritamente verídicas;</li>
              <li>Revisar minuciosamente todo o texto final das reclamações geradas por Inteligência Artificial antes de utilizá-las;</li>
              <li>Tomar a decisão final e voluntária de formalizar ou não o envio dos documentos produzidos;</li>
              <li>Realizar de forma autônoma o protocolo da reclamação final nos canais oficiais de negociação (como Consumidor.gov.br ou Banco Central).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">4. Uso de Inteligência Artificial</h2>
            <p>
              As minutas de reclamação geradas pelo sistema utilizam modelos de Inteligência Artificial com propósitos assistivos de estruturação de texto. O usuário está ciente de que IA pode cometer erros ou apresentar formulações imprecisas. Portanto, <strong>a revisão humana detalhada pelo usuário é obrigatória</strong> antes de qualquer utilização oficial da peça gerada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">5. Uso adequado da plataforma</h2>
            <p>Você se compromete a não utilizar o Quita para:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Upload de arquivos fraudulentos, falsificados ou pertencentes a terceiros sem a devida autorização legal;</li>
              <li>Práticas que caracterizem crimes cibernéticos, fraudes financeiras ou difamações;</li>
              <li>Explorar, sondar ou violar vulnerabilidades técnicas do software e servidores da plataforma;</li>
              <li>Tentar descompilar, engenharia reversa ou plagiar o código-fonte da aplicação.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">6. Propriedade Intelectual</h2>
            <p>
              Todos os elementos de design, algoritmos de leitura, marcas, interfaces gráficas e códigos desenvolvidos pelo Quita são de nossa propriedade intelectual exclusiva, protegidos pela legislação de direitos autorais e propriedade industrial vigente. O usuário retém a propriedade exclusiva e o direito de uso ilimitado de todos os seus dados cadastrais, informações de dívidas e minutas que venha a gerar.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">7. Limitação de responsabilidade</h2>
            <p>
              O Quita não poderá ser responsabilizado por perdas ou danos indiretos de qualquer natureza decorrentes de:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Negativas de acordos ou insucessos em processos por parte das instituições credoras;</li>
              <li>Eventual indisponibilidade temporária de serviços externos integrados (como provedores de IA ou plataformas do governo);</li>
              <li>Decisões de renegociação tomadas voluntariamente pelo usuário com base nas simulações e dados da plataforma.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">8. Integração com Consumidor.gov.br e Canais Oficiais</h2>
            <p>
              O Quita não possui parcerias comerciais, representações institucionais ou vinculação oficial com a plataforma Consumidor.gov.br ou com o Banco Central do Brasil. O serviço destina-se puramente a auxiliar o cidadão a formatar sua petição de maneira mais clara e fundamentada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">9. Suspensão de contas</h2>
            <p>
              Reservamo-nos o direito de suspender ou encerrar de forma imediata o acesso à plataforma de qualquer usuário em caso de violação grave destes Termos de Uso, tentativas de invasão, uso abusivo de recursos de IA ou indícios de atividades fraudulentas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">10. Alterações destes Termos</h2>
            <p>
              Estes Termos de Uso poderão ser atualizados a qualquer tempo. O uso continuado das nossas ferramentas após a publicação de novos termos constitui aceitação tácita e integral de todas as modificações por parte do usuário.
            </p>
          </section>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 mt-auto">
        <p>© {new Date().getFullYear()} Quita. Todos os direitos reservados. Termos e condições gerais de uso da plataforma.</p>
      </footer>
    </div>
  );
}
