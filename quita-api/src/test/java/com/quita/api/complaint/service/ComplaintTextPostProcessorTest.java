package com.quita.api.complaint.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ComplaintTextPostProcessorTest {

    private ComplaintTextPostProcessor postProcessor;

    @BeforeEach
    void setUp() {
        postProcessor = new ComplaintTextPostProcessor();
    }

    @Test
    void shouldRemoveIaSignatures() {
        String input = "Texto da reclamação.\n[Versão aprimorada por Inteligência Artificial (GEMINI)]\n[Gerado pelo Gemini]\n[Produzido automaticamente]";
        String output = postProcessor.postProcess(input);

        assertEquals("Texto da reclamação.", output);
        assertFalse(output.contains("Inteligência Artificial"));
        assertFalse(output.contains("Gemini"));
        assertFalse(output.contains("Produzido"));
    }

    @Test
    void shouldRemoveProhibitedPhrases() {
        String input = "Eu, venho por meio desta, na qualidade de consumidor, solicitar esclarecimentos.";
        String output = postProcessor.postProcess(input);

        // Venho por meio desta -> empty, na qualidade de consumidor -> empty
        // Result should be: "Eu,, solicitar esclarecimentos." but we clean up double commas ",," to ","
        // And then trim/replace spaces.
        // Let's verify what the final string looks like:
        assertEquals("Eu, solicitar esclarecimentos.", output);
    }

    @Test
    void shouldReplaceSolicitoFormalmente() {
        String input = "Solicito formalmente que enviem os dados. Eu solicito formalmente os arquivos. Ele solicita formalmente a resposta.";
        String output = postProcessor.postProcess(input);

        assertEquals("Solicito que enviem os dados. Eu solicito os arquivos. Ele solicita a resposta.", output);
    }

    @Test
    void shouldNormalizeExcessiveSpacesAndNewlines() {
        String input = "Linha 1.   \n\n\n\n   Linha 2.    Com  muitos   espaços.";
        String output = postProcessor.postProcess(input);

        assertEquals("Linha 1.\n\nLinha 2. Com muitos espaços.", output);
    }

    @Test
    void shouldHandleNullInputs() {
        assertNull(postProcessor.postProcess(null));
    }
}
