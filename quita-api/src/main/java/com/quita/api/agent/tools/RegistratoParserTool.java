package com.quita.api.agent.tools;

import com.quita.api.document.model.Document;
import com.quita.api.document.model.DocumentStatus;
import com.quita.api.document.repository.DocumentRepository;
import com.quita.api.debt.service.DebtExtractionService;
import com.quita.api.debt.model.Debt;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RegistratoParserTool implements AgentTool {

    private final DocumentRepository documentRepository;
    private final DebtExtractionService debtExtractionService;

    @Override
    public String name() {
        return "registrato_parser";
    }

    @Override
    @Transactional
    public ToolResult execute(AgentContext context) {
        if (context == null) {
            return ToolResult.builder()
                    .success(false)
                    .message("Context cannot be null")
                    .build();
        }

        Object docIdObj = context.getParameter("documentId");
        if (docIdObj == null) {
            return ToolResult.builder()
                    .success(false)
                    .message("Missing required parameter: documentId")
                    .build();
        }

        UUID documentId;
        try {
            if (docIdObj instanceof UUID) {
                documentId = (UUID) docIdObj;
            } else {
                documentId = UUID.fromString(docIdObj.toString());
            }
        } catch (IllegalArgumentException e) {
            return ToolResult.builder()
                    .success(false)
                    .message("Invalid documentId format: " + docIdObj)
                    .build();
        }

        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return ToolResult.builder()
                    .success(false)
                    .message("Document not found: " + documentId)
                    .build();
        }

        // Update status to PROCESSING
        document.setStatus(DocumentStatus.PROCESSING);
        documentRepository.saveAndFlush(document);

        try {
            List<Debt> debts = debtExtractionService.extractAndSaveDebts(document);
            
            document.setStatus(DocumentStatus.PROCESSED);
            documentRepository.saveAndFlush(document);

            return ToolResult.builder()
                    .success(true)
                    .message("Successfully processed document and extracted " + debts.size() + " debt(s)")
                    .data(debts)
                    .build();
        } catch (Exception e) {
            document.setStatus(DocumentStatus.FAILED);
            documentRepository.saveAndFlush(document);

            return ToolResult.builder()
                    .success(false)
                    .message("Failed to process document: " + e.getMessage())
                    .build();
        }
    }
}
