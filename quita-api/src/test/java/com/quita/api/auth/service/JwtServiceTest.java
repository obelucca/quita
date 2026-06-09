package com.quita.api.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "9a2f7c4e5b6d8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f");
    }

    @Test
    void shouldGenerateAndValidateToken() {
        String userId = "f5c0fd38-3fc4-457b-83f0-9eef7b051c06";
        String email = "cleber@email.com";

        String token = jwtService.generateToken(userId, email);
        assertNotNull(token);

        assertTrue(jwtService.validateToken(token));
        assertEquals(userId, jwtService.extractSubject(token));
        assertEquals(email, jwtService.extractEmail(token));
    }

    @Test
    void shouldReturnFalseForInvalidToken() {
        assertFalse(jwtService.validateToken("invalid-token-string"));
    }
}
