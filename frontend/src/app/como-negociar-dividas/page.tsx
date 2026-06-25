import React from "react";
import { Metadata } from "next";
import { SeoLayout } from "@/components/ui/seo-layout";
import { SeoCta } from "@/components/ui/seo-cta";
import { CheckCircle2, ChevronRight, BookOpen, Clock, ShieldCheck, Scale } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Como Negociar Dívidas Bancárias e Sair do Prejuízo",
  description: "Aprenda como negociar dívidas bancárias passo a passo. Saiba quais são seus direitos e como usar o Consumidor.gov.br para obter descontos agressivos.",
  keywords: ["como negociar dividas bancarias", "negociar divida banco", "quitar emprestimo desconto", "desconto divida bancaria"],
  alternates: {
    canonical: `${siteUrl}/como-negociar-dividas`,
  },
  openGraph: {
    title: "Como Negociar Dívidas Bancárias e Sair do Prejuízo",
    description: "Aprenda como negociar dívidas bancárias passo a passo. Saiba quais são seus direitos e como usar o Consumidor.gov.br para obter descontos agressivos.",
    url: `${siteUrl}/como-negociar-dividas`,
    images: [`${siteUrl}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Como Negociar Dívidas Bancárias e Sair do Prejuízo",
    description: "Aprenda como negociar dívidas bancárias passo a passo. Saiba quais são seus direitos e como usar o Consumidor.gov.br para obter descontos agressivos.",
    images: [`${siteUrl}/og-image.png`],
  }
};

const faqs = [
  {
    question: "Qual o melhor momento para negociar uma dívida?",
    answer: "Geralmente, as instituições oferecem melhores descontos quando a dívida tem mais de 90 a 180 dias de atraso, pois ela é provisionada como perda operacional e o banco prefere recuperar parte do valor."
  },
  {
    question: "O banco pode tomar meus bens por dívida de cartão?",
    answer: "Apenas sob ordem judicial após um processo de execução, e mesmo assim a lei protege bens essenciais como o único imóvel de residência (bem de família) e ferramentas de trabalho."
  },
  {
    question: "O que é venda casada em negociação de dívida?",
    answer: "Ocorre quando o banco exige a contratação de outro serviço (como seguro de vida ou título de capitalização) como condição para fechar o acordo de renegociação. Essa prática é considerada ilegal pelo CDC."
  },
  {
    question: "Como funciona a portabilidade de crédito?",
    answer: "Você pode transferir sua dívida de juros mais altos para outro banco que ofereça taxas de juros mais baixas, reduzindo o valor das parcelas mensais sem custos adicionais."
  },
  {
    question: "Pagar dívida com desconto afeta meu score?",
    answer: "No Serasa, o score volta a subir assim que o nome é limpo. No entanto, no SCR do Banco Central pode constar um registro de quitação com prejuízo parcial caso o desconto tenha sido muito agressivo."
  }
];

export default function ComoNegociarDividasPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Como Negociar Dívidas",
        "item": `${siteUrl}/como-negociar-dividas`
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
          <span className="text-emerald-600">Como negociar dívidas</span>
        </div>

        {/* Hero Area */}
        <div className="space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Táticas de Renegociação</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Como Negociar Dívidas Bancárias com Descontos Reais
          </h1>
          <p className="text-base sm:text-lg text-slate-655 font-medium">
            Entenda como negociar juros, lidar com escritórios de cobrança terceirizados e usar seus direitos legais para obter descontos em empréstimos e cartões de crédito.
          </p>
        </div>

        {/* 1. Resumo Rápido */}
        <section className="mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            1. Resumo Rápido
          </h2>
          <p className="text-slate-650 text-sm leading-relaxed">
            Saber <strong>como negociar dívidas bancárias</strong> requer compreender as margens internas que as instituições têm para dar descontos. Os bancos costumam cobrar taxas de juros extorsivas no atraso, mas estão abertos a reduções substanciais para evitar perdas totais. Utilizar contestações embasadas no Consumidor.gov.br é a maneira mais eficiente de obter essas ofertas sem intermediários.
          </p>
        </section>

        {/* 2. Passo a Passo */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            2. Passo a Passo para Renegociar suas Dívidas
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              "Consulte seu Registrato para mapear o saldo original e o juro cobrado até o momento.",
              "Compare a taxa do seu contrato com as médias de juros da mesma categoria no Banco Central.",
              "Defina a sua capacidade real de pagamento (quanto tem disponível à vista ou em parcelas mensais).",
              "Utilize o Quita para redigir a contestação indicando tarifas ilegais e juros abusivos no contrato.",
              "Protocole a manifestação no Consumidor.gov.br direcionada ao canal do banco credor.",
              "Evite aceitar a primeira proposta por telefone de empresas terceirizadas de cobrança.",
              "Exija o envio do boleto oficial de quitação com o respectivo termo de acordo por escrito antes de pagar qualquer valor."
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
            3. Checklist do Negociador
          </h2>
          <ul className="space-y-3">
            {[
              "Valores originais e atuais da dívida documentados no SCR.",
              "Comprovação de renda recente para subsidiar a proposta de acordo.",
              "Cópia do contrato inicial com a discriminação dos juros mensais e anuais.",
              "Contestação estruturada de taxas e tarifas ilegais embutidas.",
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
            Obter uma negociação justa e sustentável depende de estar bem informado e munido de ferramentas tecnológicas corretas. Organizando seus dados e enviando propostas embasadas no Consumidor.gov, a chance de quitar suas pendências com até 90% de desconto é altamente viável.
          </p>
        </section>

        {/* Context CTA */}
        <SeoCta />
      </div>
    </SeoLayout>
  );
}
