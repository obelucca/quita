package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class ComplaintPatternLibrary {

    private final List<ComplaintPattern> patterns;

    public ComplaintPatternLibrary() {
        this.patterns = Arrays.asList(
            new ComplaintPattern(
                "PATTERN_CLARIFICATION",
                "Solicitação de esclarecimentos gerais",
                "profissional e objetivo",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList(
                    "Ao consultar as informações registradas no Sistema de Informações de Crédito (SCR)...",
                    "Recentemente, analisei o relatório do Banco Central e verifiquei apontamentos..."
                ),
                "Solicite esclarecimentos claros sobre a natureza das operações registradas e a situação cadastral geral.",
                Arrays.asList(
                    "Espero um posicionamento claro sobre os registros citados.",
                    "Permaneço à disposição para esclarecimentos por escrito."
                )
            ),
            new ComplaintPattern(
                "PATTERN_BALANCE_EVOLUTION",
                "Evolução relevante do saldo",
                "analítico e investigativo",
                Collections.singletonList("PROFILE_BALANCE_DIVERGENCE"),
                Arrays.asList(
                    "Identifiquei uma evolução acentuada nos valores apontados em meu nome...",
                    "Chama a atenção o crescimento dos registros de saldo devedor nas últimas consultas..."
                ),
                "Questione o ritmo de crescimento e a aplicação de encargos sobre o saldo original da dívida.",
                Arrays.asList(
                    "Solicito esclarecimentos acerca desse crescimento de saldo.",
                    "O fornecimento dessas informações permitirá compreender adequadamente a composição do débito registrado e avaliar, de maneira responsável, eventuais alternativas de regularização administrativa."
                )
            ),
            new ComplaintPattern(
                "PATTERN_ASSIGNED_DEBT",
                "Dívida cedida",
                "técnico e documental",
                Collections.singletonList("PROFILE_ASSIGNED_DEBT"),
                Arrays.asList(
                    "Verifiquei o registro de uma operação originalmente contratada com outra instituição...",
                    "Consta em meu relatório SCR um apontamento que aparenta ser oriundo de cessão..."
                ),
                "Exija o envio do contrato original e o comprovante da cessão do crédito para esta instituição.",
                Arrays.asList(
                    "Solicito a cópia digitalizada do termo de cessão do crédito.",
                    "Aguardo o envio da documentação comprobatória da cessão."
                )
            ),
            new ComplaintPattern(
                "PATTERN_NO_ACTIVE_OPERATION",
                "Ausência de documentação",
                "cauteloso e questionador",
                Collections.singletonList("PROFILE_NO_ACTIVE_OPERATION"),
                Arrays.asList(
                    "Constato a existência de registros sem a correspondente documentação contratual...",
                    "Identifiquei anotações no SCR relativas a contratos dos quais não disponho de via assinada..."
                ),
                "Solicite a disponibilização imediata de todas as vias de contratos e comprovantes de liberação das operações.",
                Arrays.asList(
                    "Requeiro o envio dos respectivos contratos assinados.",
                    "Espero a regularização documental e o envio das vias oficiais."
                )
            ),
            new ComplaintPattern(
                "PATTERN_CALCULATION_MEMORY",
                "Solicitação de memória de cálculo",
                "analítico e técnico",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList(
                    "Visando auditar a evolução matemática dos saldos apontados...",
                    "Para compreender a exata composição dos juros e encargos incidentes..."
                ),
                "Solicite expressamente a memória de cálculo detalhada contendo taxas de juros mensais e anuais aplicadas.",
                Arrays.asList(
                    "Solicito a memória de cálculo detalhada da evolução da dívida.",
                    "Fico no aguardo do demonstrativo contendo juros e amortizações."
                )
            ),
            new ComplaintPattern(
                "PATTERN_NEGOTIATION",
                "Revisão para negociação",
                "conciliatório",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList(
                    "Escrevo com a firme intenção de buscar uma conciliação financeira amigável...",
                    "Busco estabelecer um diálogo formal com esta instituição para regularização de pendências..."
                ),
                "Mencione o interesse legítimo em obter condições viáveis para liquidação administrativa das pendências.",
                Arrays.asList(
                    "Permaneço aberto a propostas realistas e consensuais.",
                    "Agradeço a cooperação para alcançarmos uma resolução administrativa."
                )
            ),
            new ComplaintPattern(
                "PATTERN_UNKNOWN_OPERATION",
                "Contestação de operação desconhecida",
                "cauteloso",
                Collections.singletonList("PROFILE_NO_ACTIVE_OPERATION"),
                Arrays.asList(
                    "Deparo-me com apontamentos de operações que desconheço por completo...",
                    "Recentemente tomei ciência de anotações cadastrais cujas origens não reconheço..."
                ),
                "Conteste formalmente a existência da relação jurídica e solicite a comprovação de sua contratação.",
                Arrays.asList(
                    "Solicito a imediata baixa dos registros caso não haja comprovação.",
                    "Aguardo esclarecimentos urgentes sobre a origem destas cobranças."
                )
            ),
            new ComplaintPattern(
                "PATTERN_BALANCE_DIVERGENCE",
                "Divergência de valores",
                "objetivo",
                Collections.singletonList("PROFILE_BALANCE_DIVERGENCE"),
                Arrays.asList(
                    "Identifico uma discrepância flagrante entre o saldo devedor cobrado e o registrado...",
                    "Escrevo para questionar a diferença entre as informações de cobrança e os dados oficiais..."
                ),
                "Solicite esclarecimentos acerca da composição e dos critérios de atualização que geraram a divergência.",
                Arrays.asList(
                    "Solicito a revisão das informações de saldo e a devida correção.",
                    "Fico no aguardo de manifestação formal sobre a diferença de valores."
                )
            ),
            new ComplaintPattern(
                "PATTERN_CONTRACT_UPDATE",
                "Atualização contratual",
                "formal",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList(
                    "Solicito a verificação e atualização das condições contratuais atualmente vigentes...",
                    "Identifico a necessidade de revisar o status e as cláusulas ativas das operações..."
                ),
                "Requeira o envio de extratos contratuais atualizados e a confirmação das obrigações correntes.",
                Arrays.asList(
                    "Aguardo o envio do extrato contratual consolidado.",
                    "Solicito a formalização das obrigações atualizadas."
                )
            ),
            new ComplaintPattern(
                "PATTERN_CONCILIATORY_REGULARIZATION",
                "Regularização conciliatória",
                "conciliatório e colaborativo",
                Collections.singletonList("PROFILE_MULTIPLE_CREDITORS"),
                Arrays.asList(
                    "No intuito de organizar minha vida financeira perante os credores...",
                    "Visando centralizar e liquidar obrigações apontadas de forma amigável..."
                ),
                "Expresse a vontade de conciliar o débito específico desta instituição respeitando sua capacidade financeira.",
                Arrays.asList(
                    "Reitero minha boa-fé na busca de uma solução administrativa.",
                    "Fico à disposição para analisar propostas que se ajustem ao meu planejamento."
                )
            ),
            new ComplaintPattern(
                "PATTERN_EVOLUTION_INCOMPATIBLE",
                "Evolução incompatível",
                "analítico e direto",
                Collections.singletonList("PROFILE_BALANCE_DIVERGENCE"),
                Arrays.asList(
                    "Verifiquei que a evolução do saldo devedor apresenta-se matemática ou financeiramente desconexa com o histórico...",
                    "O crescimento do débito registrado no SCR demonstra uma trajetória atípica frente aos parâmetros normais..."
                ),
                "Questione de forma detalhada o método matemático de indexação e evolução da dívida.",
                Arrays.asList(
                    "Requeiro esclarecimento pormenorizado da evolução do saldo.",
                    "Aguardo análise sobre a compatibilidade matemática dos juros cobrados."
                )
            ),
            new ComplaintPattern(
                "PATTERN_REDUCED_BALANCE_UNEXPLAINED",
                "Saldo reduzido sem explicação",
                "técnico e investigativo",
                Collections.singletonList("PROFILE_BALANCE_DIVERGENCE"),
                Arrays.asList(
                    "Notei uma redução inexplicada no saldo devedor apontado nesta instituição sem que houvesse correspondente amortização...",
                    "O valor registrado no relatório SCR sofreu alteração decrescente repentina, carecendo de justificativa formal..."
                ),
                "Solicite o envio do histórico de lançamentos para entender a redução de saldo apresentada.",
                Arrays.asList(
                    "Solicito esclarecimento técnico sobre a redução abrupta do saldo.",
                    "Aguardo demonstrativo contendo a origem da modificação do débito."
                )
            ),
            new ComplaintPattern(
                "PATTERN_UNIDENTIFIED_CONTRACT",
                "Contrato não identificado",
                "estrito e documental",
                Collections.singletonList("PROFILE_NO_ACTIVE_OPERATION"),
                Arrays.asList(
                    "Consta em meu nome o registro de uma operação cujo número de contrato e termos originais não consigo identificar...",
                    "Identifiquei em consulta ao SCR lançamentos que não correspondem a contratos sob minha posse..."
                ),
                "Exija a apresentação de todas as vias de contratos originais e termo de adesão assinados.",
                Arrays.asList(
                    "Solicito a cópia integral do instrumento contratual correspondente.",
                    "Fico no aguardo do envio da documentação de abertura da referida operação."
                )
            ),
            new ComplaintPattern(
                "PATTERN_RESIDUAL_CHARGE",
                "Cobrança residual",
                "cauteloso e direto",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList(
                    "Identifiquei a manutenção de cobrança residual após a quitação e liquidação principal da obrigação...",
                    "Aparece um registro residual ativo cujos juros e origem parecem indevidos após a quitação..."
                ),
                "Solicite a devida baixa cadastral ou esclarecimento detalhado acerca do saldo residual cobrado.",
                Arrays.asList(
                    "Solicito o detalhamento e exclusão imediata do saldo residual apontado.",
                    "Espero esclarecimentos sobre a composição de tais pendências residuais."
                )
            ),
            new ComplaintPattern(
                "PATTERN_OLD_DEBT",
                "Dívida antiga",
                "técnico e objetivo",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList(
                    "Identifiquei o registro ativo de obrigação financeira muito antiga, cuja fundamentação documental requer reavaliação...",
                    "Consta apontamento de débito pretérito no SCR para o qual não possuo memória de evolução ou cobranças recentes..."
                ),
                "Solicite os demonstrativos originais e a comprovação documental do direito de cobrança atual.",
                Arrays.asList(
                    "Requeiro a confirmação documental e extratos históricos desta pendência.",
                    "Fico à disposição para analisar a comprovação de origem desse débito antigo."
                )
            ),
            new ComplaintPattern(
                "PATTERN_FRUSTRATED_NEGOTIATION",
                "Negociação frustrada",
                "conciliatório e determinado",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList(
                    "Busco reiterar a tentativa de composição amigável após tentativas anteriores de conciliação frustradas...",
                    "Diante da ausência de retorno satisfatório nos canais de atendimento, busco formalizar nova proposta de liquidação..."
                ),
                "Solicite condições razoáveis baseadas na capacidade financeira real do consumidor.",
                Arrays.asList(
                    "Aguardo contato com propostas condizentes para resolução da pendência.",
                    "Reitero o intuito de buscar uma liquidação pacífica e viável."
                )
            ),
            new ComplaintPattern(
                "PATTERN_ASSIGNMENT_NO_DETAILS",
                "Cessão sem detalhamento",
                "técnico e documental",
                Collections.singletonList("PROFILE_ASSIGNED_DEBT"),
                Arrays.asList(
                    "Observei a indicação de cessão da obrigação a esta instituição, porém não consta notificação prévia ou detalhes...",
                    "Verifiquei apontamento decorrente de cessão de crédito cujas condições e valores originais carecem de especificação..."
                ),
                "Solicite a comprovação de notificação da cessão e o detalhamento dos juros aplicados pelo cessionário.",
                Arrays.asList(
                    "Exijo a comprovação legal da cessão e o extrato de evolução do saldo.",
                    "Solicito o envio da notificação de cessão e cópia do contrato originário."
                )
            ),
            new ComplaintPattern(
                "PATTERN_DOCUMENTARY_DIVERGENCE",
                "Divergência documental",
                "investigativo e detalhado",
                Collections.singletonList("PROFILE_NO_ACTIVE_OPERATION"),
                Arrays.asList(
                    "Identifiquei incompatibilidade clara entre os termos contratuais sob minha posse e as informações inseridas no SCR...",
                    "Os registros de data de contratação e valores no relatório do Banco Central não coincidem com o documento original..."
                ),
                "Questione a divergência factual de datas e valores entre o contrato físico e o registro regulatório.",
                Arrays.asList(
                    "Solicito a devida adequação cadastral das informações com base no contrato.",
                    "Espero esclarecimentos sobre as diferenças encontradas no preenchimento do SCR."
                )
            ),
            new ComplaintPattern(
                "PATTERN_DEBT_CONSOLIDATION",
                "Consolidação de débitos",
                "conciliatório e estruturado",
                Collections.singletonList("PROFILE_MULTIPLE_CREDITORS"),
                Arrays.asList(
                    "Com o objetivo de consolidar e organizar as pendências financeiras registradas em meu nome com esta instituição...",
                    "Identifico a oportunidade de buscar a unificação e regularização conjunta de operações registradas no SCR..."
                ),
                "Expresse a proposta de consolidar as obrigações sob uma taxa única ou parcelamento unificado.",
                Arrays.asList(
                    "Solicito uma proposta unificada para consolidação e liquidação dos débitos.",
                    "Fico no aguardo de condições administrativas para regularização conjunta das operações."
                )
            ),
            new ComplaintPattern(
                "PATTERN_OPERATION_REANALYSIS",
                "Reanálise de operação",
                "formal e analítico",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList(
                    "Solicito a reanálise completa da operação financeira registrada no SCR, visando averiguar as taxas aplicadas...",
                    "Constato a necessidade de uma revisão pormenorizada das condições pactuadas na referida obrigação..."
                ),
                "Requeira a auditoria interna dos encargos pactuados e a confirmação das taxas contratuais efetivas.",
                Arrays.asList(
                    "Aguardo retorno sobre a reanálise da operação e das taxas informadas.",
                    "Solicito a revisão dos encargos para verificação de conformidade contratual."
                )
            )
        );
    }

    public List<ComplaintPattern> getAllPatterns() {
        return patterns;
    }
}
