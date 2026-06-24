package com.quita.api.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentReconciliationJob {

    private final PaymentReconciliationService reconciliationService;

    @Scheduled(cron = "0 */15 * * * *")
    public void reconcilePayments() {
        log.info("Job de Reconciliação de Pagamentos iniciado.");
        reconciliationService.reconcilePendingPayments();
        log.info("Job de Reconciliação de Pagamentos concluído.");
    }
}
