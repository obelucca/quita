import React from "react";
import { Metadata } from "next";
import { SeoLayout } from "@/components/ui/seo-layout";
import { SeoCta } from "@/components/ui/seo-cta";
import { CheckCircle2, ChevronRight, BookOpen, Clock, ShieldCheck, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "O que é SCR Banco Central? Tudo Sobre Prejuízo e Nome Limpo",
  description: "Entenda o que é o SCR (Sistema de Informações de Crédito) do Banco Central, a diferença entre dívida a vencer e prejuízo, e como limpar seu nome no sistema.",
  keywords: ["o que e scr", "scr banco central", "prejuizo scr", "como limpar scr", "registrato scr"],
  alternates: {
    canonical: "https://quita.com.br/o-que-e-scr",
  },
};

const faqs = [
  {
    question: "O que é o SCR do Banco Central?",
    answer: "O SCR (Sistema de Informações de Crédito) é um banco de dados administrado pelo Banco Central que reúne informações enviadas mensalmente pelos bancos sobre as operações de crédito (empréstimos, cartões, financiamentos) contratadas por clientes."
  },
  {
    question: "O SCR é uma 'lista suja' do Banco Central?",
    answer: "Não oficialmente. Ele funciona como uma 'lista verde e vermelha', pois registra o histórico de bom pagador (parcelas em dia) e também os atrasos e prejuízos. No entanto, apontamentos de 'Prejuízo' funcionam como restrição interna nos bancos."
  },
  {
    question: "Quem pode consultar as informações do SCR?",
    answer: "O próprio consumidor (via Registrato) e as instituições financeiras que tenham sua autorização expressa no momento de uma simulação de empréstimo ou cadastro de conta."
  },
  {
    question: "Quais operações financeiras constam no SCR?",
    answer: "Todas as modalidades de empréstimos, financiamentos habitacionais e de veículos, limites de cheque especial, cartões de crédito contratados e avais concedidos, desde que somem valor igual ou superior a R$ 200,00."
  },
  {
    question: "Como tirar meu nome do SCR?",
    answer: "Para regularizar o SCR, você deve realizar o pagamento ou renegociação da dívida em aberto. Uma vez quitada, o banco atualizará o status da dívida para o futuro."
  },
  {
    question: "Quanto tempo demora para atualizar o SCR após pagar a dívida?",
    answer: "A instituição credora tem o dever de atualizar a informação de pagamento no sistema em até 5 dias úteis. A visualização no relatório oficial costuma ocorrer no mês seguinte."
  },
  {
    question: "O que significa 'prejuízo' no relatório do SCR?",
    answer: "Refere-se ao saldo devedor que não foi quitado no prazo e a instituição financeira registrou internamente como perda financeira irrecuperável."
  },
  {
    question: "O que significa 'a vencer' no SCR?",
    answer: "São parcelas de empréstimos, financiamentos ou faturas de cartão de crédito futuras que foram contratadas e estão dentro do prazo normal de vencimento, sem nenhum atraso."
  }
];

export default function OQueEScrPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <SeoLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-6">
          <span>Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-600">O que é SCR</span>
        </div>

        {/* Hero Area */}
        <div className="space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Histórico de Crédito</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            O que é SCR Banco Central? Guia Completo sobre Apontamentos
          </h1>
          <p className="text-base sm:text-lg text-slate-650 font-medium">
            Entenda como o Sistema de Informações de Crédito (SCR) do Banco Central impacta a sua aprovação de financiamentos e o que fazer se constar prejuízo no seu Registrato.
          </p>
        </div>

        {/* 1. Resumo Rápido */}
        <section className="mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            1. Resumo Rápido
          </h2>
          <p className="text-slate-650 text-sm leading-relaxed">
            O <strong>SCR Banco Central</strong> é o maior banco de dados de risco de crédito do país. As instituições o usam para avaliar o comportamento do consumidor. Se você tem parcelas a vencer, elas constam ali. Caso tenha atrasado ou quitado uma dívida com descontos agressivos, o banco reporta esse saldo restante como <strong>Prejuízo</strong>, criando uma barreira invisível que bloqueia novas linhas de crédito.
          </p>
        </section>

        {/* 2. Passo a Passo */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            2. Passo a Passo para Regularizar seu Relatório SCR
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              "Acesse seu Registrato e emita o extrato completo de 'Créditos e Financiamentos'.",
              "Identifique o mês exato e a instituição que fez o lançamento de 'Prejuízo'.",
              "Entre em contato com o banco para verificar se o valor corresponde a um saldo em aberto real.",
              "Se for referente a um acordo pago com desconto, certifique-se de que a quitação total foi processada.",
              "Para regularizações retroativas ou contestações de juros abusivos, elabore a petição com o Quita.",
              "Envie o questionamento via Consumidor.gov.br solicitando a baixa do apontamento restritivo.",
              "Após a resposta do banco, aguarde até 30 dias para a atualização das planilhas do Banco Central."
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-150">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm">
                  {idx + 1}
                </div>
                <p className="text-slate-655 text-sm font-medium self-center">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Checklist */}
        <section className="mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            3. Checklist de Identificação de Erros no SCR
          </h2>
          <ul className="space-y-3">
            {[
              "Dívidas que você já pagou há mais de 10 dias úteis e ainda constam como 'Vencido'.",
              "Bancos dos quais você nunca contratou empréstimos ou abriu contas ativos na listagem.",
              "Acordos quitados que constam erroneamente como prejuízo contínuo mês a mês.",
              "Taxa de juros anual cobrada acima do dobro da média de mercado no período do contrato.",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-650 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Perguntas Frequentes (FAQs) */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">4. Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/85">
                <h3 className="text-sm font-bold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-650 text-xs leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Conclusão */}
        <section className="mb-12 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">5. Conclusão</h2>
          <p className="text-slate-650 text-sm leading-relaxed">
            Estar com o nome regularizado no SCR do Banco Central é crucial para conseguir boas opções de financiamento ou limites no mercado financeiro. Diferente dos órgãos privados, o SCR exige uma postura ativa e embasada para eventuais contestações. Usar a tecnologia do Quita ajuda você a organizar essas contestações de maneira célere e em conformidade técnica.
          </p>
        </section>

        {/* Context CTA */}
        <SeoCta />
      </div>
    </SeoLayout>
  );
}
