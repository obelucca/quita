package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;

@Component
public class HumanComplaintBlueprint {

    public String getBlueprintInstructions() {
        return "Sua resposta deve seguir implicitamente a estrutura narrativa estruturada em 5 fases contínuas, sem fazer qualquer menção direta aos nomes das fases:\n" +
               "1. SITUAÇÃO/OBSERVAÇÃO INICIAL: Apresente o fato geral de forma natural, observando a existência de registros vinculados ao CPF (ex: registros no relatório oficial).\n" +
               "2. DÚVIDA CONCRETA: Aponte a inconsistência identificada (evolução do saldo, cessão de crédito ou falta de documentação clara).\n" +
               "3. CONSEQUÊNCIA PRÁTICA: Explique de maneira sóbria como a falta de clareza afeta sua vida financeira (impedimento de planejamento econômico, impossibilidade de conferência de juros).\n" +
               "4. BUSCA POR ESCLARECIMENTO: Formule perguntas legítimas e espontâneas que naturalmente conduzam à obtenção de contratos, memória de cálculo ou esclarecimentos.\n" +
               "5. ENCERRAMENTO PROFISSIONAL: Finalize se colocando à disposição de forma educada e resoluta.";
    }
}
