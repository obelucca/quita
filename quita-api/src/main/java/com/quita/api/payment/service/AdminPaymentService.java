package com.quita.api.payment.service;

import com.quita.api.payment.dto.AdminDashboardMetricsResponse;
import com.quita.api.payment.dto.AdminPaymentDetailResponse;
import com.quita.api.payment.dto.AdminPaymentEventResponse;
import com.quita.api.payment.model.Payment;
import com.quita.api.payment.model.PaymentEvent;
import com.quita.api.payment.model.PaymentEventSource;
import com.quita.api.payment.model.PaymentStatus;
import com.quita.api.payment.repository.PaymentEventRepository;
import com.quita.api.payment.repository.PaymentRepository;
import com.quita.api.user.model.User;
import com.quita.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final UserRepository userRepository;
    private final PaymentReconciliationService reconciliationService;

    @Transactional(readOnly = true)
    public AdminDashboardMetricsResponse getMetrics() {
        List<Payment> payments = paymentRepository.findAll();

        BigDecimal totalRevenue = payments.stream()
                .filter(p -> PaymentStatus.APPROVED.equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long approvedCount = payments.stream()
                .filter(p -> PaymentStatus.APPROVED.equals(p.getStatus()))
                .count();

        long pendingCount = payments.stream()
                .filter(p -> PaymentStatus.PENDING.equals(p.getStatus()))
                .count();

        long failedCount = payments.stream()
                .filter(p -> PaymentStatus.REJECTED.equals(p.getStatus()) || PaymentStatus.CANCELLED.equals(p.getStatus()))
                .count();

        return AdminDashboardMetricsResponse.builder()
                .totalRevenue(totalRevenue)
                .approvedCount(approvedCount)
                .pendingCount(pendingCount)
                .failedCount(failedCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminPaymentDetailResponse> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return payments.stream()
                .map(this::mapToDetailResponseSimple)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminPaymentDetailResponse getPaymentDetail(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));

        User user = userRepository.findById(payment.getUserId()).orElse(null);
        List<PaymentEvent> events = paymentEventRepository.findAllByPaymentIdOrderByCreatedAtAsc(paymentId);

        List<AdminPaymentEventResponse> eventResponses = events.stream()
                .map(e -> AdminPaymentEventResponse.builder()
                        .id(e.getId())
                        .eventType(e.getEventType())
                        .oldStatus(e.getOldStatus())
                        .newStatus(e.getNewStatus())
                        .processingSource(e.getProcessingSource())
                        .metadata(e.getMetadata())
                        .createdAt(e.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return AdminPaymentDetailResponse.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .userName(user != null ? user.getName() : "Unknown")
                .userEmail(user != null ? user.getEmail() : "Unknown")
                .packageName(payment.getPackageName())
                .creditsQuantity(payment.getCreditsQuantity())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .mercadopagoPaymentId(payment.getMercadopagoPaymentId())
                .mercadopagoPreferenceId(payment.getMercadopagoPreferenceId())
                .createdAt(payment.getCreatedAt())
                .approvedAt(payment.getApprovedAt())
                .events(eventResponses)
                .build();
    }

    @Transactional
    public AdminPaymentDetailResponse forceReconciliation(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));

        reconciliationService.reconcilePayment(payment, PaymentEventSource.ADMIN);

        // Fetch fresh state
        return getPaymentDetail(paymentId);
    }

    private AdminPaymentDetailResponse mapToDetailResponseSimple(Payment payment) {
        User user = userRepository.findById(payment.getUserId()).orElse(null);
        return AdminPaymentDetailResponse.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .userName(user != null ? user.getName() : "Unknown")
                .userEmail(user != null ? user.getEmail() : "Unknown")
                .packageName(payment.getPackageName())
                .creditsQuantity(payment.getCreditsQuantity())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .mercadopagoPaymentId(payment.getMercadopagoPaymentId())
                .mercadopagoPreferenceId(payment.getMercadopagoPreferenceId())
                .createdAt(payment.getCreatedAt())
                .approvedAt(payment.getApprovedAt())
                .events(List.of())
                .build();
    }
}
