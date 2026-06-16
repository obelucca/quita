package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;

@Component
public class TemplateSmellDetector {

    public record SmellResult(
            boolean hasTemplateOpening,
            boolean hasTemplateClosing,
            boolean hasExcessRepetition,
            boolean hasUnjustifiedRequest,
            int totalPenalty,
            String reasons
    ) {}

    public SmellResult detectSmells(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new SmellResult(false, false, false, false, 0, "Texto vazio.");
        }

        String lowerText = text.toLowerCase();
        boolean templateOpening = false;
        boolean templateClosing = false;
        boolean excessRepetition = false;
        boolean unjustifiedRequest = false;
        int penalty = 0;
        StringBuilder reasons = new StringBuilder();

        // 1. Template Opening (Penalidade: -8)
        String[] openingSmells = {
            "identifiquei uma evolução acentuada",
            "houve evolução relevante",
            "constato a existência de registros"
        };
        for (String smell : openingSmells) {
            if (lowerText.contains(smell)) {
                templateOpening = true;
                penalty += 8;
                reasons.append("[Template Opening Smell: ").append(smell).append("] ");
            }
        }

        // 2. Template Closing (Penalidade: -6)
        String[] closingSmells = {
            "aguardo retorno",
            "aguardo providências",
            "aguardo manifestação formal"
        };
        for (String smell : closingSmells) {
            if (lowerText.contains(smell)) {
                templateClosing = true;
                penalty += 6;
                reasons.append("[Template Closing Smell: ").append(smell).append("] ");
            }
        }

        // 3. Repetição excessiva (Penalidade: -5)
        String[] wordsToCount = {"solicito", "esclarecimentos", "relatório", "registrato"};
        for (String word : wordsToCount) {
            int count = 0;
            int idx = 0;
            while ((idx = lowerText.indexOf(word, idx)) != -1) {
                count++;
                idx += word.length();
            }
            if (count > 4) {
                excessRepetition = true;
                penalty += 5;
                reasons.append("[Excesso da palavra '").append(word).append("' (").append(count).append(")] ");
            }
        }

        // 4. Pedido sem justificativa (Penalidade: -10)
        boolean hasRequest = lowerText.contains("solicito") || lowerText.contains("requeiro") || lowerText.contains("solicitação");
        boolean hasJustification = lowerText.contains("indispensável para compreender") 
                || lowerText.contains("permitirá compreender") 
                || lowerText.contains("transparência e boa-fé")
                || lowerText.contains("permitirá a adequada compreensão")
                || lowerText.contains("permitirá uma análise responsável")
                || lowerText.contains("compreender adequadamente a composição");
        if (hasRequest && !hasJustification) {
            unjustifiedRequest = true;
            penalty += 10;
            reasons.append("[Pedido sem justificativa humanizada] ");
        }

        return new SmellResult(
                templateOpening,
                templateClosing,
                excessRepetition,
                unjustifiedRequest,
                penalty,
                reasons.toString().trim()
        );
    }
}
