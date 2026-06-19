package com.quita.api.payment.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "mercadopago_payment_id", length = 100)
    private String mercadopagoPaymentId;

    @Column(name = "mercadopago_preference_id", length = 100)
    private String mercadopagoPreferenceId;

    @Column(name = "package_name", nullable = false, length = 50)
    private String packageName;

    @Column(name = "credits_quantity", nullable = false)
    private Integer creditsQuantity;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}
