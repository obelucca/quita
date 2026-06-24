package com.quita.api.payment.controller;

import com.quita.api.payment.dto.AdminDashboardMetricsResponse;
import com.quita.api.payment.dto.AdminPaymentDetailResponse;
import com.quita.api.payment.service.AdminPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminDashboardMetricsResponse> getMetrics() {
        return ResponseEntity.ok(adminPaymentService.getMetrics());
    }

    @GetMapping
    public ResponseEntity<List<AdminPaymentDetailResponse>> getAllPayments() {
        return ResponseEntity.ok(adminPaymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminPaymentDetailResponse> getPaymentDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(adminPaymentService.getPaymentDetail(id));
    }

    @PostMapping("/{id}/reconcile")
    public ResponseEntity<AdminPaymentDetailResponse> forceReconciliation(@PathVariable UUID id) {
        return ResponseEntity.ok(adminPaymentService.forceReconciliation(id));
    }
}
