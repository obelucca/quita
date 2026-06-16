package com.quita.api.llm;

import com.quita.api.complaint.service.RegulatoryCaseContext;
import com.quita.api.complaint.service.ComplaintPattern;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import static org.junit.jupiter.api.Assertions.*;

public class PromptBuilderV2Test {

    private final PromptBuilder promptBuilder = new PromptBuilder();

    @Test
    public void testBuildPromptContainsTMEGuidelines() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(1)
                .totalAmount(new BigDecimal("2774.19"))
                .hasCedida(false)
                .hasNoActiveOperation(false)
                .hasBalanceDivergence(false)
                .build();

        ComplaintPattern pattern = new ComplaintPattern(
                "TEST_PAT", "Title", "tone", Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList("Opening"), "instructions", Arrays.asList("Closing")
        );

        String prompt = promptBuilder.buildPrompt(
                "BANCO ORIGINAL S.A.", context, new BigDecimal("50.00"),
                pattern, "Abertura oficial", "Fechamento oficial", "Enrichment"
        );

        assertNotNull(prompt);
        assertTrue(prompt.contains("Redija uma manifestação técnica individualizada baseada exclusivamente nas evidências fornecidas"));
        assertTrue(prompt.contains("RACIOCÍNIO DE PEDIDO (ENCADEAMENTO LÓGICO)"));
        assertTrue(prompt.contains("TESTE DA SUBSTITUIÇÃO"));
        assertTrue(prompt.contains("entre 450 e 700 palavras"));
        assertTrue(prompt.contains("BANCO ORIGINAL S.A."));
        assertTrue(prompt.contains("2.774,19"));
    }
}
