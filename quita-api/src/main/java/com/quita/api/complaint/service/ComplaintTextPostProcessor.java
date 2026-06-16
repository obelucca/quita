package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class ComplaintTextPostProcessor {

    private static final Pattern IA_SIGNATURE_PATTERN = Pattern.compile(
            "(?i)\\[(?:versão\\s+aprimorada|gerado|produzido|inteligência|ia|gemini|openai|ollama).*?\\]"
    );

    public String postProcess(String text) {
        if (text == null) {
            return null;
        }

        // Remove IA signatures
        String processed = IA_SIGNATURE_PATTERN.matcher(text).replaceAll("");

        // Remove prohibited expressions case-insensitively
        processed = processed.replaceAll("(?i)\\bvenho\\s+por\\s+meio\\s+desta\\b", "");
        processed = processed.replaceAll("(?i)\\bna\\s+qualidade\\s+de\\s+consumidor\\b", "");

        // Replace formal expression with standard solicit
        processed = processed.replaceAll("\\bSolicito\\s+formalmente\\b", "Solicito");
        processed = processed.replaceAll("\\bsolicito\\s+formalmente\\b", "solicito");
        processed = processed.replaceAll("\\bSolicita\\s+formalmente\\b", "Solicita");
        processed = processed.replaceAll("\\bsolicita\\s+formalmente\\b", "solicita");

        // Clean up double punctuation resulting from removals (e.g. ", ,")
        processed = processed.replaceAll(",(\\s*,)+", ",");
        processed = processed.replaceAll(",\\s*\\.", ".");
        processed = processed.replaceAll("\\.\\s*,", ".");

        // Normalize spacing: replace multiple spaces with single space
        processed = processed.replaceAll(" +", " ");

        // Normalize newline endings to standard \n
        processed = processed.replace("\r\n", "\n");
        // Remove trailing/leading space on lines
        processed = processed.replaceAll(" *\n *", "\n");

        // Replace 3+ consecutive newlines with exactly 2 newlines (double newline for paragraph spacing)
        processed = processed.replaceAll("\n{3,}", "\n\n");

        return processed.trim();
    }
}
