package com.quita.api.complaint.service;

import com.quita.api.complaint.dto.ComplaintGenerationRequest;
import com.quita.api.complaint.dto.ComplaintResponse;
import com.quita.api.complaint.model.Complaint;
import com.quita.api.complaint.repository.ComplaintRepository;
import com.quita.api.debt.model.Debt;
import com.quita.api.debt.repository.DebtRepository;
import com.quita.api.llm.LLMClient;
import com.quita.api.llm.PromptBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintGenerationServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private DebtRepository debtRepository;

    @Mock
    private LLMClient llmClient;

    @Spy
    private PromptBuilder promptBuilder;

    @InjectMocks
    private ComplaintGenerationService service;

    private UUID userId;
    private String institution;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        institution = "Banco Inter";
        ReflectionTestUtils.setField(service, "llmProvider", "GEMINI");
    }

    @Test
    void shouldGenerateSuccessfullyWithoutCurrentDebtValue() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .currentDebtValue(null)
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        when(llmClient.generate(anyString())).thenReturn("Texto aprimorado da IA");

        ComplaintResponse response = service.generate(userId, request);

        assertNotNull(response);
        assertEquals(institution, response.getInstitution());
        assertEquals("Texto aprimorado da IA", response.getComplaint());
        assertTrue(response.isEditable());
        assertNotNull(response.getDisclaimer());
        assertFalse(response.getConsumerGovInstructions().isEmpty());
        assertNull(response.getMessage());

        ArgumentCaptor<Complaint> captor = ArgumentCaptor.forClass(Complaint.class);
        verify(complaintRepository).save(captor.capture());
        Complaint saved = captor.getValue();
        assertEquals(userId, saved.getUserId());
        assertEquals(institution, saved.getInstitution());
        assertEquals(1, saved.getVersion());
        assertEquals("Texto aprimorado da IA", saved.getComplaintText());
        assertNull(saved.getCurrentDebtValue());
        assertEquals("GEMINI", saved.getGeneratedBy());
    }

    @Test
    void shouldGenerateSuccessfullyWithCurrentDebtValue() {
        BigDecimal currentDebtValue = new BigDecimal("15000.00");
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .currentDebtValue(currentDebtValue)
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        when(llmClient.generate(anyString())).thenReturn("Texto aprimorado da IA");

        ComplaintResponse response = service.generate(userId, request);

        assertNotNull(response);
        assertEquals(institution, response.getInstitution());
        assertEquals("Texto aprimorado da IA", response.getComplaint());

        ArgumentCaptor<Complaint> captor = ArgumentCaptor.forClass(Complaint.class);
        verify(complaintRepository).save(captor.capture());
        Complaint saved = captor.getValue();
        assertEquals(currentDebtValue, saved.getCurrentDebtValue());
    }

    @Test
    void shouldRegenerateCreatingNewVersion() {
        UUID originalId = UUID.randomUUID();
        Complaint original = Complaint.builder()
                .id(originalId)
                .userId(userId)
                .institution(institution)
                .title("Solicitação de revisão contratual")
                .complaintText("Texto v1")
                .currentDebtValue(new BigDecimal("5000.00"))
                .generatedBy("GEMINI")
                .version(1)
                .build();

        when(complaintRepository.findByIdAndUserId(originalId, userId)).thenReturn(Optional.of(original));
        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(1);
        when(llmClient.generate(anyString())).thenReturn("Texto v2 aprimorado");

        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .currentDebtValue(new BigDecimal("6000.00"))
                .build();

        ComplaintResponse response = service.regenerate(userId, originalId, request);

        assertNotNull(response);
        assertEquals("Texto v2 aprimorado", response.getComplaint());

        ArgumentCaptor<Complaint> captor = ArgumentCaptor.forClass(Complaint.class);
        verify(complaintRepository).save(captor.capture());
        Complaint saved = captor.getValue();
        assertEquals(2, saved.getVersion());
        assertEquals(new BigDecimal("6000.00"), saved.getCurrentDebtValue());
        assertEquals("Texto v2 aprimorado", saved.getComplaintText());
    }

    @Test
    void shouldFallbackWhenLLMFails() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .currentDebtValue(null)
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        when(llmClient.generate(anyString())).thenThrow(new RuntimeException("LLM down"));

        ComplaintResponse response = service.generate(userId, request);

        assertNotNull(response);
        assertEquals(PromptBuilder.BASE_TEMPLATE, response.getComplaint());
        assertEquals("Não foi possível personalizar o texto neste momento. Uma versão padrão foi gerada com sucesso.", response.getMessage());

        ArgumentCaptor<Complaint> captor = ArgumentCaptor.forClass(Complaint.class);
        verify(complaintRepository).save(captor.capture());
        Complaint saved = captor.getValue();
        assertEquals("TEMPLATE_ONLY", saved.getGeneratedBy());
        assertEquals(PromptBuilder.BASE_TEMPLATE, saved.getComplaintText());
    }

    @Test
    void shouldValidateGuardrailsOfPromptBuilder() {
        String prompt = promptBuilder.buildPrompt(institution, Collections.emptyList(), new BigDecimal("5000.00"));

        assertTrue(prompt.contains("Houve evolução relevante do débito"), "Should recommend evolution of debt");
        assertTrue(prompt.contains("memória de cálculo detalhada"), "Should request calculation memory");

        assertFalse(prompt.contains("juros abusivos") || prompt.contains("abusividade") || prompt.contains("abusivos"), "Should NOT mention abusive fees");
        assertFalse(prompt.contains("ilegal") || prompt.contains("ilegalidade"), "Should NOT mention illegal fees");
    }
}
