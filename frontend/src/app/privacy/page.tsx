"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-petroleo tracking-tight">
              Política de Privacidade
            </h1>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Última atualização: Junho de 2026
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
          <p className="text-base text-slate-700 font-medium leading-relaxed">
            Bem-vindo ao Quita. Sua privacidade é extremamente importante para nós. Esta Política explica detalhadamente como tratamos seus dados pessoais ao utilizar nossos serviços e reforça nosso compromisso com a transparência e a conformidade legal.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">1. Quem somos</h2>
            <p>
              O Quita é uma plataforma digital destinada a auxiliar consumidores brasileiros na compreensão de informações presentes no Registrato do Banco Central e na estruturação de reclamações destinadas ao portal Consumidor.gov.br.
            </p>
            <p className="font-semibold text-brand-petroleo bg-brand-offwhite-50 border border-slate-200 p-3 rounded-lg text-xs">
              Atenção: O Quita não atua como escritório de advocacia, instituição financeira ou representante legal do consumidor. Nossas ferramentas são de natureza puramente assistiva e tecnológica.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">2. Quais dados coletamos</h2>
            <p>Para o funcionamento adequado da nossa ferramenta, podemos processar:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Dados cadastrais:</strong> Seu nome, e-mail e senha (armazenada de forma estritamente criptografada).</li>
              <li><strong>Dados financeiros fornecidos voluntariamente:</strong> Detalhes de instituições credoras identificadas, valores das operações extraídas dos relatórios e o conteúdo das reclamações geradas.</li>
              <li><strong>Dados técnicos:</strong> Tipo de navegador utilizado, dados de sessão necessários para a segurança e estabilidade da navegação e identificadores de tráfego.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">3. O que NÃO armazenamos</h2>
            <p className="font-medium text-slate-800">
              O relatório em formato PDF original do Registrato enviado pelo usuário NÃO é armazenado permanentemente.
            </p>
            <p>
              Assim que o processamento automatizado de leitura e extração é concluído, o arquivo PDF original é permanentemente descartado dos nossos servidores. Apenas as informações estruturadas das dívidas que você decide analisar (como nome do banco credor e valor reportado) são mantidas temporariamente na sua sessão para o correto funcionamento do produto.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">4. Finalidade do tratamento</h2>
            <p>Os dados pessoais coletados são utilizados exclusivamente para as seguintes finalidades:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Identificação e autenticação segura do usuário na plataforma;</li>
              <li>Funcionamento das etapas do assistente digital;</li>
              <li>Geração automática de insights consolidados sobre suas dívidas;</li>
              <li>Estruturação e formatação de minutas personalizadas de reclamações;</li>
              <li>Manutenção do seu histórico de negociações no painel privado (Dashboard).</li>
            </ul>
            <p>
              <strong>Garantia de Não-Comercialização:</strong> Não vendemos, não alugamos, não compartilhamos seus dados com agências de publicidade e não os utilizamos para ofertas de produtos financeiros de terceiros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">5. Compartilhamento de dados</h2>
            <p>
              O Quita respeita o sigilo absoluto das suas informações financeiras. Seus dados pessoais somente poderão ser compartilhados em circunstâncias excepcionais:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Mediante obrigação legal ou regulatória aplicável;</li>
              <li>Por determinação de ordens judiciais ou de autoridades competentes;</li>
              <li>Com prestadores de serviços técnicos essenciais à operação do sistema (como hospedagem e servidores de banco de dados), sob estritas cláusulas de confidencialidade.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">6. Inteligência Artificial</h2>
            <p>
              O Quita pode utilizar provedores de tecnologia de Inteligência Artificial para auxiliar na formatação textual e correção gramatical das reclamações. Esses sistemas externos recebem apenas fragmentos de texto anonimizados necessários para estruturar o teor da contestação.
            </p>
            <p>
              A responsabilidade pela revisão final e pelo envio efetivo da reclamação no portal Consumidor.gov.br pertence única e exclusivamente ao próprio usuário titular.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">7. Segurança da Informação</h2>
            <p>
              Adotamos práticas técnicas de mercado reconhecidas para proteger suas informações contra acessos não autorizados, perdas, destruições ou alterações indesejadas, incluindo conexões seguras sob criptografia HTTPS (TLS) e armazenamento protegido. No entanto, é importante ressaltar que nenhum sistema de transmissão de dados online é completamente inviolável.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">8. Direitos do titular dos dados</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você pode exercer seus direitos a qualquer momento, incluindo:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Confirmação da existência de tratamento dos seus dados;</li>
              <li>Acesso detalhado às informações armazenadas;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Informações completas sobre entidades públicas ou privadas com as quais compartilhamos dados.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">9. Exclusão da conta e dados</h2>
            <p>
              Você pode solicitar a exclusão definitiva da sua conta e de todos os seus dados cadastrados a qualquer momento a partir das opções do painel do usuário ou por meio do nosso suporte. Após a solicitação, todas as suas reclamações e documentos cadastrados serão removidos de forma irreversível do banco de dados operacional, respeitando os prazos legais de guarda de registros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-brand-petroleo pt-2">10. Alterações nesta Política</h2>
            <p>
              Esta Política de Privacidade poderá passar por atualizações periódicas para refletir melhorias em nossos processos internos ou novas determinações legais. Quaisquer alterações relevantes serão devidamente comunicadas através do e-mail cadastrado ou na página inicial da plataforma.
            </p>
          </section>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 mt-auto">
        <p>© {new Date().getFullYear()} Quita. Todos os direitos reservados. Em conformidade com a LGPD (Lei nº 13.709/2018).</p>
      </footer>
    </div>
  );
}
