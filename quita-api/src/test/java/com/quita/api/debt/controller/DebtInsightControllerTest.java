package com.quita.api.debt.controller;

import com.quita.api.auth.service.JwtService;
import com.quita.api.debt.model.Debt;
import com.quita.api.debt.repository.DebtRepository;
import com.quita.api.document.model.Document;
import com.quita.api.document.model.DocumentStatus;
import com.quita.api.document.repository.DocumentRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DebtInsightControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User userA;
    private User userB;
    private String tokenA;
    private String tokenB;

    @BeforeEach
    void setUp() {
        debtRepository.deleteAllInBatch();
        documentRepository.deleteAllInBatch();
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

        // Document for User A
        UUID docIdA = UUID.randomUUID();
        Document docA = Document.builder()
                .id(docIdA)
                .userId(userA.getId())
                .originalFilename("registratoA.pdf")
                .storedFilename("storedA.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .uploadDate(LocalDateTime.now())
                .status(DocumentStatus.PROCESSED)
                .build();
        documentRepository.saveAndFlush(docA);

        // Debt for User A
        Debt debtA = Debt.builder()
                .id(UUID.randomUUID())
                .documentId(docIdA)
                .institution("Banco A")
                .operationType("Empréstimo")
                .reportedValue(new BigDecimal("5000.00"))
                .createdAt(LocalDateTime.now())
                .build();
        debtRepository.saveAndFlush(debtA);

        // Document for User B
        UUID docIdB = UUID.randomUUID();
        Document docB = Document.builder()
                .id(docIdB)
                .userId(userB.getId())
                .originalFilename("registratoB.pdf")
                .storedFilename("storedB.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .uploadDate(LocalDateTime.now())
                .status(DocumentStatus.PROCESSED)
                .build();
        documentRepository.saveAndFlush(docB);

        // Debt for User B
        Debt debtB = Debt.builder()
                .id(UUID.randomUUID())
                .documentId(docIdB)
                .institution("Banco B")
                .operationType("Financiamento")
                .reportedValue(new BigDecimal("2000.00"))
                .createdAt(LocalDateTime.now())
                .build();
        debtRepository.saveAndFlush(debtB);
    }

    @AfterEach
    void tearDown() {
        debtRepository.deleteAllInBatch();
        documentRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    @Test
    void shouldReturnUnauthorizedWhenRequestingWithoutToken() throws Exception {
        mockMvc.perform(get("/debts/insights")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldEnforceMultiTenancyForUserA() throws Exception {
        mockMvc.perform(get("/debts/insights")
                        .header(HttpHeaders.AUTHORIZATION, tokenA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDebts", is(1)))
                .andExpect(jsonPath("$.totalAmount", is(5000.0)))
                .andExpect(jsonPath("$.institutionsCount", is(1)))
                .andExpect(jsonPath("$.largestInstitution", is("Banco A")))
                .andExpect(jsonPath("$.largestInstitutionAmount", is(5000.0)))
                .andExpect(jsonPath("$.institutions[0].institution", is("Banco A")))
                .andExpect(jsonPath("$.institutions[0].amount", is(5000.0)))
                .andExpect(jsonPath("$.institutions[0].operations", is(1)))
                .andExpect(jsonPath("$.recommendations", hasItem("Concentre seus esforços de negociação nesta instituição.")));
    }

    @Test
    void shouldEnforceMultiTenancyForUserB() throws Exception {
        mockMvc.perform(get("/debts/insights")
                        .header(HttpHeaders.AUTHORIZATION, tokenB)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDebts", is(1)))
                .andExpect(jsonPath("$.totalAmount", is(2000.0)))
                .andExpect(jsonPath("$.institutionsCount", is(1)))
                .andExpect(jsonPath("$.largestInstitution", is("Banco B")))
                .andExpect(jsonPath("$.largestInstitutionAmount", is(2000.0)))
                .andExpect(jsonPath("$.institutions[0].institution", is("Banco B")))
                .andExpect(jsonPath("$.institutions[0].amount", is(2000.0)))
                .andExpect(jsonPath("$.institutions[0].operations", is(1)))
                .andExpect(jsonPath("$.recommendations", hasItem("Concentre seus esforços de negociação nesta instituição.")));
    }
}
