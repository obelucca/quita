package com.quita.api.user.controller;

import com.quita.api.auth.security.UserPrincipal;
import com.quita.api.user.dto.UserCreditsResponse;
import com.quita.api.user.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/credits")
@RequiredArgsConstructor
public class CreditsController {

    private final CreditService creditService;

    @GetMapping
    public ResponseEntity<UserCreditsResponse> getCredits(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(creditService.getUserCredits(principal.getId()));
    }
}
