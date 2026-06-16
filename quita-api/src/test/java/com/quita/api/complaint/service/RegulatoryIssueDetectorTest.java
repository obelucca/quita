package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class RegulatoryIssueDetectorTest {

    private final RegulatoryIssueDetector detector = new RegulatoryIssueDetector();

    @Test
    public void testDetectIssuesNoActiveOperation() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_NO_ACTIVE_OPERATION")
                .hasNoActiveOperation(true)
                .debtCount(0)
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<DetectedIssue> issues = detector.detectIssues(context);
        assertTrue(issues.stream().anyMatch(i -> i.issue() == RegulatoryIssue.ISSUE_UNRECOGNIZED_OPERATION));
        assertEquals(1, issues.size());
    }

    @Test
    public void testDetectIssuesAssignedDebtAndMultiple() {
        RegulatoryCaseContext context = RegulatoryCaseContext.builder()
                .profile("PROFILE_ASSIGNED_DEBT")
                .hasCedida(true)
                .hasMultipleCreditors(true)
                .debtCount(2)
                .totalAmount(new BigDecimal("1500.00"))
                .build();

        List<DetectedIssue> issues = detector.detectIssues(context);
        assertTrue(issues.stream().anyMatch(i -> i.issue() == RegulatoryIssue.ISSUE_ASSIGNMENT_CLARIFICATION));
        assertTrue(issues.stream().anyMatch(i -> i.issue() == RegulatoryIssue.ISSUE_MULTIPLE_CREDITORS));
        assertTrue(issues.stream().anyMatch(i -> i.issue() == RegulatoryIssue.ISSUE_BALANCE_EVOLUTION));
        assertEquals(3, issues.size());
    }
}
