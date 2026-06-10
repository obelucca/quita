package com.quita.api.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quita.api.auth.dto.LoginRequest;
import com.quita.api.auth.dto.RegisterRequest;
import com.quita.api.user.model.User;
import com.quita.api.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.quita.api.complaint.repository.ComplaintRepository complaintRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        complaintRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Cleber Lucas")
                .email("cleber@email.com")
                .password("123456")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Cleber Lucas")))
                .andExpect(jsonPath("$.email", is("cleber@email.com")))
                .andExpect(jsonPath("$.password").doesNotExist());

        User persistedUser = userRepository.findByEmail("cleber@email.com")
                .orElseThrow(() -> new AssertionError("User not saved in DB"));

        assertEquals("Cleber Lucas", persistedUser.getName());
        assertTrue(passwordEncoder.matches("123456", persistedUser.getPassword()));
        assertNotNull(persistedUser.getCreatedAt());
        assertNotNull(persistedUser.getUpdatedAt());
    }

    @Test
    void shouldReturnConflictWhenEmailAlreadyExists() throws Exception {
        User existingUser = User.builder()
                .name("Existing User")
                .email("existing@email.com")
                .password(passwordEncoder.encode("secret123"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.save(existingUser);

        RegisterRequest request = RegisterRequest.builder()
                .name("New User")
                .email("existing@email.com")
                .password("123456")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("Email already registered")));
    }

    @Test
    void shouldReturnBadRequestWhenNameIsInvalid() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Ab") // < 3 chars
                .email("valid@email.com")
                .password("123456")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Validation error")))
                .andExpect(jsonPath("$.errors[0].field", is("name")))
                .andExpect(jsonPath("$.errors[0].message", containsString("3 and 120")));
    }

    @Test
    void shouldReturnBadRequestWhenEmailIsInvalid() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Cleber Lucas")
                .email("invalid-email")
                .password("123456")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Validation error")))
                .andExpect(jsonPath("$.errors[0].field", is("email")))
                .andExpect(jsonPath("$.errors[0].message", is("must be a well-formed email address")));
    }

    @Test
    void shouldReturnBadRequestWhenPasswordIsInvalid() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Cleber Lucas")
                .email("valid@email.com")
                .password("1234") // < 6 chars
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Validation error")))
                .andExpect(jsonPath("$.errors[0].field", is("password")))
                .andExpect(jsonPath("$.errors[0].message", containsString("6 and 100")));
    }

    @Test
    void shouldLoginSuccessfully() throws Exception {
        User user = User.builder()
                .name("Cleber Lucas")
                .email("cleber@email.com")
                .password(passwordEncoder.encode("123456"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.save(user);

        LoginRequest loginRequest = LoginRequest.builder()
                .email("cleber@email.com")
                .password("123456")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.type", is("Bearer")));
    }

    @Test
    void shouldReturnUnauthorizedOnInvalidPassword() throws Exception {
        User user = User.builder()
                .name("Cleber Lucas")
                .email("cleber@email.com")
                .password(passwordEncoder.encode("123456"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.save(user);

        LoginRequest loginRequest = LoginRequest.builder()
                .email("cleber@email.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Invalid credentials")));
    }

    @Test
    void shouldReturnUnauthorizedOnNonExistentUser() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("nonexistent@email.com")
                .password("123456")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Invalid credentials")));
    }
}
