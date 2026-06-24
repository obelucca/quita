package com.quita.api.payment.service;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.net.MPResultsResourcesPage;
import com.mercadopago.net.MPSearchRequest;
import com.quita.api.payment.model.Payment;
import com.quita.api.payment.model.PaymentEventSource;
import com.quita.api.payment.model.PaymentEventType;
import com.quita.api.payment.model.PaymentStatus;
import com.quita.api.payment.repository.PaymentRepository;
import com.quita.api.user.service.CreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReconciliationService {

    private final PaymentRepository paymentRepository;
    private final CreditService creditService;
    private final PaymentAuditService paymentAuditService;

    @Value("${app.mercadopago.access-token:TEST-XXXXXXXX}")
    private String accessToken;

    protected PaymentClient getPaymentClient() {
        return new PaymentClient();
    }

    @Transactional
    public void reconcilePendingPayments() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        List<Payment> pendingPayments = paymentRepository.findAllByStatusAndCreatedAtBefore(PaymentStatus.PENDING, threshold);

        log.info("Reconciliação Automática - Encontrados {} pagamentos pendentes para conciliação.", pendingPayments.size());

        for (Payment payment : pendingPayments) {
            try {
                reconcilePayment(payment, PaymentEventSource.RECONCILIATION_JOB);
            } catch (Exception e) {
                log.error("Erro ao conciliar pagamento {}: {}", payment.getId(), e.getMessage(), e);
            }
        }
    }

    @Transactional
    public void reconcilePayment(Payment payment, PaymentEventSource source) {
        log.info("Iniciando conciliação para pagamento local: {}, Origem: {}", payment.getId(), source);

        // Record execution event
        paymentAuditService.recordEvent(
                payment.getId(),
                PaymentEventType.RECONCILIATION_EXECUTED,
                payment.getStatus(),
                payment.getStatus(),
                source,
                Map.of("message", "Iniciando verificação de status")
        );

        // Idempotency Safeguard: If already APPROVED, stop immediately.
        if (PaymentStatus.APPROVED.equals(payment.getStatus())) {
            log.info("Reconciliação - Pagamento {} já está APPROVED. Cancelando fluxo.", payment.getId());
            return;
        }

        String mpStatus = null;
        String mpPaymentId = null;

        if ("TEST-XXXXXXXX".equalsIgnoreCase(accessToken)) {
            // Mock Mode: Simulate approval if preference ID ends/contains "approved"
            if (payment.getMercadopagoPreferenceId() != null && payment.getMercadopagoPreferenceId().contains("approved")) {
                mpStatus = "approved";
                mpPaymentId = "MOCK-PAY:" + payment.getId() + ":approved";
            } else if (payment.getMercadopagoPreferenceId() != null && payment.getMercadopagoPreferenceId().contains("rejected")) {
                mpStatus = "rejected";
                mpPaymentId = "MOCK-PAY:" + payment.getId() + ":rejected";
            } else if (payment.getMercadopagoPreferenceId() != null && payment.getMercadopagoPreferenceId().contains("cancelled")) {
                mpStatus = "cancelled";
                mpPaymentId = "MOCK-PAY:" + payment.getId() + ":cancelled";
            } else {
                mpStatus = "pending";
            }
        } else {
            try {
                PaymentClient client = getPaymentClient();
                MPSearchRequest searchRequest = MPSearchRequest.builder()
                        .limit(1)
                        .offset(0)
                        .filters(Map.of("external_reference", payment.getId().toString()))
                        .build();

                MPResultsResourcesPage<com.mercadopago.resources.payment.Payment> results = client.search(searchRequest);
                if (results.getResults() != null && !results.getResults().isEmpty()) {
                    com.mercadopago.resources.payment.Payment mpPayment = results.getResults().get(0);
                    mpStatus = mpPayment.getStatus();
                    mpPaymentId = String.valueOf(mpPayment.getId());
                }
            } catch (Exception e) {
                log.error("Erro de comunicação com o Mercado Pago para pagamento {}: {}", payment.getId(), e.getMessage(), e);
                return; // Tenta no próximo ciclo
            }
        }

        if (mpStatus == null) {
            log.info("Reconciliação - Nenhuma transação correspondente encontrada no Mercado Pago para pagamento: {}", payment.getId());
            return;
        }

        PaymentStatus oldStatus = payment.getStatus();

        if ("approved".equalsIgnoreCase(mpStatus)) {
            payment.setStatus(PaymentStatus.APPROVED);
            payment.setApprovedAt(LocalDateTime.now());
            if (mpPaymentId != null) {
                payment.setMercadopagoPaymentId(mpPaymentId);
            }
            paymentRepository.save(payment);

            // Grant credits
            com.quita.api.user.dto.CreditAllocationResult allocation = creditService.addCredits(payment.getUserId(), payment.getCreditsQuantity());

            paymentAuditService.recordEvent(
                    payment.getId(),
                    PaymentEventType.RECONCILIATION_APPROVED,
                    oldStatus,
                    PaymentStatus.APPROVED,
                    source,
                    Map.of("mercadopagoPaymentId", mpPaymentId != null ? mpPaymentId : "unknown")
            );

            paymentAuditService.recordEvent(
                    payment.getId(),
                    PaymentEventType.CREDITS_GRANTED,
                    PaymentStatus.APPROVED,
                    PaymentStatus.APPROVED,
                    source,
                    Map.of(
                            "credits", payment.getCreditsQuantity(),
                            "balanceBefore", allocation.balanceBefore(),
                            "balanceAfter", allocation.balanceAfter()
                    )
            );

            log.info("Reconciliação - Pagamento {} atualizado para APPROVED. Créditos concedidos: {}",
                    payment.getId(), payment.getCreditsQuantity());

        } else if ("rejected".equalsIgnoreCase(mpStatus)) {
            payment.setStatus(PaymentStatus.REJECTED);
            if (mpPaymentId != null) {
                payment.setMercadopagoPaymentId(mpPaymentId);
            }
            paymentRepository.save(payment);

            paymentAuditService.recordEvent(
                    payment.getId(),
                    PaymentEventType.PAYMENT_REJECTED,
                    oldStatus,
                    PaymentStatus.REJECTED,
                    source,
                    Map.of("mercadopagoPaymentId", mpPaymentId != null ? mpPaymentId : "unknown")
            );

            log.info("Reconciliação - Pagamento {} atualizado para REJECTED.", payment.getId());

        } else if ("cancelled".equalsIgnoreCase(mpStatus)) {
            payment.setStatus(PaymentStatus.CANCELLED);
            if (mpPaymentId != null) {
                payment.setMercadopagoPaymentId(mpPaymentId);
            }
            paymentRepository.save(payment);

            paymentAuditService.recordEvent(
                    payment.getId(),
                    PaymentEventType.PAYMENT_CANCELLED,
                    oldStatus,
                    PaymentStatus.CANCELLED,
                    source,
                    Map.of("mercadopagoPaymentId", mpPaymentId != null ? mpPaymentId : "unknown")
            );

            log.info("Reconciliação - Pagamento {} atualizado para CANCELLED.", payment.getId());
        } else {
            log.info("Reconciliação - Pagamento {} mantém status PENDING (MP status: {}).", payment.getId(), mpStatus);
        }
    }
}
