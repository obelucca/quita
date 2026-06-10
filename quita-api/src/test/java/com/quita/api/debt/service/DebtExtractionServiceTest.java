package com.quita.api.debt.service;

import com.quita.api.debt.model.Debt;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DebtExtractionServiceTest {

    @InjectMocks
    private DebtExtractionService debtExtractionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldParseStructuredTextWithMultipleDebts() {
        String testText = """
                Relatório SCR
                
                Instituição: BANCO DO BRASIL S.A.
                Modalidade: Empréstimo Consignado
                Valor: R$ 10.500,50
                Outro campo qualquer
                
                Instituição: ITAU UNIBANCO
                Modalidade: Cartão de Crédito
                Valor: 1.200,00
                """;

        UUID docId = UUID.randomUUID();
        List<Debt> debts = debtExtractionService.parseText(testText, docId);

        assertEquals(2, debts.size());

        // First Debt
        Debt bbDebt = debts.get(0);
        assertEquals(docId, bbDebt.getDocumentId());
        assertEquals("BANCO DO BRASIL S.A.", bbDebt.getInstitution());
        assertEquals("Empréstimo Consignado", bbDebt.getOperationType());
        assertEquals(new BigDecimal("10500.50"), bbDebt.getReportedValue());
        assertTrue(bbDebt.getExtractedText().contains("Instituição: BANCO DO BRASIL S.A."));

        // Second Debt
        Debt itauDebt = debts.get(1);
        assertEquals(docId, itauDebt.getDocumentId());
        assertEquals("ITAU UNIBANCO", itauDebt.getInstitution());
        assertEquals("Cartão de Crédito", itauDebt.getOperationType());
        assertEquals(new BigDecimal("1200.00"), itauDebt.getReportedValue());
        assertTrue(itauDebt.getExtractedText().contains("Instituição: ITAU UNIBANCO"));
    }

    @Test
    void shouldParseWithFallbackIfNoStructuredListFound() {
        String testText = """
                Extrato Consolidado
                Credor: CAIXA ECONOMICA FEDERAL
                Operação: Habitação
                Saldo Devedor: R$ 150.000,00
                """;

        UUID docId = UUID.randomUUID();
        List<Debt> debts = debtExtractionService.parseText(testText, docId);

        assertEquals(1, debts.size());
        Debt debt = debts.get(0);
        assertEquals("CAIXA ECONOMICA FEDERAL", debt.getInstitution());
        assertEquals("Habitação", debt.getOperationType());
        assertEquals(new BigDecimal("150000.00"), debt.getReportedValue());
    }

    @Test
    void shouldHandleEmptyAndNullInputsGracefully() {
        UUID docId = UUID.randomUUID();
        assertTrue(debtExtractionService.parseText("", docId).isEmpty());
        assertTrue(debtExtractionService.parseText(null, docId).isEmpty());
        assertTrue(debtExtractionService.parseText("Sem dados válidos aqui", docId).isEmpty());
    }

    @Test
    void shouldHandleNoValueGracefully() {
        String testText = """
                Instituição: Banco Pan
                Modalidade: Financiamento de Veículo
                """;
        UUID docId = UUID.randomUUID();
        List<Debt> debts = debtExtractionService.parseText(testText, docId);
        assertEquals(1, debts.size());
        assertEquals("Banco Pan", debts.get(0).getInstitution());
        assertEquals("Financiamento de Veículo", debts.get(0).getOperationType());
        assertNull(debts.get(0).getReportedValue());
    }
}
