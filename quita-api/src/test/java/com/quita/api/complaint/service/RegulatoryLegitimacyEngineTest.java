package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class RegulatoryLegitimacyEngineTest {

    private final RegulatoryLegitimacyEngine engine = new RegulatoryLegitimacyEngine();

    @Test
    public void testGetJustifications() {
        List<String> divergenceJustifications = engine.getJustifications("PROFILE_BALANCE_DIVERGENCE");
        assertNotNull(divergenceJustifications);
        assertFalse(divergenceJustifications.isEmpty());
        assertTrue(divergenceJustifications.get(0).contains("indispensável") || divergenceJustifications.get(0).contains("Sem tais elementos"));

        List<String> defaultJustifications = engine.getJustifications("UNKNOWN_PROFILE");
        assertNotNull(defaultJustifications);
        assertFalse(defaultJustifications.isEmpty());
        assertTrue(defaultJustifications.get(0).contains("necessários") || defaultJustifications.get(0).contains("detalhamento"));
    }

    @Test
    public void testSelectJustificationDeterministic() {
        String seed = "just-seed-789";
        String just1 = engine.selectJustification("PROFILE_BALANCE_DIVERGENCE", seed);
        String just2 = engine.selectJustification("PROFILE_BALANCE_DIVERGENCE", seed);
        assertEquals(just1, just2);
        assertNotNull(just1);
    }
}
