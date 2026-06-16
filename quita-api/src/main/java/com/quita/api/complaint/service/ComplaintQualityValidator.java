package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Component
public class ComplaintQualityValidator {

    private final ArtificialityValidator artificialityValidator;
    private final TemplateSmellDetector templateSmellDetector;

    public ComplaintQualityValidator(ArtificialityValidator artificialityValidator) {
        this.artificialityValidator = artificialityValidator;
        this.templateSmellDetector = new TemplateSmellDetector();
    }

    @org.springframework.beans.factory.annotation.Autowired
    public ComplaintQualityValidator(ArtificialityValidator artificialityValidator, TemplateSmellDetector templateSmellDetector) {
        this.artificialityValidator = artificialityValidator;
        this.templateSmellDetector = templateSmellDetector;
    }

    public record ValidationResult(boolean isValid, int score, String reason) {}

    public ValidationResult validate(String text) {
        return validate(text, "BANCO", null, null);
    }

    public ValidationResult validate(String text, String institution, BigDecimal originalAmount, BigDecimal currentAmount) {
        if (text == null || text.trim().isEmpty()) {
            return new ValidationResult(false, 0, "Texto vazio.");
        }

        int score = 0;
        StringBuilder reason = new StringBuilder();
        String lowerText = text.toLowerCase();

        // 1. Individualização (Até 30 pts)
        int individualizationScore = 0;
        if (institution != null && !institution.trim().isEmpty()) {
            if (lowerText.contains(institution.toLowerCase())) {
                individualizationScore += 15;
            } else {
                reason.append("[Falta menção à instituição: ").append(institution).append("] ");
            }
        }
        
        boolean hasAmountMention = false;
        if (originalAmount != null) {
            String origStr = formatCurrency(originalAmount);
            if (lowerText.contains(origStr) || lowerText.contains(originalAmount.toPlainString())) {
                hasAmountMention = true;
            }
        }
        if (currentAmount != null) {
            String currStr = formatCurrency(currentAmount);
            if (lowerText.contains(currStr) || lowerText.contains(currentAmount.toPlainString())) {
                hasAmountMention = true;
            }
        }
        // General check for currency structure in case exact matches fail due to formatting
        if (!hasAmountMention) {
            if (lowerText.contains("r$")) {
                hasAmountMention = true;
            }
        }
        
        if (hasAmountMention) {
            individualizationScore += 15;
        } else {
            reason.append("[Falta menção aos valores fáticos de débito] ");
        }
        score += individualizationScore;

        // 2. Encadeamento Lógico (Até 25 pts)
        int logicScore = 0;
        // Fato check
        boolean hasFact = lowerText.contains("registrado") || lowerText.contains("consta") 
                || lowerText.contains("identifiquei") || lowerText.contains("apontado") 
                || lowerText.contains("apontamento");
        if (hasFact) logicScore += 8;
        
        // Consequência check
        boolean hasConsequence = lowerText.contains("inviável") || lowerText.contains("dificulta") 
                || lowerText.contains("impede") || lowerText.contains("inviabiliza") 
                || lowerText.contains("impossibilita") || lowerText.contains("prejudica")
                || lowerText.contains("compromete");
        if (hasConsequence) logicScore += 8;
        
        // Pedido check
        boolean hasRequest = lowerText.contains("solicito") || lowerText.contains("gostaria de") 
                || lowerText.contains("requeiro") || lowerText.contains("peço") 
                || lowerText.contains("esclarecer") || lowerText.contains("esclarecimentos")
                || lowerText.contains("encaminhamento");
        if (hasRequest) logicScore += 9;

        if (logicScore < 25) {
            reason.append(String.format("[Falha no encadeamento lógico Fato->Consequência->Pedido (Score: %d/25)] ", logicScore));
        }
        score += logicScore;

        // 3. Robustez Técnica (Até 20 pts)
        int techScore = 0;
        if (lowerText.contains("memória de cálculo") || lowerText.contains("demonstrativo")) {
            techScore += 8;
        }
        if (lowerText.contains("contrato") || lowerText.contains("contratual")) {
            techScore += 6;
        }
        if (lowerText.contains("encargos") || lowerText.contains("juros") || lowerText.contains("amortiza")) {
            techScore += 6;
        }
        if (techScore < 20) {
            reason.append(String.format("[Robustez técnica insuficiente (Score: %d/20)] ", techScore));
        }
        score += techScore;

        // 4. Humanização (Até 15 pts)
        int humanizationScore = 15;
        // Check for cliches/forbidden phrases
        String[] forbiddenPhrases = {
            "venho por meio desta",
            "na qualidade de consumidor",
            "com base no relatório",
            "diante do exposto",
            "solicito formalmente",
            "solicitar formalmente",
            "aguardo providências",
            "gostaria de solicitar",
            "prezada ouvidoria",
            "conforme mencionado"
        };
        for (String phrase : forbiddenPhrases) {
            if (lowerText.contains(phrase)) {
                humanizationScore -= 5;
                reason.append("[Expressão proibida: ").append(phrase).append("] ");
            }
        }
        
        // Check lists
        boolean hasList = false;
        for (String line : text.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.matches("^\\d+\\..*")) {
                hasList = true;
                break;
            }
        }
        if (hasList) {
            humanizationScore -= 10;
            reason.append("[Estrutura em lista detectada] ");
        }

