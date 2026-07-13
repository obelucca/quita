import React from "react";
import { Metadata } from "next";
import { SeoLayout } from "@/components/ui/seo-layout";
import { SeoCta } from "@/components/ui/seo-cta";
import { CheckCircle2, ChevronRight, BookOpen, Clock, ShieldCheck, Download } from "lucide-react";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Como Tirar o Registrato: Passo a Passo Completo e Grátis",
  description: "Aprenda como tirar o Registrato do Banco Central de forma rápida e segura. Guia prático com os links oficiais e passo a passo com conta Gov.br.",
  keywords: ["como tirar o registrato", "obter registrato banco central", "como emitir registrato", "registrato gov br"],
  alternates: {
    canonical: `${SITE_URL}/como-obter-registrato`,
  },
  openGraph: {
    title: "Como Tirar o Registrato: Passo a Passo Completo e Grátis",
    description: "Aprenda como tirar o Registrato do Banco Central de forma rápida e segura. Guia prático com os links oficiais e passo a passo com conta Gov.br.",
    url: `${SITE_URL}/como-obter-registrato`,
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Como Tirar o Registrato: Passo a Passo Completo e Grátis",
    description: "Aprenda como tirar o Registrato do Banco Central de forma rápida e segura. Guia prático com os links oficiais e passo a passo com conta Gov.br.",
    images: [`${SITE_URL}/og-image.png`],
  }
};

const faqs = [
  {
    question: "Onde posso tirar o Registrato?",
    answer: "Você pode tirar o Registrato no site oficial do Banco Central do Brasil pelo endereço bcb.gov.br/cidadania/registrato."
  },
  {
    question: "Como tirar o Registrato sem ter conta Gov.br?",
    answer: "Atualmente, a conta única Gov.br (de nível Prata ou Ouro) é o canal obrigatório adotado pelo Banco Central para autenticação segura e garantia do sigilo de dados."
  },
  {
    question: "Quanto tempo demora para o relatório ficar pronto?",
    answer: "Os relatórios do Registrato são gerados instantaneamente na tela após a solicitação, prontos para visualização ou download em PDF."
  },
  {
    question: "Existe algum aplicativo do Registrato?",
    answer: "Não há um aplicativo próprio do Registrato. O acesso é realizado diretamente através do navegador de internet do celular ou computador."
  },
  {
    question: "Como baixar o relatório do Registrato em PDF?",
    answer: "Após gerar o relatório desejado no painel do Registrato, basta clicar no botão 'Fazer download' ou 'Exportar' para salvar o arquivo PDF no seu aparelho."
  }
];

export default function ComoObterRegistratoPage() {
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
        "name": "Como Obter Registrato",
        "item": `${SITE_URL}/como-obter-registrato`
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
          <span className="text-emerald-600">Como obter o Registrato</span>
        </div>

        {/* Hero Area */}
        <div className="space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Download className="w-3.5 h-3.5" />
            <span>Passo a Passo</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Como Tirar o Registrato do Banco Central Passo a Passo
          </h1>
          <p className="text-base sm:text-lg text-slate-655 font-medium">
            Siga o guia definitivo para obter seu relatório oficial do Registrato e verificar contas abertas, empréstimos e chaves Pix associadas ao seu CPF de graça.
          </p>
        </div>

        {/* 1. Resumo Rápido */}
        <section className="mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            1. Resumo Rápido
          </h2>
          <p className="text-slate-650 text-sm leading-relaxed">
            Seja para identificar fraudes, comprovar vínculos de contas ou negociar dívidas, saber <strong>como tirar o Registrato</strong> é essencial. Todo o processo leva menos de 5 minutos, é totalmente gratuito e utiliza a segurança do portal Gov.br. Com o documento PDF gerado, você poderá usar o analisador do Quita para identificar juros abusivos de imediato.
          </p>
        </section>

        {/* 2. Passo a Passo */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            2. Passo a Passo para Emitir seu Registrato
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              "Acesse bcb.gov.br/cidadania/registrato no seu computador ou celular.",
              "Clique em 'Entrar' e insira seu CPF cadastrado no Gov.br.",
              "Faça a validação facial ou insira sua senha do Gov.br.",
              "Verifique se o seu perfil é nível Prata ou Ouro (se necessário, faça o upgrade na hora vinculando seu banco).",
              "No menu inicial do Registrato, escolha a categoria 'Empréstimos e Financiamentos'.",
              "Defina a data inicial para a busca e clique no botão 'Gerar'.",
              "Salve o arquivo PDF no seu celular ou computador."
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
            3. Checklist de Emissão
          </h2>
          <ul className="space-y-3">
            {[
              "Cadastro Gov.br ativo e atualizado.",
              "Nível da conta Gov.br ajustado (Prata ou Ouro).",
              "Navegador de internet com suporte para downloads de PDF ativado.",
              "Conexão estável com a internet para carregar as bases do Banco Central.",
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
            Emitir o Registrato é o passo definitivo para quem deseja regularizar o seu nome e entender as dívidas reportadas pelos bancos. O processo é rápido, gratuito e garante que você conheça cada contrato ativo no seu nome.
          </p>
        </section>

        {/* Context CTA */}
        <SeoCta />
      </div>
    </SeoLayout>
  );
}
