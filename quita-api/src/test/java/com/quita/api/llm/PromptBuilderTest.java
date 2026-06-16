package com.quita.api.llm;

import com.quita.api.complaint.service.RegulatoryCaseContext;
import com.quita.api.complaint.service.ComplaintPattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class PromptBuilderTest {

    private PromptBuilder promptBuilder;
    private String institution;

    @BeforeEach
    void setUp() {
        promptBuilder = new PromptBuilder();
        institution = "Banco do Brasil";
    }

    @Test
    void shouldGenerateFiveStructuredBlocks() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(1)
                .totalAmount(new BigDecimal("100"))
                .build();

        String prompt = promptBuilder.buildPrompt(institution, context, null);

        assertTrue(prompt.contains("BLOCO 1"));
        assertTrue(prompt.contains("BLOCO 2"));
        assertTrue(prompt.contains("BLOCO 3"));
        assertTrue(prompt.contains("BLOCO 4"));
        assertTrue(prompt.contains("BLOCO 5"));
    }

    @Test
    void shouldGenerateObjectiveRequests() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(1)
                .totalAmount(new BigDecimal("100"))
                .build();

        String prompt = promptBuilder.buildPrompt(institution, context, null);

        assertTrue(prompt.contains("SUBSTITUA PEDIDOS POR QUESTÕES ESPONTÂNEAS"));
    }

    @Test
    void shouldAvoidConversationalLanguage() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(1)
                .totalAmount(new BigDecimal("100"))
                .build();

        String prompt = promptBuilder.buildPrompt(institution, context, null);

        assertTrue(prompt.contains("É EXPRESSAMENTE PROIBIDO utilizar as seguintes expressões genéricas/robóticas"));
        assertTrue(prompt.contains("Espero que este e-mail"));
        assertTrue(prompt.contains("Gostaria de solicitar"));
    }

    @Test
    void shouldRespectRegulatoryGuardrails() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(1)
                .totalAmount(new BigDecimal("100"))
                .build();

        String prompt = promptBuilder.buildPrompt(institution, context, null);

        assertTrue(prompt.contains("NUNCA classifique os valores cobrados como excessivos ou desconformes com a lei"));
        assertTrue(prompt.contains("a-b-u-s-i-v-o"));
    }

    @Test
    void shouldBuildPromptWithFullSignature() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(1)
                .totalAmount(new BigDecimal("100"))
                .build();

        ComplaintPattern pattern = new ComplaintPattern(
                "TEST_PAT", "Test Title", "neutral",
                Collections.singletonList("PROFILE_CLARIFICATION"),
                Collections.singletonList("Abertura teste"),
                "Instrucao teste",
                Collections.singletonList("Fechamento teste")
        );

        String prompt = promptBuilder.buildPrompt(
                institution, context, null, pattern, "Abertura teste", "Fechamento teste", "Diretiva adicional");

        assertTrue(prompt.contains("ESTILO NARRATIVO SELECIONADO: Test Title"));
        assertTrue(prompt.contains("Abertura teste"));
        assertTrue(prompt.contains("Fechamento teste"));
        assertTrue(prompt.contains("Diretiva adicional"));
    }

    @Test
    void shouldContainRequiredDataAttestation() {
        BigDecimal initialValue = new BigDecimal("4500.00");
        BigDecimal currentValue = new BigDecimal("5200.00");

        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(1)
                .totalAmount(initialValue)
                .build();

        String prompt = promptBuilder.buildPrompt(institution, context, currentValue);

        assertTrue(prompt.contains("R$ 4.500,00"));
        assertTrue(prompt.contains("R$ 5.200,00"));
        assertTrue(prompt.contains("É OBRIGATÓRIO constar no texto final a identificação clara da instituição financeira"));

        // Fallback test
        String fallback = promptBuilder.buildFallbackText(institution, context, currentValue, null, "Abertura", "Fechamento");
        assertTrue(fallback.contains(institution));
        assertTrue(fallback.contains("4.500,00"));
        assertTrue(fallback.contains("5.200,00"));
    }
}
