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
import com.quita.api.user.service.CreditService;
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

    @Mock
    private CreditService creditService;

    @Spy
    private PromptBuilder promptBuilder;

    @Spy
    private RegulatoryCaseClassifier regulatoryCaseClassifier = new RegulatoryCaseClassifier();

    @Spy
    private ComplaintTextPostProcessor complaintTextPostProcessor = new ComplaintTextPostProcessor();

    @Spy
    private ComplaintPatternLibrary complaintPatternLibrary = new ComplaintPatternLibrary();

    @Spy
    private ComplaintPatternSelector complaintPatternSelector = new ComplaintPatternSelector(complaintPatternLibrary);

    @Spy
    private NarrativeVariationEngine narrativeVariationEngine = new NarrativeVariationEngine();

    @Spy
    private ArtificialityValidator artificialityValidator = new ArtificialityValidator();

    @Spy
    private ComplaintQualityValidator complaintQualityValidator = new ComplaintQualityValidator(artificialityValidator);

    @Spy
    private RegulatoryIssueDetector regulatoryIssueDetector = new RegulatoryIssueDetector();

    @Spy
    private RegulatoryIssuePromptEnricher regulatoryIssuePromptEnricher = new RegulatoryIssuePromptEnricher();

    @Spy
    private RegulatoryReasoningBuilder regulatoryReasoningBuilder = new RegulatoryReasoningBuilder();

    @Spy
    private HumanComplaintBlueprint humanComplaintBlueprint = new HumanComplaintBlueprint();

    @InjectMocks
    private ComplaintGenerationService service;

    private UUID userId;
    private String institution;

    private static final String HIGH_QUALITY_TEXT;

    static {
        StringBuilder sb = new StringBuilder();
        String block = "Ao consultar o relatório Registrato emitido pelo Banco Central do Brasil, identifiquei registro associado à instituição Banco Inter, no qual consta saldo originalmente apontado de R$ 4.500,00. "
                + "Atualmente, fui informado de cobrança correspondente ao valor de R$ 5.200,00. Entretanto, não disponho dos elementos necessários para compreender quais eventos contratuais justificaram a trajetória financeira entre esses montantes. "
                + "Sem acesso à memória de cálculo integral da operação, torna-se inviável verificar a incidência de encargos, juros aplicados, amortizações eventualmente registradas e demais fatores que contribuíram para a composição do saldo apresentado. "
                + "Solicito o encaminhamento da memória de cálculo detalhada da evolução da dívida, contemplando o histórico cronológico do débito, a identificação dos contratos vinculados e o detalhamento de todos os encargos aplicados. "
                + "Esta manifestação possui caráter estritamente conciliatório e busca reunir os elementos necessários para avaliação adequada da obrigação registrada, favorecendo a construção de solução transparente e consensual. "
                + "Gostaria de obter esclarecimentos e transparência adicionais sobre a regularidade do saldo e o contrato correspondente. ";
        for (int i = 0; i < 2; i++) {
            sb.append(block);
        }
        HIGH_QUALITY_TEXT = sb.toString();
    }

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        institution = "Banco Inter";
        ReflectionTestUtils.setField(service, "llmProvider", "GEMINI");
    }

    private void setupMockLlmWithSuccess() {
        when(llmClient.generate(anyString())).thenAnswer(invocation -> {
            String prompt = invocation.getArgument(0);
            if (prompt.contains("Analise criticamente")) {
                return "EXCELENTE";
            }
            return HIGH_QUALITY_TEXT;
        });
    }

    @Test
    void shouldGenerateSuccessfullyWithoutCurrentDebtValue() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .currentDebtValue(null)
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        setupMockLlmWithSuccess();

        ComplaintResponse response = service.generate(userId, request);

        assertNotNull(response);
        assertEquals(institution, response.getInstitution());
        assertEquals(HIGH_QUALITY_TEXT, response.getComplaint());
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
        assertEquals(HIGH_QUALITY_TEXT, saved.getComplaintText());
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
        setupMockLlmWithSuccess();

        ComplaintResponse response = service.generate(userId, request);

        assertNotNull(response);
        assertEquals(institution, response.getInstitution());
        assertEquals(HIGH_QUALITY_TEXT, response.getComplaint());

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
        setupMockLlmWithSuccess();

        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .currentDebtValue(new BigDecimal("6000.00"))
                .build();

        ComplaintResponse response = service.regenerate(userId, originalId, request);

        assertNotNull(response);
        assertEquals(HIGH_QUALITY_TEXT, response.getComplaint());

        ArgumentCaptor<Complaint> captor = ArgumentCaptor.forClass(Complaint.class);
        verify(complaintRepository).save(captor.capture());
        Complaint saved = captor.getValue();
        assertEquals(2, saved.getVersion());
        assertEquals(new BigDecimal("6000.00"), saved.getCurrentDebtValue());
        assertEquals(HIGH_QUALITY_TEXT, saved.getComplaintText());
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
        assertTrue(response.getComplaint().contains(institution));
        assertEquals("Não foi possível personalizar o texto neste momento. Uma versão padrão foi gerada com sucesso.", response.getMessage());

        ArgumentCaptor<Complaint> captor = ArgumentCaptor.forClass(Complaint.class);
        verify(complaintRepository).save(captor.capture());
        Complaint saved = captor.getValue();
        assertEquals("TEMPLATE_ONLY", saved.getGeneratedBy());
        assertTrue(saved.getComplaintText().contains(institution));
    }

    @Test
    void shouldIncludeDebtContextWhenAvailable() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .build();

        Debt normalDebt = Debt.builder()
                .institution(institution)
                .operationType("Crédito Pessoal")
                .reportedValue(new BigDecimal("5000.00"))
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.singletonList(normalDebt));
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        setupMockLlmWithSuccess();

        service.generate(userId, request);

        verify(promptBuilder).buildPrompt(eq(institution), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void shouldGenerateWithProfileAssignedDebt() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .build();

        Debt assignedDebt = Debt.builder()
                .institution(institution)
                .operationType("Cessão de Crédito Cedida")
                .reportedValue(new BigDecimal("5000.00"))
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.singletonList(assignedDebt));
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        setupMockLlmWithSuccess();

        service.generate(userId, request);

        verify(promptBuilder).buildPrompt(
                eq(institution),
                argThat(context -> "PROFILE_ASSIGNED_DEBT".equals(context.getProfile())),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void shouldGenerateWithProfileNoActiveOperation() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        setupMockLlmWithSuccess();

        service.generate(userId, request);

        verify(promptBuilder).buildPrompt(
                eq(institution),
                argThat(context -> "PROFILE_NO_ACTIVE_OPERATION".equals(context.getProfile())),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void shouldApplyPostProcessorToGeneratedTextWhenInitiallyInvalid() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .build();

        // Construct rawText that is invalid because of forbidden phrases, but has enough length and details
        StringBuilder sb = new StringBuilder();
        sb.append("Ao consultar o relatório Registrato emitido pelo Banco Central do Brasil, identifiquei registro associado à instituição Banco Inter, no qual consta saldo originalmente apontado. ")
          .append("Eu, venho por meio desta, na qualidade de consumidor, solicitar formalmente esclarecimentos adicionais a respeito dos contratos de empréstimos ativos. ")
          .append("A ausência de clareza documental impede o acompanhamento correto do saldo orçamentário e do planejamento financeiro pessoal de forma sóbria. ")
          .append("Solicito que seja disponibilizada a memória de cálculo detalhada dos juros e encargos aplicados sobre o saldo. ")
          .append("Permaneço à disposição para esclarecimentos adicionais. [Versão aprimorada por Inteligência Artificial (GEMINI)] ");
        
        String block = sb.toString();
        for (int i = 0; i < 2; i++) {
            sb.append(" ").append(block);
        }

        String rawText = sb.toString();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        
        when(llmClient.generate(anyString())).thenAnswer(invocation -> {
            String prompt = invocation.getArgument(0);
            if (prompt.contains("Analise criticamente")) {
                return "EXCELENTE";
            }
            return rawText;
        });

        ComplaintResponse response = service.generate(userId, request);

        assertNotNull(response);
        assertFalse(response.getComplaint().contains("venho por meio desta"));
        assertFalse(response.getComplaint().contains("na qualidade de consumidor"));
        assertFalse(response.getComplaint().contains("[Versão aprimorada"));
    }

    @Test
    void shouldRotatePatternAndVariationUponRegeneration() {
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
        setupMockLlmWithSuccess();

        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .currentDebtValue(new BigDecimal("6000.00"))
                .build();

        service.regenerate(userId, originalId, request);

        verify(complaintPatternSelector).selectPattern(eq(userId), any(), eq(2));
        verify(narrativeVariationEngine).selectOpening(eq(userId), eq(institution), any(), eq(2));
        verify(narrativeVariationEngine).selectClosing(eq(userId), eq(institution), any(), eq(2));
    }
}
