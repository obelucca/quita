package com.quita.api.payment.service;

import com.mercadopago.client.payment.PaymentClient;
import com.quita.api.payment.model.Payment;
import com.quita.api.payment.model.PaymentEventSource;
import com.quita.api.payment.model.PaymentEventType;
import com.quita.api.payment.model.PaymentStatus;
import com.quita.api.payment.repository.PaymentRepository;
import com.quita.api.user.dto.CreditAllocationResult;
import com.quita.api.user.service.CreditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentReconciliationServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private CreditService creditService;

    @Mock
    private PaymentAuditService paymentAuditService;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    @Spy
    private PaymentReconciliationService reconciliationService;

    private Payment pendingPayment;
    private UUID paymentId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        paymentId = UUID.randomUUID();
        userId = UUID.randomUUID();
        ReflectionTestUtils.setField(reconciliationService, "accessToken", "TEST-XXXXXXXX");

        pendingPayment = Payment.builder()
                .id(paymentId)
                .userId(userId)
                .mercadopagoPreferenceId("MOCK-PREF-" + paymentId + "-approved")
                .packageName("Pacote Starter (3 Créditos)")
                .creditsQuantity(3)
                .amount(new BigDecimal("19.90"))
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now().minusMinutes(20))
                .build();
    }

    @Test
    void reconcilePendingPayments_TriggersReconciliationForPending() {
        when(paymentRepository.findAllByStatusAndCreatedAtBefore(eq(PaymentStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(pendingPayment));
        when(creditService.addCredits(any(UUID.class), anyInt()))
                .thenReturn(new CreditAllocationResult(0, 3));

        reconciliationService.reconcilePendingPayments();

        verify(paymentRepository).save(pendingPayment);
        assertEquals(PaymentStatus.APPROVED, pendingPayment.getStatus());
        verify(creditService).addCredits(userId, 3);
        verify(paymentAuditService).recordEvent(
                eq(paymentId),
                eq(PaymentEventType.RECONCILIATION_APPROVED),
                eq(PaymentStatus.PENDING),
                eq(PaymentStatus.APPROVED),
                eq(PaymentEventSource.RECONCILIATION_JOB),
                any()
        );
    }

    @Test
    void reconcilePayment_Approved_ChangesStatusAndAddsCredits() {
        when(creditService.addCredits(userId, 3))
                .thenReturn(new CreditAllocationResult(10, 13));

        reconciliationService.reconcilePayment(pendingPayment, PaymentEventSource.RECONCILIATION_JOB);

        verify(paymentRepository).save(pendingPayment);
        assertEquals(PaymentStatus.APPROVED, pendingPayment.getStatus());
        assertNotNull(pendingPayment.getApprovedAt());
        verify(creditService).addCredits(userId, 3);

        verify(paymentAuditService).recordEvent(
                eq(paymentId),
                eq(PaymentEventType.RECONCILIATION_APPROVED),
                eq(PaymentStatus.PENDING),
                eq(PaymentStatus.APPROVED),
                eq(PaymentEventSource.RECONCILIATION_JOB),
                any()
        );

        verify(paymentAuditService).recordEvent(
                eq(paymentId),
                eq(PaymentEventType.CREDITS_GRANTED),
                eq(PaymentStatus.APPROVED),
                eq(PaymentStatus.APPROVED),
                eq(PaymentEventSource.RECONCILIATION_JOB),
                eq(java.util.Map.of(
                        "credits", 3,
                        "balanceBefore", 10,
                        "balanceAfter", 13
                ))
        );
    }

    @Test
    void reconcilePayment_Rejected_ChangesStatus() {
        pendingPayment.setMercadopagoPreferenceId("MOCK-PREF-" + paymentId + "-rejected");

        reconciliationService.reconcilePayment(pendingPayment, PaymentEventSource.RECONCILIATION_JOB);

        verify(paymentRepository).save(pendingPayment);
        assertEquals(PaymentStatus.REJECTED, pendingPayment.getStatus());
        verifyNoInteractions(creditService);

        verify(paymentAuditService).recordEvent(
                eq(paymentId),
                eq(PaymentEventType.PAYMENT_REJECTED),
                eq(PaymentStatus.PENDING),
                eq(PaymentStatus.REJECTED),
                eq(PaymentEventSource.RECONCILIATION_JOB),
                any()
        );
    }

    @Test
    void reconcilePayment_AlreadyApproved_AbortsImmediately() {
        pendingPayment.setStatus(PaymentStatus.APPROVED);

        reconciliationService.reconcilePayment(pendingPayment, PaymentEventSource.RECONCILIATION_JOB);

        verify(paymentRepository, never()).save(any());
        verifyNoInteractions(creditService);
    }
}
