package com.quita.api.debt.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionInsightResponse {
    private String institution;
    private BigDecimal amount;
    private long operations;
}
