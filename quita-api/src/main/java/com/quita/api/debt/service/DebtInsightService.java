package com.quita.api.debt.service;

import com.quita.api.config.InsightsProperties;
import com.quita.api.debt.dto.DebtInsightResponse;
import com.quita.api.debt.dto.InstitutionInsightResponse;
import com.quita.api.debt.model.Debt;
import com.quita.api.debt.repository.DebtRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DebtInsightService {

    private final DebtRepository debtRepository;
    private final InsightsProperties insightsProperties;

    public DebtInsightResponse getInsights(UUID userId) {
        List<Debt> debts = debtRepository.findAllByUserId(userId);

        if (debts == null || debts.isEmpty()) {
            return DebtInsightResponse.builder()
                    .totalDebts(0)
                    .totalAmount(BigDecimal.ZERO)
                    .institutionsCount(0)
                    .largestInstitution(null)
                    .largestInstitutionAmount(BigDecimal.ZERO)
                    .institutions(Collections.emptyList())
                    .recommendations(Collections.emptyList())
                    .build();
        }

        long totalDebts = debts.size();
        BigDecimal totalAmount = debts.stream()
                .map(Debt::getReportedValue)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group debts by institution (handling null/blank fallbacks)
        Map<String, List<Debt>> grouped = debts.stream()
                .collect(Collectors.groupingBy(d -> {
                    if (d.getInstitution() == null || d.getInstitution().trim().isEmpty()) {
                        return "Instituição não identificada";
                    }
                    return d.getInstitution().trim();
                }));

        // Build list of InstitutionInsightResponse
        List<InstitutionInsightResponse> institutionInsights = new ArrayList<>();
        for (Map.Entry<String, List<Debt>> entry : grouped.entrySet()) {
            String instName = entry.getKey();
            List<Debt> instDebts = entry.getValue();

            BigDecimal amount = instDebts.stream()
                    .map(Debt::getReportedValue)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long operations = instDebts.size();

            institutionInsights.add(InstitutionInsightResponse.builder()
                    .institution(instName)
                    .amount(amount)
                    .operations(operations)
                    .build());
        }

        // Sort institutions by amount descending
        institutionInsights.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));

        long institutionsCount = institutionInsights.size();
        String largestInstitution = null;
        BigDecimal largestInstitutionAmount = BigDecimal.ZERO;

        if (!institutionInsights.isEmpty()) {
            InstitutionInsightResponse largest = institutionInsights.get(0);
            largestInstitution = largest.getInstitution();
            largestInstitutionAmount = largest.getAmount();
        }

        // Generate recommendations
        List<String> recommendations = new ArrayList<>();
        if (institutionsCount == 1) {
            recommendations.add("Concentre seus esforços de negociação nesta instituição.");
        } else if (institutionsCount > 1) {
            if (institutionsCount >= 3) {
                recommendations.add("Priorize as operações com maior impacto financeiro.");
            }
            recommendations.add("Considere gerar reclamações individualmente para cada instituição.");
        }

        BigDecimal threshold = insightsProperties.getHighDebtThreshold();
        if (totalAmount.compareTo(threshold) > 0) {
            recommendations.add("Organize suas negociações por ordem de valor.");
        }

        recommendations.add("Mantenha registro das negociações realizadas.");

        return DebtInsightResponse.builder()
                .totalDebts(totalDebts)
                .totalAmount(totalAmount)
                .institutionsCount(institutionsCount)
                .largestInstitution(largestInstitution)
                .largestInstitutionAmount(largestInstitutionAmount)
                .institutions(institutionInsights)
                .recommendations(recommendations)
                .build();
    }
}
