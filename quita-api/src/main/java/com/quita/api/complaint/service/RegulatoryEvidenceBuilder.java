package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class RegulatoryEvidenceBuilder {

    public record EvidenceResult(
            String institution,
            BigDecimal originalAmount,
            BigDecimal currentAmount,
            int debtCount,
            boolean hasEvolution,
            boolean hasDivergence,
            boolean hasCedida,
            boolean hasNoActiveOperation,
            List<String> concreteFacts
    ) {}

    public EvidenceResult buildEvidence(String institution, RegulatoryCaseContext context, BigDecimal currentDebtValue) {
        BigDecimal originalAmount = context.getTotalAmount() != null ? context.getTotalAmount() : BigDecimal.ZERO;
        int debtCount = context.getDebtCount();
        boolean hasCedida = context.isHasCedida();
        boolean hasNoActiveOperation = context.isHasNoActiveOperation();
        
        boolean hasEvolution = false;
        boolean hasDivergence = context.isHasBalanceDivergence();
        
        if (currentDebtValue != null && originalAmount.compareTo(BigDecimal.ZERO) > 0) {
            hasEvolution = currentDebtValue.compareTo(originalAmount) != 0;
            if (currentDebtValue.compareTo(originalAmount) > 0) {
                hasDivergence = true;
            }
        }

        List<String> concreteFacts = new ArrayList<>();
        concreteFacts.add(String.format("Registro formalizado de operação junto à instituição %s.", institution));
        
        if (debtCount > 0) {
            concreteFacts.add(String.format("Identificação de %d registro(s) ativo(s) no Sistema de Informações de Crédito (SCR) do Banco Central.", debtCount));
            concreteFacts.add(String.format("Apontamento de saldo devedor original no montante de R$ %,.2f registrado nas consultas oficiais.", originalAmount));
        }
        
        if (currentDebtValue != null) {
            concreteFacts.add(String.format("Informação de cobrança ou exigência ativa atual no valor de R$ %,.2f.", currentDebtValue));
            if (hasEvolution) {
                concreteFacts.add(String.format("Existência de evolução ou alteração de saldo entre o apontamento de R$ %,.2f e a cobrança de R$ %,.2f.", originalAmount, currentDebtValue));
            }
        }

        if (hasCedida) {
            concreteFacts.add("Indicativo de operação financeira originalmente contratada com terceiro e cedida à instituição atual.");
        }
        if (hasNoActiveOperation) {
            concreteFacts.add("Ausência de vias de contratos ativos correspondentes aos apontamentos consultados.");
        }

        return new EvidenceResult(
                institution,
                originalAmount,
                currentDebtValue,
                debtCount,
                hasEvolution,
                hasDivergence,
                hasCedida,
                hasNoActiveOperation,
                concreteFacts
        );
    }
}
