package com.quita.api.debt.service;

import com.quita.api.config.InsightsProperties;
import com.quita.api.debt.dto.DebtInsightResponse;
import com.quita.api.debt.dto.InstitutionInsightResponse;
import com.quita.api.debt.model.Debt;
import com.quita.api.debt.repository.DebtRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class DebtInsightServiceTest {

    @Mock
    private DebtRepository debtRepository;

    @Mock
    private InsightsProperties insightsProperties;

    @InjectMocks
    private DebtInsightService debtInsightService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userId = UUID.randomUUID();
        when(insightsProperties.getHighDebtThreshold()).thenReturn(new BigDecimal("10000.00"));
    }

    @Test
    void shouldReturnEmptyStateWhenUserHasNoDebts() {
        when(debtRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());

        DebtInsightResponse response = debtInsightService.getInsights(userId);

        assertEquals(0, response.getTotalDebts());
        assertEquals(BigDecimal.ZERO, response.getTotalAmount());
        assertEquals(0, response.getInstitutionsCount());
        assertNull(response.getLargestInstitution());
        assertEquals(BigDecimal.ZERO, response.getLargestInstitutionAmount());
        assertTrue(response.getInstitutions().isEmpty());
        assertTrue(response.getRecommendations().isEmpty());
    }

    @Test
    void shouldGenerateInsightsForSingleInstitution() {
        List<Debt> debts = List.of(
                Debt.builder().institution("Nubank").reportedValue(new BigDecimal("5000.00")).build()
        );
        when(debtRepository.findAllByUserId(userId)).thenReturn(debts);

        DebtInsightResponse response = debtInsightService.getInsights(userId);

        assertEquals(1, response.getTotalDebts());
        assertEquals(new BigDecimal("5000.00"), response.getTotalAmount());
        assertEquals(1, response.getInstitutionsCount());
        assertEquals("Nubank", response.getLargestInstitution());
        assertEquals(new BigDecimal("5000.00"), response.getLargestInstitutionAmount());

        assertEquals(1, response.getInstitutions().size());
        assertEquals("Nubank", response.getInstitutions().get(0).getInstitution());
        assertEquals(new BigDecimal("5000.00"), response.getInstitutions().get(0).getAmount());
        assertEquals(1, response.getInstitutions().get(0).getOperations());

        // Single institution recommendations
        assertTrue(response.getRecommendations().contains("Concentre seus esforços de negociação nesta instituição."));
        assertTrue(response.getRecommendations().contains("Mantenha registro das negociações realizadas."));
        assertFalse(response.getRecommendations().contains("Organize suas negociações por ordem de valor."));
    }

    @Test
    void shouldGenerateInsightsForMultipleInstitutionsSortedDescending() {
        List<Debt> debts = List.of(
                Debt.builder().institution("Nubank").reportedValue(new BigDecimal("3200.00")).build(),
                Debt.builder().institution("Banco Inter").reportedValue(new BigDecimal("4000.00")).build(),
                Debt.builder().institution("Banco Inter").reportedValue(new BigDecimal("4000.00")).build(),
                Debt.builder().institution("Itaú").reportedValue(new BigDecimal("1640.00")).build()
        );
        when(debtRepository.findAllByUserId(userId)).thenReturn(debts);

        DebtInsightResponse response = debtInsightService.getInsights(userId);

        assertEquals(4, response.getTotalDebts());
        assertEquals(new BigDecimal("12840.00"), response.getTotalAmount());
        assertEquals(3, response.getInstitutionsCount());
        assertEquals("Banco Inter", response.getLargestInstitution());
        assertEquals(new BigDecimal("8000.00"), response.getLargestInstitutionAmount());

        List<InstitutionInsightResponse> insts = response.getInstitutions();
        assertEquals(3, insts.size());
        // Sorted: Banco Inter (8000), Nubank (3200), Itaú (1640)
        assertEquals("Banco Inter", insts.get(0).getInstitution());
        assertEquals(new BigDecimal("8000.00"), insts.get(0).getAmount());
        assertEquals(2, insts.get(0).getOperations());

        assertEquals("Nubank", insts.get(1).getInstitution());
        assertEquals(new BigDecimal("3200.00"), insts.get(1).getAmount());
        assertEquals(1, insts.get(1).getOperations());

        assertEquals("Itaú", insts.get(2).getInstitution());
        assertEquals(new BigDecimal("1640.00"), insts.get(2).getAmount());
        assertEquals(1, insts.get(2).getOperations());

        // Recommendations check
        assertTrue(response.getRecommendations().contains("Priorize as operações com maior impacto financeiro."));
        assertTrue(response.getRecommendations().contains("Considere gerar reclamações individualmente para cada instituição."));
        assertTrue(response.getRecommendations().contains("Organize suas negociações por ordem de valor."));
        assertTrue(response.getRecommendations().contains("Mantenha registro das negociações realizadas."));
    }

    @Test
    void shouldFallbackToInstitutionNaoIdentificadaWhenMissingName() {
        List<Debt> debts = List.of(
                Debt.builder().institution(null).reportedValue(new BigDecimal("1000.00")).build(),
                Debt.builder().institution("   ").reportedValue(new BigDecimal("1500.00")).build()
        );
        when(debtRepository.findAllByUserId(userId)).thenReturn(debts);

        DebtInsightResponse response = debtInsightService.getInsights(userId);

        assertEquals(1, response.getInstitutionsCount());
        assertEquals("Instituição não identificada", response.getLargestInstitution());
        assertEquals(new BigDecimal("2500.00"), response.getLargestInstitutionAmount());
    }

    @Test
    void shouldNotTriggerThresholdRecommendationIfBelowLimit() {
        List<Debt> debts = List.of(
                Debt.builder().institution("Banco A").reportedValue(new BigDecimal("9999.00")).build()
        );
        when(debtRepository.findAllByUserId(userId)).thenReturn(debts);

        DebtInsightResponse response = debtInsightService.getInsights(userId);

        assertFalse(response.getRecommendations().contains("Organize suas negociações por ordem de valor."));
    }

    @Test
    void shouldTriggerThresholdRecommendationIfAboveLimit() {
        List<Debt> debts = List.of(
                Debt.builder().institution("Banco A").reportedValue(new BigDecimal("10000.01")).build()
        );
        when(debtRepository.findAllByUserId(userId)).thenReturn(debts);

        DebtInsightResponse response = debtInsightService.getInsights(userId);

        assertTrue(response.getRecommendations().contains("Organize suas negociações por ordem de valor."));
    }
}
