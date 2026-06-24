package com.quita.api.payment.dto;

import com.quita.api.payment.model.PaymentEventSource;
import com.quita.api.payment.model.PaymentEventType;
import com.quita.api.payment.model.PaymentStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class AdminPaymentEventResponse {
    UUID id;
    PaymentEventType eventType;
    PaymentStatus oldStatus;
    PaymentStatus newStatus;
    PaymentEventSource processingSource;
    Map<String, Object> metadata;
    LocalDateTime createdAt;
}