        // Check AI signature
        String[] aiSignatures = {"inteligência artificial", "gemini", "gpt", "modelo de linguagem", "llm", "aprimorada por", "gerado por ia", "[ia]"};
        for (String sig : aiSignatures) {
            if (lowerText.contains(sig)) {
                humanizationScore -= 15;
                reason.append("[Assinatura de IA detectada: ").append(sig).append("] ");
                break;
            }
        }
        
        humanizationScore = Math.max(0, humanizationScore);
        score += humanizationScore;

        // 5. Concisão (Até 10 pts)
        int concisenessScore = 0;
        int wordCount = text.split("\\s+").length;
        if (wordCount >= 450 && wordCount <= 700) {
            concisenessScore = 10;
        } else if (wordCount >= 300 && wordCount <= 800) {
            concisenessScore = 5;
            reason.append(String.format("[Tamanho do texto fora da faixa ideal de 450-700 palavras (Total: %d)] ", wordCount));
        } else {
            reason.append(String.format("[Texto muito curto ou excessivamente longo para manifestação técnica (Total: %d palavras)] ", wordCount));
        }
        score += concisenessScore;

        TemplateSmellDetector.SmellResult smells = templateSmellDetector.detectSmells(text);
        if (smells.hasTemplateOpening()) {
            score -= 8;
            reason.append("[Penalidade: Abertura de Template (-8)] ");
        }
        if (smells.hasTemplateClosing()) {
            score -= 6;
            reason.append("[Penalidade: Fechamento de Template (-6)] ");
        }
        if (smells.hasExcessRepetition()) {
            score -= 5;
            reason.append("[Penalidade: Repetição Excessiva (-5)] ");
        }
        if (smells.hasUnjustifiedRequest()) {
            score -= 10;
            reason.append("[Penalidade: Pedido Sem Justificativa (-10)] ");
        }

        score = Math.max(0, Math.min(100, score));

        boolean isValid = score >= 85;
        if (!isValid) {
            reason.append(String.format("[Pontuação final de qualidade de %d/100 é menor que o limite mínimo de 85]", score));
        }

        return new ValidationResult(isValid, score, reason.toString().trim());
    }

    private String formatCurrency(BigDecimal val) {
        if (val == null) return "";
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.getDefault());
        symbols.setDecimalSeparator(',');
        symbols.setGroupingSeparator('.');
        DecimalFormat formatter = new DecimalFormat("#,##0.00", symbols);
        return formatter.format(val);
    }
}
