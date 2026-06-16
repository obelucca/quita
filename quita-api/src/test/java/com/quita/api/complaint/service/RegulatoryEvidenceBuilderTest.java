package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

public class RegulatoryEvidenceBuilderTest {

    private final RegulatoryEvidenceBuilder builder = new RegulatoryEvidenceBuilder();

    @Test
    public void testBuildEvidenceBasic() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_CLARIFICATION")
                .debtCount(2)
                .totalAmount(new BigDecimal("2774.19"))
                .hasCedida(false)
                .hasNoActiveOperation(false)
                .hasBalanceDivergence(false)
                .build();

        RegulatoryEvidenceBuilder.EvidenceResult result = builder.buildEvidence("BANCO ORIGINAL S.A.", context, new BigDecimal("50.00"));
        
        assertEquals("BANCO ORIGINAL S.A.", result.institution());
        assertEquals(new BigDecimal("2774.19"), result.originalAmount());
        assertEquals(new BigDecimal("50.00"), result.currentAmount());
        assertEquals(2, result.debtCount());
        assertTrue(result.hasEvolution());
        assertFalse(result.hasCedida());
        assertFalse(result.hasNoActiveOperation());
        
        // Assert concrete facts contain the required details
        assertTrue(result.concreteFacts().stream().anyMatch(f -> f.contains("BANCO ORIGINAL S.A.")));
        assertTrue(result.concreteFacts().stream().anyMatch(f -> f.contains("2.774,19")));
        assertTrue(result.concreteFacts().stream().anyMatch(f -> f.contains("50,00")));
    }

    @Test
    public void testBuildEvidenceCedidaAndNoActive() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_ASSIGNED_DEBT")
                .debtCount(1)
                .totalAmount(new BigDecimal("1000.00"))
                .hasCedida(true)
                .hasNoActiveOperation(true)
                .hasBalanceDivergence(true)
                .build();

        RegulatoryEvidenceBuilder.EvidenceResult result = builder.buildEvidence("BANCO INTER S.A.", context, null);

        assertEquals("BANCO INTER S.A.", result.institution());
        assertTrue(result.hasCedida());
        assertTrue(result.hasNoActiveOperation());
        
        assertTrue(result.concreteFacts().stream().anyMatch(f -> f.contains("cedida à instituição atual")));
        assertTrue(result.concreteFacts().stream().anyMatch(f -> f.contains("Ausência de vias de contratos ativos")));
    }
}
