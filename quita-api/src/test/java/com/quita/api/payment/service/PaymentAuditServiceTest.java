package com.quita.api.payment.service;

import com.quita.api.payment.model.PaymentEvent;
import com.quita.api.payment.model.PaymentEventSource;
import com.quita.api.payment.model.PaymentEventType;
import com.quita.api.payment.model.PaymentStatus;
import com.quita.api.payment.repository.PaymentEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PaymentAuditServiceTest {

    @Mock
    private PaymentEventRepository paymentEventRepository;

    @InjectMocks
    private PaymentAuditService paymentAuditService;

    @Test
    void recordEvent_SavesEventToRepository() {
        UUID paymentId = UUID.randomUUID();
        Map<String, Object> metadata = Map.of("testKey", "testValue");

        paymentAuditService.recordEvent(
                paymentId,
                PaymentEventType.PAYMENT_APPROVED,
                PaymentStatus.PENDING,
                PaymentStatus.APPROVED,
                PaymentEventSource.WEBHOOK,
                metadata
        );

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);
        verify(paymentEventRepository).save(eventCaptor.capture());

        PaymentEvent savedEvent = eventCaptor.getValue();
        assertNotNull(savedEvent);
        assertNotNull(savedEvent.getId());
        assertEquals(paymentId, savedEvent.getPaymentId());
        assertEquals(PaymentEventType.PAYMENT_APPROVED, savedEvent.getEventType());
        assertEquals(PaymentStatus.PENDING, savedEvent.getOldStatus());
        assertEquals(PaymentStatus.APPROVED, savedEvent.getNewStatus());
        assertEquals(PaymentEventSource.WEBHOOK, savedEvent.getProcessingSource());
        assertEquals(metadata, savedEvent.getMetadata());
        assertNotNull(savedEvent.getCreatedAt());
    }
}
