export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  summary: string;
  readTime: string;
  publishDate: string;
  takeaway: string;
  content: string[];
  steps: string[];
  checklist: string[];
  faqs: { question: string; answer: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "como-tirar-seu-registrato-passo-a-passo",
    title: "Como tirar seu Registrato passo a passo",
    category: "Registrato",
    summary: "Guia completo e prático para obter seu relatório do Registrato do Banco Central gratuitamente pelo celular ou computador.",
    readTime: "4 min",
    publishDate: "25/06/2026",
    takeaway: "O Registrato do Banco Central é um sistema gratuito que reúne todas as suas informações financeiras, incluindo chaves Pix, contas correntes e dívidas ativas.",
    content: [
      "O Registrato é uma ferramenta oficial e gratuita do Banco Central do Brasil que permite ao cidadão consultar relatórios sobre seus relacionamentos com instituições financeiras, operações de crédito (empréstimos e financiamentos), chaves Pix cadastradas, contas abertas e moedas estrangeiras compradas.",
      "Muitos consumidores desconhecem a existência dessa ferramenta, mas ela é essencial para diagnosticar sua saúde financeira, verificar se existem contas ou empréstimos abertos em seu nome de forma fraudulenta e identificar juros abusivos nos contratos vigentes.",
      "Para acessar o sistema, você precisará obrigatoriamente de uma conta gov.br de nível prata ou ouro, garantindo a máxima segurança dos seus dados bancários."
    ],
    steps: [
      "Acesse o site oficial do Registrato do Banco Central (bcb.gov.br/cidadania/registrato) ou digite 'Registrato Banco Central' no Google.",
      "Clique no botão 'Acessar o Registrato'.",
      "Faça login utilizando a sua conta Gov.br (o sistema requer nível de segurança Prata ou Ouro).",
      "Na tela inicial do painel, selecione o relatório que deseja gerar (exemplo: 'Créditos e Financiamentos - SCR' ou 'Contas e Relacionamentos').",
      "Defina o período de busca desejado (recomenda-se selecionar a data de início correspondente ao início do contrato da dívida).",
      "Aceite os termos de uso e clique em 'Gerar relatório'.",
      "O sistema exibirá a tela com todas as informações na hora. Você pode visualizar online ou fazer o download do arquivo PDF."
    ],
    checklist: [
      "Possuir conta Gov.br ativa de nível Prata ou Ouro",
      "Ter o aplicativo do Gov.br instalado no celular para validação biométrica",
      "Verificar se o relatório gerado possui o arquivo PDF completo para upload no Quita",
      "Revisar a lista de bancos associados em busca de contas inativas ou suspeitas"
    ],
    faqs: [
      {
        question: "O Registrato do Banco Central é pago?",
        answer: "Não. O Registrato é um serviço totalmente público e 100% gratuito oferecido pelo Banco Central do Brasil."
      },
      {
        question: "Quem pode acessar o Registrato?",
        answer: "Qualquer pessoa física ou jurídica que possua CPF ou CNPJ ativo e tenha cadastro nível Prata ou Ouro no Gov.br."
      },
      {
        question: "Como subir de nível no Gov.br para Prata ou Ouro?",
        answer: "Você pode subir o nível da sua conta validando dados por biometria facial do TSE, login pelo seu banco credenciado, ou certificado digital."
      },
      {
        question: "Quais relatórios consigo tirar no Registrato?",
        answer: "Você pode emitir relatórios de empréstimos e financiamentos (SCR), contas correntes e outros relacionamentos (CCS), chaves Pix cadastradas, câmbio e dívidas ativas na União."
      },
      {
        question: "Com que frequência o Registrato é atualizado?",
        answer: "As instituições financeiras enviam os dados mensalmente para o Banco Central. Geralmente, as informações de um mês ficam disponíveis por volta do dia 20 do mês seguinte."
      }
    ]
  },
  {
    slug: "o-que-significa-scr-no-banco-central",
    title: "O que significa SCR no Banco Central",
    category: "SCR",
    summary: "Entenda o Sistema de Informações de Crédito (SCR) do Banco Central, a diferença entre 'a vencer' e 'prejuízo' e o impacto disso.",
    readTime: "5 min",
    publishDate: "25/06/2026",
    takeaway: "O SCR funciona como o histórico de crédito do Banco Central, exibindo tanto contas pagas em dia quanto prejuízos pendentes com instituições financeiras.",
    content: [
      "O Sistema de Informações de Crédito (SCR) é um banco de dados gerido pelo Banco Central do Brasil que armazena informações sobre operações de crédito acima de R$ 200,00 realizadas por pessoas físicas e jurídicas em qualquer instituição financeira autorizada.",
      "Diferente do Serasa ou SPC, que registram apenas as restrições e inadimplências (lista negra), o SCR contém o histórico completo das suas finanças: parcelas pagas em dia (a vencer), parcelas em atraso (vencido) e valores que o banco já baixou como perda operacional (prejuízo).",
      "É muito importante manter o SCR atualizado, pois a existência de um apontamento de prejuízo impede a aprovação de novos financiamentos, empréstimos ou cartões de crédito em qualquer outro banco, mesmo que o seu nome esteja limpo no Serasa."
    ],
    steps: [
      "Emita seu relatório do SCR no Registrato do Banco Central selecionando a opção 'Créditos'.",
      "Localize a tabela de operações e identifique a coluna de cada instituição financeira.",
      "Identifique o campo 'A Vencer': indica parcelas futuras contratadas que ainda não venceram.",
      "Identifique o campo 'Vencido': indica parcelas atrasadas que você precisa renegociar.",
      "Identifique o campo 'Prejuízo': indica valores que o banco considerou irrecuperáveis. Este é o apontamento mais crítico, pois impede novos créditos.",
      "Caso identifique um erro de apontamento (dívida já paga que consta como prejuízo), formalize a reclamação junto à instituição ou ao Banco Central."
    ],
    checklist: [
      "Analisar relatórios retroativos para verificar quando o prejuízo foi lançado",
      "Verificar se há lançamentos de bancos com os quais você nunca teve relacionamento",
      "Confirmar se os valores de prejuízo coincidem com os acordos quitados",
      "Revisar se o score interno dos bancos pode estar sendo afetado pelo relatório"
    ],
    faqs: [
      {
        question: "O que significa o termo 'Prejuízo' no relatório do SCR?",
        answer: "Significa que uma dívida ficou sem pagamento por um período prolongado e a instituição financeira registrou a operação como perda contábil."
      },
      {
        question: "O SCR limpa o histórico após 5 anos?",
        answer: "Não. Diferente dos órgãos de proteção ao crédito (Serasa/SPC) que limpam o nome após 5 anos, o histórico do SCR é definitivo e pode ser consultado por períodos maiores."
      },
      {
        question: "Pagar dívida com desconto limpa o prejuízo do SCR?",
        answer: "A quitação da dívida atualiza o status para o futuro, mas o histórico de prejuízo referente aos meses passados permanece registrado como fato ocorrido."
      },
      {
        question: "Quem pode visualizar meus dados no SCR?",
        answer: "Apenas você e as instituições financeiras autorizadas por você podem consultar o seu relatório do SCR."
      },
      {
        question: "Como retirar meu nome do prejuízo no SCR?",
        answer: "Para atualizar o relatório, é preciso pagar a dívida pendente ou fazer um acordo de quitação com a instituição credora."
      }
    ]
  },
  {
    slug: "consumidor-gov-realmente-funciona",
    title: "Consumidor.gov.br realmente funciona?",
    category: "Canais de Reclamação",
    summary: "Análise completa da taxa de resolução do Consumidor.gov.br, vantagens de usá-lo e o passo a passo para registrar sua contestação.",
    readTime: "4 min",
    publishDate: "25/06/2026",
    takeaway: "O Consumidor.gov.br possui índices de resolução superiores a 80% e obriga os bancos a darem respostas fundamentadas em até 15 dias.",
    content: [
      "O Consumidor.gov.br é um serviço público e gratuito que permite a interlocução direta entre consumidores e empresas para solução de conflitos de consumo pela internet.",
      "Diferente do ReclameAqui, o portal é monitorado pela Secretaria Nacional do Consumidor (Senacon) do Ministério da Justiça, Procons, Defensorias Públicas e agências reguladoras (como o Banco Central). As empresas cadastradas são obrigadas a responder e são avaliadas pela qualidade e velocidade de resolução.",
      "Para o consumidor de serviços bancários, esta plataforma é um dos meios mais eficientes para contestar cobranças indevidas de juros, obter cópias de contratos, retificar apontamentos indevidos no SCR e fechar acordos de quitação de dívidas sem a necessidade de uma ação judicial lenta e onerosa."
    ],
    steps: [
      "Entre no site oficial (consumidor.gov.br) ou utilize o aplicativo de celular.",
      "Faça login com sua conta Gov.br.",
      "Pesquise pela instituição financeira ou banco contra quem deseja reclamar.",
      "Descreva detalhadamente o problema (utilize os textos estruturados pelo Quita para garantir embasamento legal).",
      "Anexe o dossiê em PDF ou relatório do Registrato para servir como comprovação das suas alegações.",
      "Monitore o status da reclamação. O banco tem o prazo regulatório de até 15 dias corridos para responder.",
      "Avalie a resposta fornecida pela empresa, indicando se a reclamação foi resolvida ou não."
    ],
    checklist: [
      "Verificar se o banco credor está cadastrado na plataforma",
      "Redigir uma petição objetiva e clara, evitando termos informais",
      "Anexar provas documentais sólidas (Registrato, extratos, faturas)",
      "Acompanhar diariamente o prazo limite de resposta do banco"
    ],
    faqs: [
      {
        question: "Qual o prazo de resposta dos bancos no Consumidor.gov.br?",
        answer: "O prazo oficial estabelecido pela plataforma para manifestação das empresas é de até 15 dias corridos."
      },
      {
        question: "Qual a diferença entre o Consumidor.gov e o Procon?",
        answer: "O Consumidor.gov é uma plataforma digital focada no acordo direto e rápido. O Procon é um órgão administrativo que pode autuar e aplicar multas após processos presenciais."
      },
      {
        question: "O serviço do Consumidor.gov.br é gratuito?",
        answer: "Sim, o serviço é 100% gratuito e mantido pelo Governo Federal."
      },
      {
        question: "Posso registrar reclamação contra qualquer empresa?",
        answer: "Não, apenas contra as empresas que aderiram voluntariamente à plataforma e assinaram o termo de compromisso."
      },
      {
        question: "As reclamações do Consumidor.gov.br servem como prova judicial?",
        answer: "Sim. A tentativa frustrada de conciliação administrativa na plataforma demonstra o interesse de agir e serve como prova robusta de má-fé ou falha de serviço caso você precise ir à justiça."
      }
    ]
  },
  {
    slug: "como-contestar-juros-abusivos",
    title: "Como contestar juros abusivos",
    category: "Direito do Consumidor",
    summary: "Aprenda a analisar taxas de juros abusivas em cartões, empréstimos e financiamentos usando o histórico do SCR e como reclamar.",
    readTime: "5 min",
    publishDate: "25/06/2026",
    takeaway: "Juros abusivos ocorrem quando a taxa do contrato está substancialmente acima da taxa média de mercado divulgada pelo Banco Central para o mesmo período.",
    content: [
      "A contestação de juros abusivos é um direito assegurado pelo Código de Defesa do Consumidor quando se constata uma desvantagem exagerada ou descumprimento de regras contratuais.",
      "Para avaliar se a taxa cobrada pelo seu banco é abusiva, você deve compará-la com a Taxa Média de Mercado divulgada mensalmente pelo Banco Central para a mesma modalidade de crédito (crédito pessoal, financiamento de veículos, cartão de crédito rotativo).",
      "Lançar mão da plataforma Quita simplifica esse diagnóstico: o sistema processa seus dados, compara automaticamente as taxas cobradas e redige uma contestação detalhada contendo jurisprudências e fundamentos jurídicos prontos para envio."
    ],
    steps: [
      "Identifique a taxa de juros efetiva mensal e anual presente no seu contrato bancário.",
      "Consulte a Taxa Média de Mercado praticada na época da assinatura no site oficial do Banco Central.",
      "Se a taxa do seu contrato for superior a 1,5 ou 2 vezes a média do mercado, há indícios claros de abusividade.",
      "Verifique se o banco incluiu seguros embutidos ou tarifas de cadastro de forma casada (venda casada).",
      "Gere a sua manifestação personalizada utilizando o assistente do Quita.",
      "Protocole a contestação no canal do Consumidor.gov.br anexando cópia da fatura ou extrato do empréstimo.",
      "Aguarde o retorno do banco para verificar a proposta de redução do saldo devedor ou devolução em dobro."
    ],
    checklist: [
      "Separar o contrato de financiamento ou faturas recentes",
      "Consultar a tabela de taxas de juros no site do Banco Central",
      "Garantir que a petição cite o Código de Defesa do Consumidor (CDC)",
      "Provar que a cobrança está acima do limite jurisprudencial aceito pelos tribunais"
    ],
    faqs: [
      {
        question: "O que caracteriza juros abusivos?",
        answer: "A cobrança de taxas significativamente superiores à taxa média aplicada no mercado para operações da mesma natureza na mesma época."
      },
      {
        question: "O banco pode cobrar tarifa de abertura de crédito (TAC)?",
        answer: "A cobrança de tarifas de abertura de crédito ou taxas administrativas embutidas em contratos novos é considerada ilegal pelo Superior Tribunal de Justiça (STJ)."
      },
      {
        question: "Como funciona a repetição de indébito?",
        answer: "Caso tenha pago valores indevidos de juros ou tarifas, o consumidor tem o direito de receber o valor pago a mais em dobro, corrigido monetariamente."
      },
      {
        question: "Vale a pena entrar com ação revisional na justiça?",
        answer: "Antes de ir ao judiciário, renegociar administrativamente via Consumidor.gov ou Ouvidoria costuma ser mais rápido e econômico."
      },
      {
        question: "Qual a taxa máxima aceitável em juros?",
        answer: "Não há um teto fixo em lei, mas o STJ adota a Taxa Média do Banco Central como parâmetro referencial para julgar a abusividade."
      }
    ]
  },
  {
    slug: "diferenca-entre-serasa-registrato-e-scr",
    title: "Diferença entre Serasa, Registrato e SCR",
    category: "Educação Financeira",
    summary: "Entenda de uma vez por todas a diferença entre a negativação tradicional e os relatórios do Banco Central.",
    readTime: "4 min",
    publishDate: "25/06/2026",
    takeaway: "Serasa e SPC mostram restrições ativas para negativação comercial imediata, enquanto o Registrato/SCR exibe o histórico financeiro completo de longo prazo.",
    content: [
      "Muitos cidadãos acreditam que possuir nome limpo na praça (ausência de restrições na Serasa, SPC ou Boa Vista) significa estar livre de impedimentos de crédito. No entanto, são surpreendidos ao terem pedidos de cartões ou financiamentos negados pelos bancos.",
      "A resposta para essa recusa quase sempre está no Registrato, mais especificamente no Sistema de Informações de Crédito (SCR) do Banco Central, que atua como um histórico de comportamento de crédito confidencial acessado por todas as grandes financeiras do país.",
      "Compreender como cada banco de dados funciona e a diferença entre eles é o primeiro passo para regularizar a sua situação cadastral e restabelecer a sua capacidade de financiamento no mercado brasileiro."
    ],
    steps: [
      "Serasa/SPC: Consulta focada em contas atrasadas reportadas por comércios ou concessionárias. Limpa após 5 anos ou após o pagamento da dívida.",
      "Registrato: Painel geral mantido pelo Banco Central que centraliza dados financeiros sigilosos do cidadão.",
      "SCR: Sub-sistema do Registrato onde constam todos os créditos acima de R$ 200, pagos ou não, sem prazo de expiração para fins históricos.",
      "Identifique se a recusa de crédito é motivada por score baixo na Serasa ou por histórico de prejuízo interno cadastrado no SCR.",
      "Utilize o Quita para localizar o banco de origem e redigir a manifestação correspondente."
    ],
    checklist: [
      "Consultar gratuitamente o CPF no site ou aplicativo da Serasa",
      "Emitir o relatório SCR no portal do Registrato do Banco Central",
      "Comparar se há dívidas registradas no SCR que não aparecem no Serasa",
      "Solicitar a exclusão ou retificação de cadastros inconsistentes em ambos os órgãos"
    ],
    faqs: [
      {
        question: "Qual a principal diferença entre Serasa e SCR?",
        answer: "A Serasa armazena pendências pontuais de inadimplência comercial. O SCR armazena o histórico contínuo de todos os seus empréstimos e relacionamentos bancários."
      },
      {
        question: "Dívida caduca no SCR?",
        answer: "No SCR o histórico referente a meses passados permanece gravado indefinidamente na base do Banco Central, embora os bancos geralmente acessem apenas os últimos 24 ou 60 meses."
      },
      {
        question: "Como os bancos usam o SCR?",
        answer: "Eles consultam o relatório para avaliar o seu endividamento total e seu comportamento de pagamento antes de conceder novos limites de crédito."
      },
      {
        question: "Estar com o nome limpo no Serasa garante aprovação de crédito?",
        answer: "Não. Se houver apontamentos de 'prejuízo' ou alto endividamento ativo no SCR, o banco pode negar o crédito mesmo com score alto no Serasa."
      },
      {
        question: "O Banco Central pode negativar meu nome?",
        answer: "O Banco Central apenas consolida as informações enviadas pelos bancos comerciais. Ele não realiza negativações por conta própria."
      }
    ]
  }
];
