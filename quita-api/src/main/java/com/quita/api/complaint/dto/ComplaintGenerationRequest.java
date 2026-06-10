package com.quita.api.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintGenerationRequest {

    @NotBlank(message = "Institution name is required")
    private String institution;

    private BigDecimal currentDebtValue;
}
