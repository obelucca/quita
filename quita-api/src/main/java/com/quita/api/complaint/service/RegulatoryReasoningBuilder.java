package com.quita.api.complaint.service;

import com.quita.api.common.MonetaryFormatter;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class RegulatoryReasoningBuilder {

    public List<String> buildReasonings(
            String institution,
            RegulatoryCaseContext context,
            BigDecimal currentDebtValue,
            List<DetectedIssue> detectedIssues) {

        List<String> reasonings = new ArrayList<>();

        if (context.isHasCedida()) {
            reasonings.add("Existe registro de saldo associado a cessão de crédito para terceiros, exigindo notificação de transferência e origem detalhada.");
        }
        if (context.isHasBalanceDivergence() || (currentDebtValue != null && context.getTotalAmount() != null && !currentDebtValue.equals(context.getTotalAmount()))) {
            reasonings.add("Divergência identificada entre o saldo original reportado no Registrato (" + MonetaryFormatter.formatBRL(context.getTotalAmount()) + ") e o valor atualizado cobrado (" + MonetaryFormatter.formatBRL(currentDebtValue) + ").");
            reasonings.add("Há necessidade de esclarecimento quanto aos critérios utilizados na atualização do débito e taxas aplicadas.");
        }
        if (context.isHasMultipleCreditors()) {
            reasonings.add("Registros apontam a existência de múltiplos credores/instituições associados à mesma obrigação financeira original.");
        }
        if (context.isHasNoActiveOperation()) {
            reasonings.add("Consta registro de operação ativa no relatório oficial (Registrato) que o consumidor não reconhece como vínculo contratual vigente.");
        }

        reasonings.add("A ausência de detalhamento ou memória de cálculo inviabiliza a conferência da evolução financeira pelo titular.");
        reasonings.add("O histórico apresentado sugere a necessidade de revisão documental para fins de planejamento econômico ou negociação de boa-fé.");

        return reasonings;
    }
}
