package com.quita.api.debt.service;

import com.quita.api.config.StorageProperties;
import com.quita.api.debt.model.Debt;
import com.quita.api.debt.repository.DebtRepository;
import com.quita.api.document.model.Document;
import com.quita.api.document.parser.RegistratoPdfParser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class DebtExtractionService {

    private final DebtRepository debtRepository;
    private final RegistratoPdfParser registratoPdfParser;
    private final StorageProperties storageProperties;

    // Pattern matching keys case-insensitively
    private static final Pattern INSTITUTION_PATTERN = Pattern.compile("(?i)(?:institui[çc][ãa]o|banco|credor)\\s*:\\s*(.+)");
    private static final Pattern OPERATION_PATTERN = Pattern.compile("(?i)(?:modalidade|tipo\\s+de\\s+opera[çc][ãa]o|tipo\\s+da\\s+opera[çc][ãa]o|opera[çc][ãa]o)\\s*:\\s*(.+)");
    private static final Pattern VALUE_PATTERN = Pattern.compile("(?i)(?:valor|valor\\s+informado|saldo\\s+devedor|total)\\s*:\\s*(?:R\\$\\s*)?([\\d.,]+)");

    @Transactional
    public List<Debt> extractAndSaveDebts(Document document) throws IOException {
        Path uploadPath = Paths.get(storageProperties.getUploadDir()).toAbsolutePath().normalize();
        File pdfFile = uploadPath.resolve(document.getStoredFilename()).toFile();

        if (!pdfFile.exists()) {
            throw new IOException("File not found: " + pdfFile.getAbsolutePath());
        }

        try {
            // Parse PDF to get full text
            String fullText = registratoPdfParser.parse(pdfFile);

            // Extract debts from text
            List<Debt> extractedDebts = parseText(fullText, document.getId());

            // Save debts to repository
            return debtRepository.saveAll(extractedDebts);
        } finally {
            try {
                if (pdfFile.exists()) {
                    java.nio.file.Files.deleteIfExists(pdfFile.toPath());
                }
            } catch (Exception e) {
                System.err.println("Failed to delete temporary PDF file: " + pdfFile.getAbsolutePath() + ". Error: " + e.getMessage());
            }
        }
    }

    public List<Debt> parseText(String text, UUID documentId) {
        List<Debt> debts = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return debts;
        }

        String[] lines = text.split("\\r?\\n");
        
        String currentInstitution = null;
        String currentOperation = null;
        BigDecimal currentValue = null;
        StringBuilder currentTextAccumulator = new StringBuilder();

        for (String line : lines) {
            String trimmedLine = line.trim();
            if (trimmedLine.isEmpty()) {
                continue;
            }

            Matcher instMatcher = INSTITUTION_PATTERN.matcher(trimmedLine);
            Matcher opMatcher = OPERATION_PATTERN.matcher(trimmedLine);
            Matcher valMatcher = VALUE_PATTERN.matcher(trimmedLine);

            if (instMatcher.find()) {
                // If we already have some data accumulated, save it before starting a new one
                if (currentInstitution != null || currentOperation != null || currentValue != null) {
                    debts.add(buildDebt(documentId, currentInstitution, currentOperation, currentValue, currentTextAccumulator.toString()));
                }
                // Reset for new debt
                currentInstitution = instMatcher.group(1).trim();
                currentOperation = null;
                currentValue = null;
                currentTextAccumulator = new StringBuilder();
                currentTextAccumulator.append(trimmedLine).append("\n");
            } else if (opMatcher.find()) {
                currentOperation = opMatcher.group(1).trim();
                currentTextAccumulator.append(trimmedLine).append("\n");
            } else if (valMatcher.find()) {
                currentValue = parseValue(valMatcher.group(1).trim());
                currentTextAccumulator.append(trimmedLine).append("\n");
            } else {
                // Keep accumulating text for context
                if (currentInstitution != null || currentOperation != null || currentValue != null) {
                    currentTextAccumulator.append(trimmedLine).append("\n");
                }
            }
        }

        // Add the last accumulated debt if present
        if (currentInstitution != null || currentOperation != null || currentValue != null) {
            debts.add(buildDebt(documentId, currentInstitution, currentOperation, currentValue, currentTextAccumulator.toString()));
        }

        // Fallback: If no structured debts were extracted, try the real Registrato PDF pattern
        if (debts.isEmpty()) {
            java.util.regex.Pattern linePattern = java.util.regex.Pattern.compile("^([A-Z0-9][A-Z0-9\\s\\.\\-\\&/]{2,})\\s+(.*)");
            java.util.regex.Pattern valPattern = java.util.regex.Pattern.compile("R\\$\\s*([\\d\\.,]+)");
            java.util.Set<String> seenInstitutions = new java.util.HashSet<>();

            for (String line : lines) {
                String trimmedLine = line.trim();
                java.util.regex.Matcher m = linePattern.matcher(trimmedLine);
                if (m.find()) {
                    String name = m.group(1).trim();
                    String rest = m.group(2);

                    // Exclude common header/summary words
                    String upperName = name.toUpperCase();
                    if (upperName.equals("TOTAL") || upperName.equals("SUBTOTAL") || 
                        upperName.startsWith("MÊS") || upperName.startsWith("MES") ||
                        upperName.equals("EM DIA") || upperName.equals("VENCIDA") ||
                        upperName.equals("INSTITUIÇÃO") || upperName.equals("INSTITUICAO")) {
                        continue;
                    }

                    if (seenInstitutions.contains(upperName)) {
                        continue;
                    }

                    // Sum all R$ values on this line
                    java.util.regex.Matcher valMatcher = valPattern.matcher(rest);
                    BigDecimal sum = BigDecimal.ZERO;
                    boolean foundVal = false;
                    while (valMatcher.find()) {
                        BigDecimal val = parseValue(valMatcher.group(1));
                        if (val != null) {
                            sum = sum.add(val);
                            foundVal = true;
                        }
                    }

                    if (foundVal) {
                        seenInstitutions.add(upperName);
                        debts.add(buildDebt(documentId, name, "Empréstimos e Financiamentos (SCR)", sum, trimmedLine));
                    }
                }
            }
        }

        // Second Fallback: If still empty, try to extract one single block/fallbacks
        if (debts.isEmpty()) {
            // Let's search if there's any mention of institution/operation/value in the text globally
            String institution = null;
            String operation = null;
            BigDecimal value = null;

            for (String line : lines) {
                String trimmedLine = line.trim();
                Matcher instMatcher = INSTITUTION_PATTERN.matcher(trimmedLine);
                Matcher opMatcher = OPERATION_PATTERN.matcher(trimmedLine);
                Matcher valMatcher = VALUE_PATTERN.matcher(trimmedLine);

                if (instMatcher.find() && institution == null) {
                    institution = instMatcher.group(1).trim();
                }
                if (opMatcher.find() && operation == null) {
                    operation = opMatcher.group(1).trim();
                }
                if (valMatcher.find() && value == null) {
                    value = parseValue(valMatcher.group(1).trim());
                }
            }

            if (institution != null || operation != null || value != null) {
                debts.add(buildDebt(documentId, institution, operation, value, text));
            }
        }

        return debts;
    }

    private Debt buildDebt(UUID documentId, String institution, String operation, BigDecimal value, String extractedText) {
        return Debt.builder()
                .id(UUID.randomUUID())
                .documentId(documentId)
                .institution(institution)
                .operationType(operation)
                .reportedValue(value)
                .extractedText(extractedText != null ? extractedText.trim() : null)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private BigDecimal parseValue(String valueStr) {
        if (valueStr == null) return null;
        valueStr = valueStr.trim().replaceAll("R\\$\\s*", "");
        // Remove thousands dots and replace comma with dot
        valueStr = valueStr.replace(".", "").replace(",", ".");
        try {
            return new BigDecimal(valueStr);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
