package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class RegulatoryIssuePromptEnricher {

    public String enrichPrompt(List<DetectedIssue> issues) {
        if (issues == null || issues.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("\nPONTOS CRÍTICOS DETECTADOS E DIRETIVAS REGULATÓRIAS DE QUESTIONAMENTO:\n");
        for (DetectedIssue di : issues) {
            sb.append("- ").append(di.issue().getDescription()).append(" (Confiabilidade: ")
              .append(String.format("%.0f%%", di.confidenceScore() * 100)).append("): ")
              .append(di.issue().getPromptEnrichment()).append("\n");
        }
        sb.append("\nIncorpore estes questionamentos específicos na narrativa dos blocos correspondentes da manifestação.\n");
        return sb.toString();
    }
}
