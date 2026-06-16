package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ArtificialityValidatorTest {

    private final ArtificialityValidator validator = new ArtificialityValidator();

    @Test
    void shouldBeExcellentWhenFullyNatural() {
        String naturalText = "Durante a análise dos registros associados ao meu CPF junto à instituição, "
                + "identifiquei valores que parecem divergir do que foi originalmente acordado. "
                + "A ausência de um demonstrativo claro com a evolução do saldo devedor me impede de "
                + "entender as taxas de juros cobradas e dificulta meu planejamento econômico pessoal. "
                + "Por isso, peço esclarecimentos sobre a composição detalhada deste saldo para que possamos regularizar a situação.";
        
        ArtificialityValidator.ValidationResult result = validator.validate(naturalText);
        
        assertTrue(result.isAcceptable());
        assertEquals(100, result.score());
        assertEquals("Excelente", result.classification());
        assertTrue(result.reasons().isEmpty());
    }

    @Test
    void shouldPenalizeForbiddenPhrases() {
        String badText = "Venho por meio desta, na qualidade de consumidor, solicitar esclarecimentos adicionais.";
        
        ArtificialityValidator.ValidationResult result = validator.validate(badText);
        
        assertFalse(result.isAcceptable());
        // Starts at 100
        // "venho por meio desta" (-30)
        // "na qualidade de consumidor" (-30)
        // length < 150 (-30)
        // total score = 10
        assertEquals(10, result.score());
        assertTrue(result.reasons().contains("venho por meio desta"));
        assertTrue(result.reasons().contains("na qualidade de consumidor"));
    }

    @Test
    void shouldPenalizeListsAndExcessiveSolicito() {
        String listText = "Olá, identifiquei inconsistências e gostaria de fazer os seguintes questionamentos:\n"
                + "- Primeiro ponto: juros cobrados.\n"
                + "- Segundo ponto: evolução do saldo.\n"
                + "Por favor, solicito informações adicionais sobre isso. Eu também solicito que envie o contrato, e além do mais solicito a memória.";

        ArtificialityValidator.ValidationResult result = validator.validate(listText);
        
        assertFalse(result.isAcceptable());
        // Starts at 100
        // hasList (-30)
        // solicito > 2 times (-20)
        // score = 50
        assertEquals(50, result.score());
        assertTrue(result.reasons().contains("[Estrutura em lista/bullets]"));
        assertTrue(result.reasons().contains("[Excesso de solicitações (3)]"));
    }
}
