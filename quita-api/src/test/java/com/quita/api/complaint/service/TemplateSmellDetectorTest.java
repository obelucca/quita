package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class TemplateSmellDetectorTest {

    private final TemplateSmellDetector detector = new TemplateSmellDetector();

    @Test
    public void testDetectSmellsInTypicalTemplate() {
        String text = "Identifiquei uma evolução acentuada nos registros. Solicito esclarecimentos adicionais de forma direta. "
                + "Espero que este e-mail traga esclarecimentos. Diante disso, aguardo retorno o mais breve possível.";
        
        TemplateSmellDetector.SmellResult result = detector.detectSmells(text);
        
        assertTrue(result.hasTemplateOpening());
        assertTrue(result.hasTemplateClosing());
        assertTrue(result.totalPenalty() >= 14); // 8 (opening) + 6 (closing)
        assertTrue(result.reasons().contains("Template Opening Smell"));
        assertTrue(result.reasons().contains("Template Closing Smell"));
    }

    @Test
    public void testDetectUnjustifiedRequests() {
        String text = "Solicito a cópia dos contratos assinados e a memória de cálculo.";
        
        TemplateSmellDetector.SmellResult result = detector.detectSmells(text);
        
        assertTrue(result.hasUnjustifiedRequest());
        assertTrue(result.totalPenalty() >= 10);
        assertTrue(result.reasons().contains("Pedido sem justificativa humanizada"));
    }

    @Test
    public void testNoSmellInHumanizedText() {
        String text = "Ao revisar os apontamentos constantes em meu relatório Registrato, chamou minha atenção a diferença significativa entre o saldo originalmente registrado e o valor atualmente informado pela instituição. "
                + "O acesso a essas informações é indispensável para compreender adequadamente a composição da obrigação registrada, avaliar sua evolução ao longo do tempo e adotar eventual medida de regularização de forma consciente e responsável. "
                + "Por isso, peço o detalhamento do saldo. "
                + "A disponibilização desses elementos permitirá uma análise responsável da situação apresentada e favorecerá a busca de solução consensual.";
        
        TemplateSmellDetector.SmellResult result = detector.detectSmells(text);
        
        assertFalse(result.hasTemplateOpening());
        assertFalse(result.hasTemplateClosing());
        assertFalse(result.hasExcessRepetition());
        assertFalse(result.hasUnjustifiedRequest());
        assertEquals(0, result.totalPenalty());
        assertEquals("", result.reasons());
    }

    @Test
    public void testExcessiveWordRepetition() {
        String text = "solicito isso, solicito aquilo, solicito também outra coisa, solicito mais uma vez e por fim solicito de novo.";
        
        TemplateSmellDetector.SmellResult result = detector.detectSmells(text);
        
        assertTrue(result.hasExcessRepetition());
        assertTrue(result.reasons().contains("Excesso da palavra 'solicito'"));
    }
}
