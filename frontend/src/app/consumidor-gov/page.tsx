import React from "react";
import { Metadata } from "next";
import { SeoLayout } from "@/components/ui/seo-layout";
import { SeoCta } from "@/components/ui/seo-cta";
import { CheckCircle2, ChevronRight, BookOpen, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Consumidor Gov: Reclame de Bancos e Negocie Dívidas Grátis",
  description: "Saiba como funciona o Consumidor.gov.br. Guia passo a passo para registrar reclamações contra bancos, contestar juros abusivos e buscar acordos rápidos.",
  keywords: ["consumidor gov", "reclamar banco consumidor gov", "consumidor gov br", "negociar divida consumidor gov", "portal consumidor"],
  alternates: {
    canonical: `${SITE_URL}/consumidor-gov`,
  },
  openGraph: {
    title: "Consumidor Gov: Reclame de Bancos e Negocie Dívidas Grátis",
    description: "Saiba como funciona o Consumidor.gov.br. Guia passo a passo para registrar reclamações contra bancos, contestar juros abusivos e buscar acordos rápidos.",
    url: `${SITE_URL}/consumidor-gov`,
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Consumidor Gov: Reclame de Bancos e Negocie Dívidas Grátis",
    description: "Saiba como funciona o Consumidor.gov.br. Guia passo a passo para registrar reclamações contra bancos, contestar juros abusivos e buscar acordos rápidos.",
    images: [`${SITE_URL}/og-image.png`],
  }
};

const faqs = [
  {
    question: "O que é o Consumidor.gov.br?",
    answer: "O Consumidor.gov.br é um serviço público federal gratuito que conecta diretamente consumidores e empresas para solucionar conflitos de consumo de forma rápida e desburocratizada, totalmente online."
  },
  {
    question: "Como funciona a plataforma Consumidor.gov.br?",
    answer: "O consumidor faz o cadastro, relata o ocorrido e anexa as provas. A empresa tem o dever de ler, analisar e apresentar uma proposta de resolução em até 15 dias corridos."
  },
  {
    question: "O Consumidor.gov.br substitui o Procon?",
    answer: "Não. Ele funciona como uma ferramenta de negociação voluntária direta. Caso o problema não seja resolvido, o consumidor ainda pode recorrer ao Procon físico ou aos Juizados Especiais Cíveis."
  },
  {
    question: "Quais bancos posso reclamar no Consumidor.gov.br?",
    answer: "Praticamente todas as principais instituições financeiras em funcionamento no Brasil estão cadastradas (Ex: Itaú, Bradesco, Santander, Banco do Brasil, Caixa, Nubank, Inter)."
  },
  {
    question: "Qual o prazo para resposta dos bancos?",
    answer: "As instituições cadastradas na plataforma têm o prazo legal de até 15 dias corridos para enviar a resposta final ao consumidor."
  },
  {
    question: "As reclamações no portal são públicas?",
    answer: "Os textos das reclamações e respostas são públicos (sem exibir dados sensíveis dos usuários), servindo como banco de dados e gerando estatísticas de resolutividade para as agências de controle."
  },
  {
    question: "O Consumidor.gov.br ajuda a negociar dívidas?",
    answer: "Sim. É um dos canais mais eficazes para solicitar propostas de quitação com descontos significativos, renegociar contratos de juros abusivos e corrigir erros cadastrais no SCR."
  },
  {
    question: "E se o banco não responder ou a resposta for insatisfatória?",
    answer: "A reclamação é encerrada como 'Não Resolvida'. Isso gera um protocolo oficial documentado que serve como prova de tentativa de acordo amigável prévia em eventual processo judicial."
  }
];

export default function ConsumidorGovPage() {
  const faqSchema = {
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Consumidor Gov",
        "item": `${SITE_URL}/consumidor-gov`
      }
    ]
  };

  return (
    <SeoLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-6">
          <span>Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-600">Consumidor Gov</span>
        </div>

        {/* Hero Area */}
        <div className="space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Resolução de Conflitos</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Consumidor Gov: Como Funciona para Reclamar de Bancos
          </h1>
          <p className="text-base sm:text-lg text-slate-650 font-medium">
            Entenda o funcionamento da maior plataforma de conciliação do Governo Federal. Veja como formalizar reclamações, negociar taxas e reaver cobranças abusivas de forma digital.
          </p>
        </div>

        {/* 1. Resumo Rápido */}
        <section className="mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            1. Resumo Rápido
          </h2>
          <p className="text-slate-650 text-sm leading-relaxed">
            O portal <strong>Consumidor.gov.br</strong> é mantido pela Secretaria Nacional do Consumidor (Senacon). Com índices de solução superiores a 80%, ele atua como um canal direto de alto nível com os setores de qualidade e ouvidoria das instituições bancárias. Registrar uma reclamação ali munido do relatório de dívidas do Registrato força a diretoria do banco a analisar detalhadamente o seu pleito.
          </p>
        </section>

        {/* 2. Passo a Passo */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            2. Passo a Passo para Registrar sua Reclamação
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              "Acesse consumidor.gov.br e clique no botão 'Entrar com Gov.br'.",
              "Digite o nome da instituição financeira no buscador de empresas e selecione-a.",
              "Clique em 'Registrar Reclamação'.",
              "Insira os dados do contrato, fatura ou relacionamento a ser contestado.",
              "No campo de texto, insira os argumentos legais e detalhes da dívida (copie o texto gerado pela IA do Quita).",
              "Anexe o dossiê probatório ou o PDF do Registrato contendo o prejuízo ou erro.",
              "Envie o formulário e monitore a resposta do banco pelo painel nos próximos 15 dias."
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
            3. Checklist para Garantir uma Reclamação de Sucesso
          </h2>
          <ul className="space-y-3">
            {[
              "Nome da instituição financeira exatamente conforme cadastrado.",
              "Número da conta, do contrato de empréstimo ou do cartão de crédito envolvido.",
              "Texto de reclamação claro, fundamentado em direitos e sem ofensas.",
              "PDF do Registrato do Banco Central anexado como prova principal do erro ou da cobrança abusiva.",
              "Acesso regular ao e-mail cadastrado para não perder notificações da plataforma."
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
            Reclamar no portal Consumidor.gov.br de forma fundamentada é a maneira mais prática e de menor custo para o cidadão resolver conflitos de juros abusivos ou cadastros indevidos no SCR. Munido de bons argumentos e provas claras do Registrato, a probabilidade de um acordo favorável é altíssima.
          </p>
        </section>

        {/* Context CTA */}
        <SeoCta />
      </div>
    </SeoLayout>
  );
}
