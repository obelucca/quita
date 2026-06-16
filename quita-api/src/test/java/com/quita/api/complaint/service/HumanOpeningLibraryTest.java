package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class HumanOpeningLibraryTest {

    private final HumanOpeningLibrary library = new HumanOpeningLibrary();

    @Test
    public void testGetOpeningsForProfiles() {
        List<String> divergenceOpenings = library.getOpenings("PROFILE_BALANCE_DIVERGENCE");
        assertNotNull(divergenceOpenings);
        assertFalse(divergenceOpenings.isEmpty());
        assertTrue(divergenceOpenings.get(0).contains("Registrato") || divergenceOpenings.get(0).contains("evolução"));

        List<String> noActiveOpenings = library.getOpenings("PROFILE_NO_ACTIVE_OPERATION");
        assertNotNull(noActiveOpenings);
        assertFalse(noActiveOpenings.isEmpty());
        assertTrue(noActiveOpenings.get(0).contains("conhecimento de obrigação") || noActiveOpenings.get(0).contains("relatório oficial"));

        List<String> assignedOpenings = library.getOpenings("PROFILE_ASSIGNED_DEBT");
        assertNotNull(assignedOpenings);
        assertFalse(assignedOpenings.isEmpty());
        assertTrue(assignedOpenings.get(0).contains("transferência") || assignedOpenings.get(0).contains("cessão"));
    }

    @Test
    public void testDefaultOpenings() {
        List<String> defaultList = library.getOpenings("UNKNOWN_PROFILE");
        assertNotNull(defaultList);
        assertFalse(defaultList.isEmpty());
        assertTrue(defaultList.get(0).contains("oficial"));
    }

    @Test
    public void testSelectOpeningDeterministic() {
        String seed = "test-seed-123";
        String opening1 = library.selectOpening("PROFILE_BALANCE_DIVERGENCE", seed);
        String opening2 = library.selectOpening("PROFILE_BALANCE_DIVERGENCE", seed);
        assertEquals(opening1, opening2);

        String seed2 = "another-seed-456";
        String opening3 = library.selectOpening("PROFILE_BALANCE_DIVERGENCE", seed2);
        // It could occasionally match, but seed-based index selection works deterministically
        assertNotNull(opening3);
    }
}
