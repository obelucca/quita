package com.quita.api.payment.dto;

import com.quita.api.payment.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private UUID id;
    private String mercadopagoPaymentId;
    private String mercadopagoPreferenceId;
    private String packageName;
    private Integer creditsQuantity;
    private BigDecimal amount;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
}
