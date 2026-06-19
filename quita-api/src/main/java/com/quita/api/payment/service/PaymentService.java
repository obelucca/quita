package com.quita.api.payment.service;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.quita.api.exception.InsufficientCreditsException;
import com.quita.api.payment.dto.CheckoutResponse;
import com.quita.api.payment.dto.CreateCheckoutRequest;
import com.quita.api.payment.dto.PaymentResponse;
import com.quita.api.payment.model.Payment;
import com.quita.api.payment.model.PaymentStatus;
import com.quita.api.payment.repository.PaymentRepository;
import com.quita.api.user.service.CreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CreditService creditService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.mercadopago.webhook-secret:TEST-XXXXXXXX}")
    private String webhookSecret;

    @Transactional(readOnly = true)
    public List<PaymentResponse> getUserPayments(UUID userId) {
        return paymentRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(UUID userId, UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));
        if (!payment.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este pagamento");
        }
        return mapToResponse(payment);
    }

    @Transactional
    public CheckoutResponse createCheckout(UUID userId, CreateCheckoutRequest request) {
        String packageId = request.getPackageId().toUpperCase();
        String packageName;
        int creditsQuantity;
        BigDecimal amount;

        switch (packageId) {
            case "STARTER":
                packageName = "Pacote Inicial (3 Créditos)";
                creditsQuantity = 3;
                amount = new BigDecimal("19.90");
                break;
            case "INTERMEDIATE":
                packageName = "Pacote Intermediário (10 Créditos)";
                creditsQuantity = 10;
                amount = new BigDecimal("49.90");
                break;
            case "PREMIUM":
                packageName = "Pacote Premium (25 Créditos)";
                creditsQuantity = 25;
                amount = new BigDecimal("99.90");
                break;
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pacote inválido");
        }

        UUID paymentId = UUID.randomUUID();

        try {
            // Configura os Back URLs de retorno para o frontend
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(frontendUrl + "/payment/success")
                    .pending(frontendUrl + "/payment/pending")
                    .failure(frontendUrl + "/payment/failure")
                    .build();

            // Cria o item da preferência
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .id(packageId)
                    .title(packageName)
                    .quantity(1)
                    .unitPrice(amount)
                    .currencyId("BRL")
                    .build();

            // Cria a preferência de checkout
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(Collections.singletonList(item))
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(paymentId.toString())
                    .build();

            PreferenceClient client = getPreferenceClient();
            Preference preference = client.create(preferenceRequest);

            // Cria o registro do pagamento no banco local
            Payment payment = Payment.builder()
                    .id(paymentId)
                    .userId(userId)
                    .mercadopagoPreferenceId(preference.getId())
                    .packageName(packageName)
                    .creditsQuantity(creditsQuantity)
                    .amount(amount)
                    .status(PaymentStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);

            return CheckoutResponse.builder()
                    .checkoutUrl(preference.getInitPoint())
                    .build();

        } catch (MPException | MPApiException e) {
            log.error("Erro ao criar preferência de checkout no Mercado Pago", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar checkout");
        }
    }

    @Transactional
    public void processWebhook(String xSignature, String xRequestId, String dataId, String action) {
        if (!"payment.updated".equalsIgnoreCase(action) && !"payment.created".equalsIgnoreCase(action)) {
            log.info("Ação do webhook ignorada: {}", action);
            return;
        }

        // Validação da assinatura
        if (!verifySignature(dataId, xRequestId, xSignature, webhookSecret)) {
            log.error("Falha na validação de assinatura do webhook do Mercado Pago");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assinatura inválida");
        }

        try {
            // Busca detalhes do pagamento no Mercado Pago
            PaymentClient client = getPaymentClient();
            com.mercadopago.resources.payment.Payment mpPayment = client.get(Long.valueOf(dataId));

            String externalRef = mpPayment.getExternalReference();
            if (externalRef == null) {
                log.warn("Notificação recebida sem externalReference");
                return;
            }

            UUID localPaymentId = UUID.fromString(externalRef);
            Payment payment = paymentRepository.findById(localPaymentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento local não encontrado"));

            String mpStatus = mpPayment.getStatus();
            log.info("Processando webhook para pagamento {}. Status MP: {}", payment.getId(), mpStatus);

            if (PaymentStatus.APPROVED.name().equalsIgnoreCase(payment.getStatus().name())) {
                log.info("Pagamento {} já está aprovado, ignorando processamento duplicado", payment.getId());
                return;
            }

            payment.setMercadopagoPaymentId(dataId);

            if ("approved".equalsIgnoreCase(mpStatus)) {
                payment.setStatus(PaymentStatus.APPROVED);
                payment.setApprovedAt(LocalDateTime.now());
                paymentRepository.save(payment);

                // Credita o usuário com a quantidade de créditos do pacote
                creditService.addCredits(payment.getUserId(), payment.getCreditsQuantity());
                log.info("Pagamento {} aprovado. {} créditos adicionados ao usuário {}", payment.getId(), payment.getCreditsQuantity(), payment.getUserId());
            } else if ("rejected".equalsIgnoreCase(mpStatus)) {
                payment.setStatus(PaymentStatus.REJECTED);
                paymentRepository.save(payment);
                log.info("Pagamento {} rejeitado pelo Mercado Pago", payment.getId());
            } else if ("cancelled".equalsIgnoreCase(mpStatus)) {
                payment.setStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
                log.info("Pagamento {} cancelado pelo Mercado Pago", payment.getId());
            }

        } catch (Exception e) {
            log.error("Erro ao processar webhook do Mercado Pago", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar notificação");
        }
    }

    private boolean verifySignature(String dataId, String xRequestId, String xSignature, String secret) {
        // Se o secret for padrão de teste ou vazio, ignora validação para testes e homologação
        if (secret == null || secret.trim().isEmpty() || "TEST-XXXXXXXX".equalsIgnoreCase(secret) || "TEST".equalsIgnoreCase(secret)) {
            log.info("Bypassing webhook signature validation for testing");
            return true;
        }

        if (xSignature == null || xSignature.isEmpty() || xRequestId == null || xRequestId.isEmpty()) {
            return false;
        }

        try {
            String ts = null;
            String v1 = null;
            String[] parts = xSignature.split(",");
            for (String part : parts) {
                String[] keyValue = part.split("=");
                if (keyValue.length == 2) {
                    if (keyValue[0].trim().equals("ts")) {
                        ts = keyValue[1].trim();
                    } else if (keyValue[0].trim().equals("v1")) {
                        v1 = keyValue[1].trim();
                    }
                }
            }
            if (ts == null || v1 == null) {
                return false;
            }

            // O data.id precisa ser formatado para lowercase no template de validação
            String message = String.format("id:%s;request-id:%s;ts:%s;", dataId.toLowerCase(), xRequestId, ts);

            javax.crypto.Mac sha256HMAC = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKey);
            byte[] hashBytes = sha256HMAC.doFinal(message.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(v1);
        } catch (Exception e) {
            log.error("Erro ao validar assinatura do webhook", e);
            return false;
        }
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .mercadopagoPaymentId(payment.getMercadopagoPaymentId())
                .mercadopagoPreferenceId(payment.getMercadopagoPreferenceId())
                .packageName(payment.getPackageName())
                .creditsQuantity(payment.getCreditsQuantity())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .approvedAt(payment.getApprovedAt())
                .build();
    }

    protected PreferenceClient getPreferenceClient() {
        return new PreferenceClient();
    }

    protected PaymentClient getPaymentClient() {
        return new PaymentClient();
    }
}
