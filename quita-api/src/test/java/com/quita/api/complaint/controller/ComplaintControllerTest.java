package com.quita.api.complaint.controller;

import com.quita.api.auth.service.JwtService;
import com.quita.api.complaint.model.Complaint;
import com.quita.api.complaint.repository.ComplaintRepository;
import com.quita.api.user.model.User;
import com.quita.api.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ComplaintControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User userA;
    private User userB;
    private String tokenA;
    private String tokenB;
    private Complaint complaintA;

    @BeforeEach
    void setUp() {
        complaintRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // Create User A
        userA = User.builder()
                .name("User A")
                .email("usera@email.com")
                .password(passwordEncoder.encode("passwordA"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.saveAndFlush(userA);
        tokenA = "Bearer " + jwtService.generateToken(userA.getId().toString(), userA.getEmail());

        // Create User B
        userB = User.builder()
                .name("User B")
                .email("userb@email.com")
                .password(passwordEncoder.encode("passwordB"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.saveAndFlush(userB);
        tokenB = "Bearer " + jwtService.generateToken(userB.getId().toString(), userB.getEmail());

        // Complaint for User A
        complaintA = Complaint.builder()
                .id(UUID.randomUUID())
                .userId(userA.getId())
                .institution("Banco Inter")
                .title("Solicitação de revisão contratual")
                .complaintText("Texto original do User A")
                .currentDebtValue(new BigDecimal("1000.00"))
                .generatedBy("GEMINI")
                .version(1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        complaintRepository.saveAndFlush(complaintA);
    }

    @AfterEach
    void tearDown() {
        complaintRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    @Test
    void shouldReturnUnauthorizedWhenRequestingWithoutToken() throws Exception {
        mockMvc.perform(get("/complaints")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldEnforceMultiTenancyAndDenyAccessToOtherUserComplaint() throws Exception {
        // User B trying to access User A's complaint should get 404 Not Found
        mockMvc.perform(get("/complaints/" + complaintA.getId())
                        .header(HttpHeaders.AUTHORIZATION, tokenB)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldAllowUserToAccessOwnComplaint() throws Exception {
        mockMvc.perform(get("/complaints/" + complaintA.getId())
                        .header(HttpHeaders.AUTHORIZATION, tokenA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(complaintA.getId().toString())))
                .andExpect(jsonPath("$.institution", is("Banco Inter")))
                .andExpect(jsonPath("$.complaint", is("Texto original do User A")))
                .andExpect(jsonPath("$.editable", is(true)))
                .andExpect(jsonPath("$.disclaimer", notNullValue()))
                .andExpect(jsonPath("$.consumerGovInstructions", hasSize(5)));
    }

    @Test
    void shouldGenerateComplaintForUser() throws Exception {
        String requestBody = "{\"institution\": \"Nubank\", \"currentDebtValue\": 500.00}";

        mockMvc.perform(post("/complaints/generate")
                        .header(HttpHeaders.AUTHORIZATION, tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.institution", is("Nubank")))
                .andExpect(jsonPath("$.complaint", notNullValue()))
                .andExpect(jsonPath("$.editable", is(true)));
    }

    @Test
    void shouldRegenerateAndCreateNewVersion() throws Exception {
        String requestBody = "{\"currentDebtValue\": 1200.00}";

        mockMvc.perform(post("/complaints/" + complaintA.getId() + "/regenerate")
                        .header(HttpHeaders.AUTHORIZATION, tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.institution", is("Banco Inter")))
                .andExpect(jsonPath("$.complaint", notNullValue()));

        // Check that a new version was indeed added to the database
        int maxVersion = complaintRepository.findMaxVersionByUserIdAndInstitution(userA.getId(), "Banco Inter");
        assertEquals(2, maxVersion, "New version should be 2 after regeneration");
    }

    @Test
    void shouldDownloadPdfSuccessfully() throws Exception {
        mockMvc.perform(get("/complaints/" + complaintA.getId() + "/pdf")
                        .header(HttpHeaders.AUTHORIZATION, tokenA))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("attachment; filename=\"reclamacao_Banco_Inter_v1.pdf\"")))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }
}
