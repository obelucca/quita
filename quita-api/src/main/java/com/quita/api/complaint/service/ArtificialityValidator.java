package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;

@Component
public class ArtificialityValidator {

    public record ValidationResult(int score, String reasons) {
        public boolean isAcceptable() {
            return score >= 70;
        }
        
        public String classification() {
            if (score >= 100) return "Excelente";
            if (score >= 80) return "Natural";
            if (score >= 70) return "Aceitável";
            return "Regenerar";
        }
    }

    public ValidationResult validate(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ValidationResult(0, "Texto vazio.");
        }

        int score = 100;
        StringBuilder reasons = new StringBuilder();
        String lowerText = text.toLowerCase();

        // 1. Clichês / Expressões Proibidas (-30 cada)
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
                score -= 30;
                reasons.append("[").append(phrase).append("] ");
            }
        }

        // 2. Presença de Listas/Bullets/Checklists (-30)
        boolean hasList = false;
        for (String line : text.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.matches("^\\d+\\..*")) {
                hasList = true;
                break;
            }
        }
        if (hasList) {
            score -= 30;
            reasons.append("[Estrutura em lista/bullets] ");
        }

        // 3. Excesso de "solicito" / "solicitar" (-20)
        int countSolicito = 0;
        int idx = 0;
        while ((idx = lowerText.indexOf("solicito", idx)) != -1) {
            countSolicito++;
            idx += 8;
        }
        idx = 0;
        while ((idx = lowerText.indexOf("solicitar", idx)) != -1) {
            countSolicito++;
            idx += 9;
        }
        if (countSolicito > 2) {
            score -= 20;
            reasons.append("[Excesso de solicitações (" + countSolicito + ")] ");
        }

        // 4. Voz Passiva Excessiva (-20)
        int passiveCount = 0;
        String[] passiveTokens = {
            "foi verificado", "foi solicitado", "foi identificado", "foi realizado",
            "foi cobrado", "foi enviado", "foi constatado", "sendo cobrado", "sendo verificado"
        };
        for (String token : passiveTokens) {
            int pIdx = 0;
            while ((pIdx = lowerText.indexOf(token, pIdx)) != -1) {
                passiveCount++;
                pIdx += token.length();
            }
        }
        if (passiveCount > 3) {
            score -= 20;
            reasons.append("[Excesso de voz passiva (" + passiveCount + ")] ");
        }

        // 5. Assinaturas de IA (-40)
        String[] aiSignatures = {"inteligência artificial", "gemini", "gpt", "modelo de linguagem", "llm", "aprimorada por", "gerado por ia", "[ia]"};
        for (String sig : aiSignatures) {
            if (lowerText.contains(sig)) {
                score -= 40;
                reasons.append("[Assinatura de IA: " + sig + "] ");
                break;
            }
        }

        // 6. Texto muito curto (-30)
        if (text.length() < 150) {
            score -= 30;
            reasons.append("[Texto muito curto] ");
        }

        int finalScore = Math.max(0, Math.min(100, score));
        return new ValidationResult(finalScore, reasons.toString().trim());
    }
}
