package com.quita.api.llm;

import com.quita.api.complaint.service.RegulatoryCaseContext;
import com.quita.api.complaint.service.ComplaintPattern;
import com.quita.api.complaint.service.ComplaintQualityValidator;
import com.quita.api.complaint.service.ArtificialityValidator;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import static org.junit.jupiter.api.Assertions.*;

public class TechnicalManifestationFallbackTest {

    private final PromptBuilder promptBuilder = new PromptBuilder();
    private final ComplaintQualityValidator validator = new ComplaintQualityValidator(new ArtificialityValidator());

    @Test
    public void testFallbackStructureAndCustomization() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(2)
                .totalAmount(new BigDecimal("2774.19"))
                .hasCedida(true)
                .hasNoActiveOperation(true)
                .hasBalanceDivergence(true)
                .build();

        ComplaintPattern pattern = new ComplaintPattern(
                "TEST_PAT", "Title", "tone", Collections.singletonList("PROFILE_CLARIFICATION"),
                Arrays.asList("Opening"), "instructions", Arrays.asList("Closing")
        );

        String fallback = promptBuilder.buildFallbackText(
                "BANCO ORIGINAL S.A.", context, new BigDecimal("50.00"),
                pattern, "Abertura oficial", "Fechamento oficial"
        );

        assertNotNull(fallback);
        assertTrue(fallback.contains("BANCO ORIGINAL S.A."));
        assertTrue(fallback.contains("2.774,19"));
        assertTrue(fallback.contains("50,00"));
        assertTrue(fallback.contains("termo de cessão"));
        assertTrue(fallback.contains("vias assinadas dos contratos"));
        assertTrue(fallback.contains("Abertura oficial"));
        assertTrue(fallback.contains("Fechamento oficial"));
        
        // Assert no forbidden phrases
        String lower = fallback.toLowerCase();
        assertFalse(lower.contains("venho por meio desta"));
        assertFalse(lower.contains("na qualidade de consumidor"));
    }
}
