package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

public class ComplaintPatternSelectorTest {

    private final ComplaintPatternLibrary library = new ComplaintPatternLibrary();
    private final ComplaintPatternSelector selector = new ComplaintPatternSelector(library);

    @Test
    public void testSelectPatternForNoActiveOperation() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_NO_ACTIVE_OPERATION")
                .hasNoActiveOperation(true)
                .build();

        ComplaintPattern pattern = selector.selectPattern(UUID.randomUUID(), context);
        assertTrue(pattern.applicableProfiles().contains("PROFILE_NO_ACTIVE_OPERATION"));
    }

    @Test
    public void testSelectPatternForAssignedDebt() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_ASSIGNED_DEBT")
                .hasCedida(true)
                .build();

        ComplaintPattern pattern = selector.selectPattern(UUID.randomUUID(), context);
        assertTrue(pattern.applicableProfiles().contains("PROFILE_ASSIGNED_DEBT"));
    }
}
