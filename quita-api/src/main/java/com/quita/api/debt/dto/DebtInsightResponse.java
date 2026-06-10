package com.quita.api.debt.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtInsightResponse {
    private long totalDebts;
    private BigDecimal totalAmount;
    private long institutionsCount;
    private String largestInstitution;
    private BigDecimal largestInstitutionAmount;
    private List<InstitutionInsightResponse> institutions;
    private List<String> recommendations;
}
