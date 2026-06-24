package com.quita.api.payment.service;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.quita.api.payment.dto.CheckoutResponse;
import com.quita.api.payment.dto.CreateCheckoutRequest;
import com.quita.api.payment.dto.PaymentResponse;
import com.quita.api.payment.model.Payment;
import com.quita.api.payment.model.PaymentStatus;
import com.quita.api.payment.repository.PaymentRepository;
import com.quita.api.user.service.CreditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private CreditService creditService;

    @Mock
    private PreferenceClient preferenceClient;

    @Mock
    private PaymentClient paymentClient;

    @Mock
    private PaymentAuditService paymentAuditService;

    @InjectMocks
    @Spy
    private PaymentService paymentService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        ReflectionTestUtils.setField(paymentService, "frontendUrl", "http://localhost:3000");
        ReflectionTestUtils.setField(paymentService, "webhookSecret", "TEST-XXXXXXXX");
    }

    @Test
    void createCheckout_StarterSuccess() throws MPException, MPApiException {
        doReturn(preferenceClient).when(paymentService).getPreferenceClient();
        CreateCheckoutRequest request = CreateCheckoutRequest.builder().packageId("STARTER").build();

        Preference mockPreference = mock(Preference.class);
        when(mockPreference.getId()).thenReturn("pref-123");
        when(mockPreference.getInitPoint()).thenReturn("https://mercadopago.com/checkout/pref-123");

        when(preferenceClient.create(any())).thenReturn(mockPreference);

        CheckoutResponse response = paymentService.createCheckout(userId, request);

        assertNotNull(response);
        assertEquals("https://mercadopago.com/checkout/pref-123", response.getCheckoutUrl());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void createCheckout_InvalidPackageThrowsException() {
        CreateCheckoutRequest request = CreateCheckoutRequest.builder().packageId("INVALID").build();

        assertThrows(ResponseStatusException.class, () -> {
            paymentService.createCheckout(userId, request);
        });
        verifyNoInteractions(paymentRepository);
    }

    @Test
    void processWebhook_ApprovedPaymentCreditsUser() throws MPException, MPApiException {
        doReturn(paymentClient).when(paymentService).getPaymentClient();
        UUID paymentId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .id(paymentId)
                .userId(userId)
                .creditsQuantity(3)
                .amount(new BigDecimal("19.90"))
                .packageName("Pacote Inicial (3 Créditos)")
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        com.mercadopago.resources.payment.Payment mpPayment = mock(com.mercadopago.resources.payment.Payment.class);
        when(mpPayment.getStatus()).thenReturn("approved");
        when(mpPayment.getExternalReference()).thenReturn(paymentId.toString());

        when(paymentClient.get(123456789L)).thenReturn(mpPayment);
        when(creditService.addCredits(userId, 3)).thenReturn(new com.quita.api.user.dto.CreditAllocationResult(0, 3));

        paymentService.processWebhook(null, null, "123456789", "payment.updated");

        assertEquals(PaymentStatus.APPROVED, payment.getStatus());
        assertNotNull(payment.getApprovedAt());
        assertEquals("123456789", payment.getMercadopagoPaymentId());

        verify(paymentRepository, times(1)).save(payment);
        verify(creditService, times(1)).addCredits(userId, 3);
    }

    @Test
    void processWebhook_DuplicateWebhookIgnored() throws MPException, MPApiException {
        doReturn(paymentClient).when(paymentService).getPaymentClient();
        UUID paymentId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .id(paymentId)
                .userId(userId)
                .creditsQuantity(3)
                .status(PaymentStatus.APPROVED)
                .build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        com.mercadopago.resources.payment.Payment mpPayment = mock(com.mercadopago.resources.payment.Payment.class);
        when(mpPayment.getStatus()).thenReturn("approved");
        when(mpPayment.getExternalReference()).thenReturn(paymentId.toString());

        when(paymentClient.get(123456789L)).thenReturn(mpPayment);

        paymentService.processWebhook(null, null, "123456789", "payment.updated");

        // Should not call creditService or save to repository again because it's already approved
        verify(creditService, never()).addCredits(any(), anyInt());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void processWebhook_RejectedPaymentUpdatesStatus() throws MPException, MPApiException {
        doReturn(paymentClient).when(paymentService).getPaymentClient();
        UUID paymentId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .id(paymentId)
                .userId(userId)
                .creditsQuantity(10)
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        com.mercadopago.resources.payment.Payment mpPayment = mock(com.mercadopago.resources.payment.Payment.class);
        when(mpPayment.getStatus()).thenReturn("rejected");
        when(mpPayment.getExternalReference()).thenReturn(paymentId.toString());

        when(paymentClient.get(123456789L)).thenReturn(mpPayment);

        paymentService.processWebhook(null, null, "123456789", "payment.updated");

        assertEquals(PaymentStatus.REJECTED, payment.getStatus());
        verify(paymentRepository, times(1)).save(payment);
        verify(creditService, never()).addCredits(any(), anyInt());
    }

    @Test
    void getUserPayments_Success() {
        Payment payment = Payment.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .packageName("Pacote Inicial (3 Créditos)")
                .amount(new BigDecimal("19.90"))
                .status(PaymentStatus.APPROVED)
                .build();

        when(paymentRepository.findAllByUserIdOrderByCreatedAtDesc(userId)).thenReturn(Collections.singletonList(payment));

        List<PaymentResponse> response = paymentService.getUserPayments(userId);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("Pacote Inicial (3 Créditos)", response.get(0).getPackageName());
    }

    @Test
    void processWebhook_InvalidSignatureThrowsException() {
        ReflectionTestUtils.setField(paymentService, "webhookSecret", "REAL-SECRET");
        assertThrows(ResponseStatusException.class, () -> {
            paymentService.processWebhook("ts=123,v1=wrongsignature", "x-request-id-123", "123456789", "payment.updated");
        });
    }

    @Test
    void processWebhook_MPApiExceptionThrowsException() throws MPException, MPApiException {
        doReturn(paymentClient).when(paymentService).getPaymentClient();
        
        com.mercadopago.net.MPResponse mockApiResponse = mock(com.mercadopago.net.MPResponse.class);
        when(mockApiResponse.getStatusCode()).thenReturn(400);
        when(mockApiResponse.getContent()).thenReturn("Bad Request");
        
        MPApiException mpApiException = new MPApiException("MP API Error", mockApiResponse);
        when(paymentClient.get(123456789L)).thenThrow(mpApiException);

        assertThrows(ResponseStatusException.class, () -> {
            paymentService.processWebhook(null, null, "123456789", "payment.updated");
        });
    }

    @Test
    void processWebhook_MPExceptionThrowsException() throws MPException, MPApiException {
        doReturn(paymentClient).when(paymentService).getPaymentClient();
        
        MPException mpException = new MPException("Timeout");
        when(paymentClient.get(123456789L)).thenThrow(mpException);

        assertThrows(ResponseStatusException.class, () -> {
            paymentService.processWebhook(null, null, "123456789", "payment.updated");
        });
    }

    @Test
    void processWebhook_CancelledPaymentUpdatesStatus() throws MPException, MPApiException {
        doReturn(paymentClient).when(paymentService).getPaymentClient();
        UUID paymentId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .id(paymentId)
                .userId(userId)
                .creditsQuantity(3)
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        com.mercadopago.resources.payment.Payment mpPayment = mock(com.mercadopago.resources.payment.Payment.class);
        when(mpPayment.getStatus()).thenReturn("cancelled");
        when(mpPayment.getExternalReference()).thenReturn(paymentId.toString());

        when(paymentClient.get(123456789L)).thenReturn(mpPayment);

        paymentService.processWebhook(null, null, "123456789", "payment.updated");

        assertEquals(PaymentStatus.CANCELLED, payment.getStatus());
        verify(paymentRepository, times(1)).save(payment);
        verify(creditService, never()).addCredits(any(), anyInt());
    }

    @Test
    void processWebhook_PendingPaymentStatusLogs() throws MPException, MPApiException {
        doReturn(paymentClient).when(paymentService).getPaymentClient();
        UUID paymentId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .id(paymentId)
                .userId(userId)
                .creditsQuantity(3)
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        com.mercadopago.resources.payment.Payment mpPayment = mock(com.mercadopago.resources.payment.Payment.class);
        when(mpPayment.getStatus()).thenReturn("in_process");
        when(mpPayment.getExternalReference()).thenReturn(paymentId.toString());

        when(paymentClient.get(123456789L)).thenReturn(mpPayment);

        paymentService.processWebhook(null, null, "123456789", "payment.updated");

        // Should keep status as PENDING
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        verify(paymentRepository, never()).save(payment);
        verify(creditService, never()).addCredits(any(), anyInt());
    }
}
