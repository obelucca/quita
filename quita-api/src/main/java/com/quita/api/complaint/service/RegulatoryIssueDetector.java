package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class RegulatoryIssueDetector {

    public List<DetectedIssue> detectIssues(RegulatoryCaseContext context) {
        List<DetectedIssue> detected = new ArrayList<>();

        if (context.isHasNoActiveOperation()) {
            detected.add(new DetectedIssue(
                RegulatoryIssue.ISSUE_UNRECOGNIZED_OPERATION,
                1.0,
                "Nenhuma operação ativa identificada no SCR para esta instituição."
            ));
        }

        if (context.isHasCedida()) {
            detected.add(new DetectedIssue(
                RegulatoryIssue.ISSUE_ASSIGNMENT_CLARIFICATION,
                0.95,
                "Identificados indícios de cessão ou transferência de crédito."
            ));
        }

        if (context.isHasBalanceDivergence()) {
            detected.add(new DetectedIssue(
                RegulatoryIssue.ISSUE_BALANCE_DIVERGENCE,
                0.90,
                "Identificada diferença relevante entre o saldo cobrado e o registrado no Banco Central."
            ));
        }

        if (context.isHasMultipleCreditors()) {
            detected.add(new DetectedIssue(
                RegulatoryIssue.ISSUE_MULTIPLE_CREDITORS,
                0.85,
                "Identificada multiplicidade de credores no relatório SCR do usuário."
            ));
        }

        if (!context.isHasNoActiveOperation() && context.getDebtCount() > 0) {
            detected.add(new DetectedIssue(
                RegulatoryIssue.ISSUE_BALANCE_EVOLUTION,
                0.80,
                "Evolução do saldo devedor requer comprovação detalhada dos encargos."
            ));
        }

        return detected;
    }
}
