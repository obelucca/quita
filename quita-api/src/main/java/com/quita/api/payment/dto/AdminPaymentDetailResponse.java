package com.quita.api.payment.dto;

import com.quita.api.payment.model.PaymentStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class AdminPaymentDetailResponse {
    UUID id;
    UUID userId;
    String userName;
    String userEmail;
    String packageName;
    int creditsQuantity;
    BigDecimal amount;
    PaymentStatus status;
    String mercadopagoPaymentId;
    String mercadopagoPreferenceId;
    LocalDateTime createdAt;
    LocalDateTime approvedAt;
    List<AdminPaymentEventResponse> events;
}
