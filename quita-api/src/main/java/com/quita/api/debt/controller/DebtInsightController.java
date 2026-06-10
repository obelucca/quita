package com.quita.api.debt.controller;

import com.quita.api.auth.security.UserPrincipal;
import com.quita.api.debt.dto.DebtInsightResponse;
import com.quita.api.debt.service.DebtInsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/debts")
@RequiredArgsConstructor
public class DebtInsightController {

    private final DebtInsightService debtInsightService;

    @GetMapping("/insights")
    public ResponseEntity<DebtInsightResponse> getInsights(@AuthenticationPrincipal UserPrincipal principal) {
        DebtInsightResponse response = debtInsightService.getInsights(principal.getId());
        return ResponseEntity.ok(response);
    }
}
