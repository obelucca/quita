package com.quita.api.payment.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "payment_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {

    @Id
    private UUID id;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private PaymentEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 20)
    private PaymentStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 20)
    private PaymentStatus newStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_source", nullable = false, length = 30)
    private PaymentEventSource processingSource;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
