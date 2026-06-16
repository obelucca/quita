package com.quita.api.llm;

import com.quita.api.complaint.service.RegulatoryCaseContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class PromptBuilderNarrativeTest {

    private PromptBuilder promptBuilder;
    private String institution;

    @BeforeEach
    void setUp() {
        promptBuilder = new PromptBuilder();
        institution = "Banco Inter";
    }

    @Test
    void shouldGenerateNarrativeStructureWithFiveBlocks() {
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
    void shouldInstructToAvoidNumberedListsAndProhibitedPhrases() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(1)
                .totalAmount(new BigDecimal("100"))
                .build();

        String prompt = promptBuilder.buildPrompt(institution, context, null);

        assertTrue(prompt.contains("NÃO utilize marcadores, bullets, numerações ou checklists"));
        assertTrue(prompt.contains("É EXPRESSAMENTE PROIBIDO utilizar as seguintes expressões genéricas/robóticas"));
    }
}
