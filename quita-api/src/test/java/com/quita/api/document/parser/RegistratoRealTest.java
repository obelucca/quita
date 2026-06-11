package com.quita.api.document.parser;

import com.quita.api.debt.model.Debt;
import com.quita.api.debt.service.DebtExtractionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.File;
import java.util.List;
import java.util.UUID;

@SpringBootTest
public class RegistratoRealTest {

    @Autowired
    private RegistratoPdfParser parser;

    @Autowired
    private DebtExtractionService debtExtractionService;

    @Test
    public void testRealRegistrato() throws Exception {
        File file = new File("c:\\projetos\\Quita\\REGISTRATO TESTE\\SCR-14418527605-202603-12032026-201054226-104427291 (1).pdf");
        System.out.println("=========================================");
        System.out.println("TESTING REAL REGISTRATO PDF");
        System.out.println("File exists: " + file.exists());
        System.out.println("File path: " + file.getAbsolutePath());
        System.out.println("File size: " + file.length() + " bytes");
        System.out.println("=========================================");

        if (!file.exists()) {
            return;
        }

        String text = parser.parse(file);
        System.out.println("EXTRACTED TEXT LENGTH: " + text.length());
        System.out.println("-----------------------------------------");
        System.out.println("FIRST 10000 CHARACTERS OF TEXT:");
        System.out.println(text.substring(0, Math.min(text.length(), 10000)));
        System.out.println("-----------------------------------------");

        List<Debt> debts = new java.util.ArrayList<>();
        String[] lines = text.split("\\r?\\n");
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

                // We only want the first occurrence of each institution (most recent month)
                if (seenInstitutions.contains(upperName)) {
                    continue;
                }

                // Sum all R$ values on this line
                java.util.regex.Matcher valMatcher = valPattern.matcher(rest);
                java.math.BigDecimal sum = java.math.BigDecimal.ZERO;
                boolean foundVal = false;
                while (valMatcher.find()) {
                    String valStr = valMatcher.group(1).trim().replace(".", "").replace(",", ".");
                    try {
                        sum = sum.add(new java.math.BigDecimal(valStr));
                        foundVal = true;
                    } catch (NumberFormatException e) {
                        // ignore
                    }
                }

                if (foundVal) {
                    seenInstitutions.add(upperName);
                    debts.add(Debt.builder()
                        .institution(name)
                        .reportedValue(sum)
                        .operationType("Empréstimos e Financiamentos (SCR)")
                        .build());
                }
            }
        }

        System.out.println("EXTRACTED DEBTS COUNT: " + debts.size());
        for (Debt debt : debts) {
            System.out.println("- Institution: " + debt.getInstitution() +
                               ", Operation: " + debt.getOperationType() +
                               ", Value: " + debt.getReportedValue());
        }
        System.out.println("=========================================");
    }
}
