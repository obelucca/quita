package com.quita.api.complaint.service;

import com.quita.api.debt.model.Debt;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RegulatoryCaseClassifierTest {

    private RegulatoryCaseClassifier classifier;
    private String targetInstitution;

    @BeforeEach
    void setUp() {
        classifier = new RegulatoryCaseClassifier();
        targetInstitution = "Banco do Brasil";
    }

    @Test
    void shouldClassifyNoActiveOperation() {
        RegulatoryCaseContext context = classifier.classify(targetInstitution, Collections.emptyList(), null, Collections.emptyList());

        assertEquals("PROFILE_NO_ACTIVE_OPERATION", context.getProfile());
        assertTrue(context.isHasNoActiveOperation());
        assertFalse(context.isHasCedida());
        assertFalse(context.isHasBalanceDivergence());
        assertEquals(0, context.getDebtCount());
        assertEquals(BigDecimal.ZERO, context.getTotalAmount());
    }

    @Test
    void shouldClassifyAssignedDebt() {
        Debt normalDebt = Debt.builder()
                .institution(targetInstitution)
                .operationType("Empréstimo")
                .reportedValue(new BigDecimal("1000"))
                .build();
        
        Debt assignedDebt = Debt.builder()
                .institution(targetInstitution)
                .operationType("cessão de crédito")
                .reportedValue(new BigDecimal("2000"))
                .build();

        List<Debt> instDebts = Arrays.asList(normalDebt, assignedDebt);
        RegulatoryCaseContext context = classifier.classify(targetInstitution, instDebts, null, instDebts);

        assertEquals("PROFILE_ASSIGNED_DEBT", context.getProfile());
        assertTrue(context.isHasCedida());
        assertFalse(context.isHasNoActiveOperation());
        assertEquals(2, context.getDebtCount());
        assertEquals(new BigDecimal("3000"), context.getTotalAmount());
    }

    @Test
    void shouldClassifyBalanceDivergence() {
        Debt normalDebt = Debt.builder()
                .institution(targetInstitution)
                .operationType("Empréstimo")
                .reportedValue(new BigDecimal("1000"))
                .build();

        List<Debt> instDebts = Collections.singletonList(normalDebt);
        // Current value is 1500, which is different from 1000
        RegulatoryCaseContext context = classifier.classify(targetInstitution, instDebts, new BigDecimal("1500"), instDebts);

        assertEquals("PROFILE_BALANCE_DIVERGENCE", context.getProfile());
        assertTrue(context.isHasBalanceDivergence());
        assertFalse(context.isHasCedida());
        assertFalse(context.isHasNoActiveOperation());
    }

    @Test
    void shouldClassifyMultipleCreditors() {
        Debt debt1 = Debt.builder()
                .institution(targetInstitution)
                .operationType("Empréstimo")
                .reportedValue(new BigDecimal("1000"))
                .build();

        Debt debt2 = Debt.builder()
                .institution("Outro Banco")
                .operationType("Crédito")
                .reportedValue(new BigDecimal("2000"))
                .build();

        List<Debt> instDebts = Collections.singletonList(debt1);
        List<Debt> allUserDebts = Arrays.asList(debt1, debt2);

        // No divergence, no assignment
        RegulatoryCaseContext context = classifier.classify(targetInstitution, instDebts, new BigDecimal("1000"), allUserDebts);

        assertEquals("PROFILE_MULTIPLE_CREDITORS", context.getProfile());
        assertTrue(context.isHasMultipleCreditors());
        assertFalse(context.isHasBalanceDivergence());
        assertFalse(context.isHasCedida());
    }

    @Test
    void shouldClassifyClarificationAsFallback() {
        Debt debt = Debt.builder()
                .institution(targetInstitution)
                .operationType("Empréstimo")
                .reportedValue(new BigDecimal("1000"))
                .build();

        List<Debt> instDebts = Collections.singletonList(debt);

        RegulatoryCaseContext context = classifier.classify(targetInstitution, instDebts, new BigDecimal("1000"), instDebts);

        assertEquals("PROFILE_CLARIFICATION", context.getProfile());
        assertFalse(context.isHasMultipleCreditors());
        assertFalse(context.isHasBalanceDivergence());
        assertFalse(context.isHasCedida());
    }
}
