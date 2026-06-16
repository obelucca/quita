package com.quita.api.complaint.service;

import com.quita.api.complaint.dto.ComplaintGenerationRequest;
import com.quita.api.complaint.dto.ComplaintResponse;
import com.quita.api.complaint.repository.ComplaintRepository;
import com.quita.api.debt.repository.DebtRepository;
import com.quita.api.llm.LLMClient;
import com.quita.api.llm.PromptBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChallengeStageTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private DebtRepository debtRepository;

    @Mock
    private LLMClient llmClient;

    @Spy
    private PromptBuilder promptBuilder = new PromptBuilder();

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
    private String validText;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        institution = "Banco Inter";
        ReflectionTestUtils.setField(service, "llmProvider", "GEMINI");

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
        validText = sb.toString();
    }

    @Test
    public void testChallengeStageExcellentDoesNotRegenerate() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .currentDebtValue(new BigDecimal("5200.00"))
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);
        
        // Mock generation returning valid text, and challenge returning EXCELENTE
        when(llmClient.generate(anyString()))
                .thenReturn(validText)  // First call (generate)
                .thenReturn("EXCELENTE"); // Second call (challenge)

        ComplaintResponse response = service.generate(userId, request);

        assertNotNull(response);
        assertEquals(validText, response.getComplaint());
        assertNull(response.getMessage());
        
        // LLM should be called exactly twice: once for generate, once for challenge critique
        verify(llmClient, times(2)).generate(anyString());
    }

    @Test
    public void testChallengeStageFailsThenRegeneratesSuccessfully() {
        ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                .institution(institution)
                .currentDebtValue(new BigDecimal("5200.00"))
                .build();

        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(complaintRepository.findMaxVersionByUserIdAndInstitution(userId, institution)).thenReturn(0);

        String regeneratedText = validText + " (Versao Corrigida)";

        when(llmClient.generate(anyString()))
                .thenReturn(validText)       // First call (generate)
                .thenReturn("O texto é um pouco impessoal.") // Second call (challenge critique)
                .thenReturn(regeneratedText); // Third call (regeneration)

        ComplaintResponse response = service.generate(userId, request);

        assertNotNull(response);
        assertEquals(regeneratedText, response.getComplaint());
        assertNull(response.getMessage());

        // LLM should be called exactly 3 times
        verify(llmClient, times(3)).generate(anyString());
    }
}
