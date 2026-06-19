package com.quita.api.user.service;

import com.quita.api.exception.InsufficientCreditsException;
import com.quita.api.user.dto.UserCreditsResponse;
import com.quita.api.user.model.User;
import com.quita.api.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreditServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CreditService creditService;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .name("Test User")
                .email("test@example.com")
                .freeComplaintUsed(false)
                .complaintCredits(0)
                .build();
    }

    @Test
    void shouldGetUserCreditsSuccessfully() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserCreditsResponse response = creditService.getUserCredits(userId);

        assertNotNull(response);
        assertFalse(response.getFreeComplaintUsed());
        assertEquals(0, response.getAvailableCredits());
    }

    @Test
    void shouldThrowNotFoundWhenUserDoesNotExistInGetCredits() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> creditService.getUserCredits(userId));
    }

    @Test
    void shouldConsumeFreeCreditWhenNotUsedYet() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        creditService.consumeCredit(userId);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();
        assertTrue(savedUser.getFreeComplaintUsed());
        assertEquals(0, savedUser.getComplaintCredits());
    }

    @Test
    void shouldConsumePaidCreditWhenFreeIsUsedAndHasCredits() {
        user.setFreeComplaintUsed(true);
        user.setComplaintCredits(2);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        creditService.consumeCredit(userId);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();
        assertTrue(savedUser.getFreeComplaintUsed());
        assertEquals(1, savedUser.getComplaintCredits());
    }

    @Test
    void shouldThrowExceptionWhenFreeUsedAndNoCreditsAvailable() {
        user.setFreeComplaintUsed(true);
        user.setComplaintCredits(0);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        InsufficientCreditsException ex = assertThrows(InsufficientCreditsException.class,
                () -> creditService.consumeCredit(userId));

        assertEquals("Você já utilizou sua contestação gratuita. Adquira créditos para continuar.", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldAddCreditsSuccessfully() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        creditService.addCredits(userId, 5);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();
        assertEquals(5, savedUser.getComplaintCredits());
    }
}
