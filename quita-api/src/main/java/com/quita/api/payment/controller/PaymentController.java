package com.quita.api.payment.controller;

import com.quita.api.auth.security.UserPrincipal;
import com.quita.api.payment.dto.CheckoutResponse;
import com.quita.api.payment.dto.CreateCheckoutRequest;
import com.quita.api.payment.dto.PaymentResponse;
import com.quita.api.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-checkout")
    public ResponseEntity<CheckoutResponse> createCheckout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateCheckoutRequest request) {
        return ResponseEntity.ok(paymentService.createCheckout(principal.getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.getPayment(principal.getId(), id));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paymentService.getUserPayments(principal.getId()));
    }

    @PostMapping("/webhook")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Void> webhook(
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId,
            @RequestBody Map<String, Object> body) {
        
        String action = (String) body.get("action");
        Map<String, Object> data = (Map<String, Object>) body.get("data");
        
        if (data != null && data.containsKey("id")) {
            String dataId = String.valueOf(data.get("id"));
            paymentService.processWebhook(xSignature, xRequestId, dataId, action);
        }
        
        return ResponseEntity.ok().build();
    }
}
