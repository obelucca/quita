package com.quita.api.payment.repository;

import com.quita.api.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Payment> findByMercadopagoPreferenceId(String preferenceId);
    Optional<Payment> findByMercadopagoPaymentId(String paymentId);
}
