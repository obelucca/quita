package com.quita.api.payment.service;

import com.quita.api.payment.model.PaymentEvent;
import com.quita.api.payment.model.PaymentEventSource;
import com.quita.api.payment.model.PaymentEventType;
import com.quita.api.payment.model.PaymentStatus;
import com.quita.api.payment.repository.PaymentEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentAuditService {

    private final PaymentEventRepository paymentEventRepository;

    @Transactional
    public void recordEvent(UUID paymentId, PaymentEventType eventType, PaymentStatus oldStatus, PaymentStatus newStatus, PaymentEventSource source, Map<String, Object> metadata) {
        log.info("Auditoria de pagamento - Evento: {}, PaymentId: {}, OldStatus: {}, NewStatus: {}, Source: {}, Metadata: {}",
                eventType, paymentId, oldStatus, newStatus, source, metadata);

        PaymentEvent event = PaymentEvent.builder()
                .id(UUID.randomUUID())
                .paymentId(paymentId)
                .eventType(eventType)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .processingSource(source)
                .metadata(metadata)
                .createdAt(LocalDateTime.now())
                .build();

        paymentEventRepository.save(event);
    }
}
