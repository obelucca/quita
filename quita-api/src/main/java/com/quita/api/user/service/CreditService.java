package com.quita.api.user.service;

import com.quita.api.exception.InsufficientCreditsException;
import com.quita.api.user.dto.UserCreditsResponse;
import com.quita.api.user.model.User;
import com.quita.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserCreditsResponse getUserCredits(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserCreditsResponse.builder()
                .freeComplaintUsed(user.getFreeComplaintUsed())
                .availableCredits(user.getComplaintCredits())
                .build();
    }

    @Transactional(readOnly = true)
    public void validateCanGenerate(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getFreeComplaintUsed()) {
            return;
        }

        if (user.getComplaintCredits() <= 0) {
            throw new InsufficientCreditsException("Você já utilizou sua contestação gratuita. Adquira créditos para continuar.");
        }
    }

    @Transactional
    public void consumeCredit(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getFreeComplaintUsed()) {
            user.setFreeComplaintUsed(true);
            userRepository.save(user);
        } else if (user.getComplaintCredits() > 0) {
            user.setComplaintCredits(user.getComplaintCredits() - 1);
            userRepository.save(user);
        } else {
            throw new InsufficientCreditsException("Você já utilizou sua contestação gratuita. Adquira créditos para continuar.");
        }
    }

    @Transactional
    public com.quita.api.user.dto.CreditAllocationResult addCredits(UUID userId, int credits) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        int balanceBefore = user.getComplaintCredits();
        int balanceAfter = balanceBefore + credits;
        user.setComplaintCredits(balanceAfter);
        userRepository.save(user);
        return new com.quita.api.user.dto.CreditAllocationResult(balanceBefore, balanceAfter);
    }
}
