import React from "react";
import { Metadata } from "next";
import { SeoLayout } from "@/components/ui/seo-layout";
import { SeoCta } from "@/components/ui/seo-cta";
import { CheckCircle2, ChevronRight, BookOpen, Clock, ShieldCheck, Compass } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Registrato Banco Central: O que é, Como Consultar e Emitir PDF",
  description: "Entenda o Registrato do Banco Central. Guia completo para acessar o sistema, extrair o relatório SCR e contestar juros abusivos de dívidas bancárias.",
  keywords: ["registrato banco central", "consultar registrato", "emitir registrato", "scr banco central", "relatorio banco central"],
  alternates: {
    canonical: `${siteUrl}/registrato`,
  },
  openGraph: {
    title: "Registrato Banco Central: O que é, Como Consultar e Emitir PDF",
    description: "Entenda o Registrato do Banco Central. Guia completo para acessar o sistema, extrair o relatório SCR e contestar juros abusivos de dívidas bancárias.",
    url: `${siteUrl}/registrato`,
    images: [`${siteUrl}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Registrato Banco Central: O que é, Como Consultar e Emitir PDF",
    description: "Entenda o Registrato do Banco Central. Guia completo para acessar o sistema, extrair o relatório SCR e contestar juros abusivos de dívidas bancárias.",
    images: [`${siteUrl}/og-image.png`],
  }
};

const faqs = [
  {
    question: "O que é o Registrato do Banco Central?",
    answer: "O Registrato é um sistema gratuito administrado pelo Banco Central do Brasil (BCB) que reúne todas as informações financeiras dos cidadãos brasileiros, como contas bancárias ativas, empréstimos, financiamentos, chaves Pix e operações de câmbio."
  },
  {
    question: "Como acessar o Registrato gratuitamente?",
    answer: "O acesso é feito de forma 100% gratuita através do site oficial do Banco Central utilizando as credenciais da sua conta Gov.br. Para visualizar a maioria dos relatórios, é necessário possuir nível de segurança Prata ou Ouro."
  },
  {
    question: "O Registrato mostra dívidas antigas?",
    answer: "Sim. O Registrato (principalmente no relatório SCR) exibe o histórico de todas as operações de crédito acima de R$ 200,00 contratadas nos últimos anos, indicando se foram pagas em dia, se estão em atraso ou se foram registradas como prejuízo."
  },
  {
    question: "O que é o relatório SCR contido no Registrato?",
    answer: "O SCR (Sistema de Informações de Crédito) é o relatório que detalha as dívidas, empréstimos e financiamentos ativos e passados do consumidor com as instituições financeiras autorizadas a funcionar no país."
  },
  {
    question: "Como tirar o Registrato pelo celular?",
    answer: "Você pode emitir acessando o site oficial pelo navegador do celular e fazendo login with o Gov.br. O portal do Banco Central é responsivo e gera relatórios em formato PDF prontos para download imediato."
  },
  {
    question: "O Registrato do Banco Central limpa o nome?",
    answer: "Não diretamente. O Registrato exibe dados declarados pelos bancos. Para limpar seu nome, você deve renegociar os saldos vencidos ou contestar cobranças abusivas através de canais como o Consumidor.gov.br."
  },
  {
    question: "Qual o prazo para atualização dos dados no Registrato?",
    answer: "Os bancos comerciais atualizam os dados de crédito uma vez por mês. A atualização costuma ocorrer até o dia 20 do mês seguinte ao do fato gerador."
  },
  {
    question: "Outras pessoas ou empresas podem consultar meu Registrato?",
    answer: "Não sem sua permissão por escrito. As informações do Registrato são protegidas por sigilo bancário. Somente o próprio titular da conta e instituições financeiras devidamente autorizadas pelo titular podem consultar esses relatórios."
  }
];

export default function RegistratoPage() {
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
        "name": "Registrato",
        "item": `${siteUrl}/registrato`
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
          <span className="text-emerald-600">Registrato</span>
        </div>

        {/* Hero Area */}
        <div className="space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Guia do Cidadão</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Registrato Banco Central: O que é, Como Consultar e Emitir
          </h1>
          <p className="text-base sm:text-lg text-slate-650 font-medium">
            Entenda como funciona a plataforma oficial do Banco Central para monitorar sua vida financeira, verificar pendências e identificar cobranças indevidas nos seus cartões e financiamentos.
          </p>
        </div>

        {/* 1. Resumo Rápido */}
        <section className="mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            1. Resumo Rápido
          </h2>
          <p className="text-slate-650 text-sm leading-relaxed">
            O <strong>Registrato Banco Central</strong> é um sistema unificado que permite a qualquer cidadão monitorar gratuitamente suas chaves Pix, contas correntes e dívidas ativas. A principal ferramenta interna dele é o <strong>SCR (Sistema de Informações de Crédito)</strong>, onde os bancos reportam mensalmente seu saldo devedor. É o principal diagnóstico usado para analisar o endividamento e encontrar juros abusivos.
          </p>
        </section>

        {/* 2. Passo a Passo */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            2. Passo a Passo para Consultar seu Registrato
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              "Acesse o portal oficial do Registrato (bcb.gov.br/cidadania/registrato).",
              "Clique no botão de acesso utilizando suas credenciais Gov.br.",
              "Valide sua conta para os níveis Prata ou Ouro caso ainda esteja no nível Bronze.",
              "Selecione a seção 'Créditos e Financiamentos' (SCR) no painel inicial.",
              "Selecione o período de busca retroativo que deseja examinar.",
              "Aceite as diretrizes e clique em 'Gerar Relatório' para abrir o PDF.",
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
            3. Checklist de Documentos Necessários
          </h2>
          <ul className="space-y-3">
            {[
              "CPF regularizado e atualizado junto à Receita Federal.",
              "Senha do cadastro federal único Gov.br.",
              "Nível de segurança da conta Gov.br ajustado para Prata ou Ouro.",
              "Smartphone em mãos com o aplicativo do Gov.br instalado para validação facial rápida.",
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
            Obter seu relatório Registrato é o primeiro passo para retomar as rédeas da sua vida financeira. Com os dados corretos em mãos, fica simples identificar cobranças abusivas e juros fora do padrão legal praticados pelas instituições de crédito. A partir daí, o Quita se encarrega de construir a contestação exata para regularizar suas pendências.
          </p>
        </section>

        {/* Context CTA */}
        <SeoCta />
      </div>
    </SeoLayout>
  );
}
