import React from "react";
import { Metadata } from "next";
import { SeoLayout } from "@/components/ui/seo-layout";
import { SeoCta } from "@/components/ui/seo-cta";
import { CheckCircle2, ChevronRight, BookOpen, Clock, ShieldCheck, MessageSquare } from "lucide-react";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Como Reclamar no Consumidor Gov: Passo a Passo Prático",
  description: "Aprenda como reclamar no Consumidor.gov.br e resolver problemas de dívidas, cobranças de juros e serviços bancários de forma digital e rápida.",
  keywords: ["como reclamar no consumidor.gov.br", "reclamar consumidor gov", "como fazer reclamacao banco", "consumidor gov"],
  alternates: {
    canonical: `${SITE_URL}/como-usar-consumidor-gov`,
  },
  openGraph: {
    title: "Como Reclamar no Consumidor Gov: Passo a Passo Prático",
    description: "Aprenda como reclamar no Consumidor.gov.br e resolver problemas de dívidas, cobranças de juros e serviços bancários de forma digital e rápida.",
    url: `${SITE_URL}/como-usar-consumidor-gov`,
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Como Reclamar no Consumidor Gov: Passo a Passo Prático",
    description: "Aprenda como reclamar no Consumidor.gov.br e resolver problemas de dívidas, cobranças de juros e serviços bancários de forma digital e rápida.",
    images: [`${SITE_URL}/og-image.png`],
  }
};

const faqs = [
  {
    question: "Como fazer uma reclamação que dê resultado?",
    answer: "A chave para uma reclamação de sucesso é a objetividade. Descreva o problema sem termos emocionais ou ofensivos, insira o número do contrato e anexe provas como o PDF do Registrato do Banco Central."
  },
  {
    question: "O banco é obrigado a responder no Consumidor.gov.br?",
    answer: "Sim. As empresas que aderem voluntariamente ao portal assumem o compromisso público e regulatório de responder a todas as contestações in até 15 dias corridos."
  },
  {
    question: "Posso reclamar no Consumidor.gov por cobrança indevida?",
    answer: "Sim, cobranças de juros abusivos, venda casada de seguros e tarifas de conta inativa não solicitadas são os temas mais comuns e com maior índice de resolução favorável na plataforma."
  },
  {
    question: "Preciso de advogado para reclamar no Consumidor.gov?",
    answer: "Não. A plataforma foi desenhada para a autocomposição direta entre o próprio consumidor e a empresa, sem intermediários ou custos processuais."
  },
  {
    question: "Como acompanhar a resposta da minha reclamação?",
    answer: "Você receberá notificações por e-mail sempre que houver movimentação e poderá responder às tréplicas diretamente pelo painel logado com o seu Gov.br."
  }
];

export default function ComoUsarConsumidorGovPage() {
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
        "name": "Como usar o Consumidor Gov",
        "item": `${SITE_URL}/como-usar-consumidor-gov`
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
          <span className="text-emerald-600">Como usar o Consumidor Gov</span>
        </div>

        {/* Hero Area */}
        <div className="space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reclamação Assistida</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Como Reclamar no Consumidor.gov.br Passo a Passo
          </h1>
          <p className="text-base sm:text-lg text-slate-655 font-medium">
            Entenda como funciona o preenchimento de petições e contestações contra bancos no portal oficial de acordos do Ministério da Justiça.
          </p>
        </div>

        {/* 1. Resumo Rápido */}
        <section className="mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            1. Resumo Rápido
          </h2>
          <p className="text-slate-650 text-sm leading-relaxed">
            Aprender <strong>como reclamar no consumidor.gov.br</strong> é fundamental para qualquer pessoa com cobranças abusivas. Trata-se de uma ferramenta muito mais eficiente e rápida do que canais convencionais de suporte. Com o auxílio das petições prontas do Quita, você entra em contato direto com a Ouvidoria e o setor de qualidade do banco, acelerando a solução.
          </p>
        </section>

        {/* 2. Passo a Passo */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            2. Passo a Passo para Redigir e Enviar
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              "Acesse consumidor.gov.br e faça login com seu CPF e senha do Gov.br.",
              "Procure pelo banco ou instituição financeira na caixa de busca.",
              "Clique em 'Nova Reclamação' e preencha a área de serviço (ex: Cartão, Empréstimo).",
              "Insira o número de identificação do contrato ou conta bancária.",
              "Copie o texto de petição estruturado pela inteligência artificial do Quita e cole no campo de relato.",
              "Anexe o arquivo de comprovação (por exemplo, o PDF extraído do Registrato).",
              "Revise os dados de contato e confirme o envio da contestação."
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
            3. Checklist de Evidências
          </h2>
          <ul className="space-y-3">
            {[
              "Cópia do extrato do SCR mostrando o lançamento de prejuízo ou vencido.",
              "Número do protocolo de atendimento prévio (se houver, ajuda a demonstrar que você tentou resolver).",
              "Dossiê em PDF ou comprovantes de taxas e faturas do cartão.",
              "Texto de contestação legal detalhado citando o Código de Defesa do Consumidor.",
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
            Saber como reclamar de forma correta e assertiva na plataforma Consumidor.gov.br garante ao consumidor do Quita a máxima taxa de sucesso em renegociações de juros abusivos e correções cadastrais.
          </p>
        </section>

        {/* Context CTA */}
        <SeoCta />
      </div>
    </SeoLayout>
  );
}
