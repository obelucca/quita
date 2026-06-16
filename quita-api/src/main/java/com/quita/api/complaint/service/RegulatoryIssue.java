package com.quita.api.complaint.service;

public enum RegulatoryIssue {
    ISSUE_ASSIGNMENT_CLARIFICATION(
        "Cessão de crédito identificada",
        "Solicitar comprovação documental da cessão do crédito, termo de cessão e demonstrativo de repasse."
    ),
    ISSUE_BALANCE_DIVERGENCE(
        "Divergência de saldo identificada",
        "Exigir a memória de cálculo detalhada da evolução do saldo devedor para esclarecer a diferença de valores."
    ),
    ISSUE_UNRECOGNIZED_OPERATION(
        "Operação desconhecida nos registros",
        "Solicitar a comprovação da origem da obrigação e a cópia digitalizada do contrato assinado."
    ),
    ISSUE_MULTIPLE_CREDITORS(
        "Multiplicidade de credores sob análise",
        "Delimitar de forma estrita a responsabilidade e a cobrança desta instituição em relação aos demais registros apontados no SCR."
    ),
    ISSUE_BALANCE_EVOLUTION(
        "Crescimento expressivo do saldo devedor",
        "Questionar a evolução do saldo devedor, a aplicação de encargos, juros e a legitimidade da evolução contratual."
    );

    private final String description;
    private final String promptEnrichment;

    RegulatoryIssue(String description, String promptEnrichment) {
        this.description = description;
        this.promptEnrichment = promptEnrichment;
    }

    public String getDescription() {
        return description;
    }

    public String getPromptEnrichment() {
        return promptEnrichment;
    }
}
