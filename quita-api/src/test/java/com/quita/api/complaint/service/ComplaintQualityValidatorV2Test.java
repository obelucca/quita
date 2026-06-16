package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

public class ComplaintQualityValidatorV2Test {

    private final ComplaintQualityValidator validator = new ComplaintQualityValidator(new ArtificialityValidator());

    @Test
    public void testValidHighQualityText() {
        // Construct a realistic text with ~460 words (repeating some paragraphs to meet word count limit cleanly)
        StringBuilder sb = new StringBuilder();
        sb.append("Ao consultar o relatório Registrato emitido pelo Banco Central do Brasil, identifiquei registro associado à instituição BANCO ORIGINAL S.A., no qual consta saldo originalmente apontado de R$ 2.774,19. ")
          .append("Atualmente, fui informado de cobrança correspondente ao valor de R$ 50,00. Entretanto, não disponho dos elementos necessários para compreender quais eventos contratuais justificaram a trajetória financeira entre esses montantes. ")
          .append("Sem acesso à memória de cálculo integral da operação, torna-se inviável verificar a incidência de encargos, juros aplicados, amortizações eventualmente registradas e demais fatores que contribuíram para a composição do saldo apresentado. ")
          .append("Solicito o encaminhamento da memória de cálculo detalhada da evolução da dívida, contemplando o histórico cronológico do débito, a identificação dos contratos vinculados e o detalhamento de todos os encargos aplicados. ")
          .append("Esta manifestação possui caráter estritamente conciliatório e busca reunir os elementos necessários para avaliação adequada da obrigação registrada, favorecendo a construção de solução transparente e consensual. ")
          .append("Gostaria de obter esclarecimentos e transparência adicionais sobre a regularidade do saldo e o contrato correspondente. ");

        // Repeat paragraphs to increase word count to 450+ words without adding lists or forbidden phrases
        String paragraph = sb.toString();
        for (int i = 0; i < 2; i++) {
            sb.append(" ").append(paragraph);
        }

        String text = sb.toString();
        int words = text.split("\\s+").length;
        assertTrue(words >= 450 && words <= 700, "Word count is: " + words);

        ComplaintQualityValidator.ValidationResult result = validator.validate(
                text, "BANCO ORIGINAL S.A.", new BigDecimal("2774.19"), new BigDecimal("50.00"));

        assertTrue(result.isValid(), "Score: " + result.score() + ", Reason: " + result.reason());
        assertTrue(result.score() >= 85);
    }

    @Test
    public void testInvalidDueToLackingIndividualization() {
        String shortText = "Gostaria de entender a evolução do saldo devedor apontado no SCR. "
                + "A ausência de clareza documental impede o acompanhamento correto do saldo orçamentário. "
                + "Solicito que seja disponibilizada a memória de cálculo detalhada dos juros e encargos. "
                + "Permaneço à disposição para esclarecimentos adicionais e uma solução consensual por escrito.";

        // No institution name, no amounts. Total words ~40.
        ComplaintQualityValidator.ValidationResult result = validator.validate(
                shortText, "BANCO ORIGINAL S.A.", new BigDecimal("2774.19"), new BigDecimal("50.00"));

        assertFalse(result.isValid());
        assertTrue(result.score() < 85);
        assertTrue(result.reason().contains("Falta menção à instituição"));
    }

    @Test
    public void testInvalidDueToForbiddenPhrases() {
        String text = "Venho por meio desta, na qualidade de consumidor, solicitar formalmente esclarecimentos.";
        ComplaintQualityValidator.ValidationResult result = validator.validate(text);
        assertFalse(result.isValid());
        assertTrue(result.score() < 50);
    }
}
