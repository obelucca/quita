package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

public class ComplaintQualityValidatorTest {

    private final ComplaintQualityValidator validator = new ComplaintQualityValidator(new ArtificialityValidator());

    @Test
    public void testValidateValidText() {
        StringBuilder sb = new StringBuilder();
        String block = "Ao consultar o relatório Registrato emitido pelo Banco Central do Brasil, identifiquei registro associado à instituição Banco do Brasil, no qual consta saldo originalmente apontado de R$ 4.500,00. "
                + "Atualmente, fui informado de cobrança correspondente ao valor de R$ 5.200,00. Entretanto, não disponho dos elementos necessários para compreender quais eventos contratuais justificaram a trajetória financeira entre esses montantes. "
                + "Sem acesso à memória de cálculo integral da operação, torna-se inviável verificar a incidência de encargos, juros aplicados, amortizações eventualmente registradas e demais fatores que contribuíram para a composição do saldo apresentado. "
                + "Solicito o encaminhamento da memória de cálculo detalhada da evolução da dívida, contemplando o histórico cronológico do débito, a identificação dos contratos vinculados e o detalhamento de todos os encargos aplicados. "
                + "Esta manifestação possui caráter estritamente conciliatório e busca reunir os elementos necessários para avaliação adequada da obrigação registrada, favorecendo a construção de solução transparente e consensual. "
                + "Gostaria de obter esclarecimentos e transparência adicionais sobre a regularidade do saldo e o contrato correspondente. ";
        for (int i = 0; i < 2; i++) {
            sb.append(block);
        }
        String text = sb.toString();

        ComplaintQualityValidator.ValidationResult result = validator.validate(
                text, "Banco do Brasil", new BigDecimal("4500.00"), new BigDecimal("5200.00"));
        
        assertTrue(result.isValid(), "Validation details: score=" + result.score() + ", reason=" + result.reason());
        assertTrue(result.score() >= 85);
    }

    @Test
    public void testValidateTextWithRedFlags() {
        String text = "Venho por meio desta, na qualidade de consumidor, solicitar formalmente esclarecimentos.";
        ComplaintQualityValidator.ValidationResult result = validator.validate(text);
        assertFalse(result.isValid());
    }

    @Test
    public void testValidateTextWithAISignature() {
        StringBuilder sb = new StringBuilder();
        String block = "Ao consultar o relatório Registrato emitido pelo Banco Central do Brasil, identifiquei registro associado à instituição Banco do Brasil, no qual consta saldo originalmente apontado de R$ 4.500,00. [Versão aprimorada por IA] "
                + "Atualmente, fui informado de cobrança correspondente ao valor de R$ 5.200,00. Entretanto, não disponho dos elementos necessários para compreender quais eventos contratuais justificaram a trajetória financeira entre esses montantes. "
                + "Sem acesso à memória de cálculo integral da operação, torna-se inviável verificar a incidência de encargos, juros aplicados, amortizações eventualmente registradas e demais fatores que contribuíram para a composição do saldo apresentado. "
                + "Solicito o encaminhamento da memória de cálculo detalhada da evolução da dívida, contemplando o histórico cronológico do débito, a identificação dos contratos vinculados e o detalhamento de todos os encargos aplicados. "
                + "Esta manifestação possui caráter estritamente conciliatório e busca reunir os elementos necessários para avaliação adequada da obrigação registrada, favorecendo a construção de solução transparente e consensual. "
                + "Gostaria de obter esclarecimentos e transparência adicionais sobre a regularidade do saldo e o contrato correspondente. ";
        for (int i = 0; i < 2; i++) {
            sb.append(block);
        }
        String text = sb.toString();

        ComplaintQualityValidator.ValidationResult result = validator.validate(
                text, "Banco do Brasil", new BigDecimal("4500.00"), new BigDecimal("5200.00"));
        assertFalse(result.isValid());
    }
}
