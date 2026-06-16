package com.quita.api.complaint.service;

import com.quita.api.debt.model.Debt;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Component
public class RegulatoryCaseClassifier {

    public RegulatoryCaseContext classify(
            String institution,
            List<Debt> instDebts,
            BigDecimal currentDebtValue,
            List<Debt> allUserDebts) {

        boolean hasNoActiveOperation = instDebts == null || instDebts.isEmpty();
        int debtCount = instDebts != null ? instDebts.size() : 0;

        BigDecimal totalAmount = BigDecimal.ZERO;
        if (instDebts != null && !instDebts.isEmpty()) {
            totalAmount = instDebts.stream()
                    .map(d -> d.getReportedValue() != null ? d.getReportedValue() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        boolean hasCedida = false;
        if (instDebts != null) {
            for (Debt d : instDebts) {
                if (d.getOperationType() != null && (d.getOperationType().toLowerCase().contains("cedid") || d.getOperationType().toLowerCase().contains("cess"))) {
                    hasCedida = true;
                    break;
                }
                if (d.getExtractedText() != null && (d.getExtractedText().toLowerCase().contains("cedid") || d.getExtractedText().toLowerCase().contains("cess"))) {
                    hasCedida = true;
                    break;
                }
            }
        }

        boolean hasMultipleCreditors = false;
        if (allUserDebts != null) {
            long uniqueInstitutions = allUserDebts.stream()
                    .map(Debt::getInstitution)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .distinct()
                    .count();
            if (uniqueInstitutions > 1) {
                hasMultipleCreditors = true;
            }
        }

        boolean hasBalanceDivergence = currentDebtValue != null && (totalAmount.compareTo(currentDebtValue) != 0);

        // Determine Profile
        String profile;
        if (hasNoActiveOperation) {
            profile = "PROFILE_NO_ACTIVE_OPERATION";
        } else if (hasCedida) {
            profile = "PROFILE_ASSIGNED_DEBT";
        } else if (hasBalanceDivergence) {
            profile = "PROFILE_BALANCE_DIVERGENCE";
        } else if (hasMultipleCreditors) {
            profile = "PROFILE_MULTIPLE_CREDITORS";
        } else {
            profile = "PROFILE_CLARIFICATION";
        }

        return RegulatoryCaseContext.builder()
                .profile(profile)
                .hasCedida(hasCedida)
                .hasMultipleCreditors(hasMultipleCreditors)
                .hasNoActiveOperation(hasNoActiveOperation)
                .hasBalanceDivergence(hasBalanceDivergence)
                .debtCount(debtCount)
                .totalAmount(totalAmount)
                .build();
    }
}
