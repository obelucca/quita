package com.quita.api.complaint.service;

import com.quita.api.complaint.dto.ComplaintGenerationRequest;
import com.quita.api.complaint.dto.ComplaintResponse;
import com.quita.api.complaint.model.Complaint;
import com.quita.api.complaint.repository.ComplaintRepository;
import com.quita.api.debt.model.Debt;
import com.quita.api.debt.repository.DebtRepository;
import com.quita.api.llm.LLMClient;
import com.quita.api.llm.PromptBuilder;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ComplaintGenerationService {

    private final ComplaintRepository complaintRepository;
    private final DebtRepository debtRepository;
    private final LLMClient llmClient;
    private final PromptBuilder promptBuilder;

    @Value("${quita.llm.provider:GEMINI}")
    private String llmProvider;

    public ComplaintGenerationService(
            ComplaintRepository complaintRepository,
            DebtRepository debtRepository,
            LLMClient llmClient,
            PromptBuilder promptBuilder) {
        this.complaintRepository = complaintRepository;
        this.debtRepository = debtRepository;
        this.llmClient = llmClient;
        this.promptBuilder = promptBuilder;
    }

    private static final String JURIDICAL_DISCLAIMER =
            "O Quita gera sugestões de texto com base nas informações fornecidas pelo usuário. Revise cuidadosamente o conteúdo antes do envio. Esta ferramenta não constitui aconselhamento jurídico.";

    private static final List<ComplaintResponse.ConsumerGovInstruction> CONSUMER_GOV_STEPS = Arrays.asList(
            new ComplaintResponse.ConsumerGovInstruction(1, "Acesse o Consumidor.gov.br"),
            new ComplaintResponse.ConsumerGovInstruction(2, "Selecione a instituição financeira correspondente."),
            new ComplaintResponse.ConsumerGovInstruction(3, "Cole ou revise o texto sugerido."),
            new ComplaintResponse.ConsumerGovInstruction(4, "Anexe documentos, caso possua."),
            new ComplaintResponse.ConsumerGovInstruction(5, "Revise cuidadosamente antes do envio.")
    );

    private static final List<String> SUGGESTED_ATTACHMENTS = Arrays.asList(
            "Relatório Registrato",
            "Contrato",
            "Extrato atualizado",
            "Boletos"
    );

    @Transactional
    public ComplaintResponse generate(UUID userId, ComplaintGenerationRequest request) {
        return generate(userId, request, true);
    }

    @Transactional
    public ComplaintResponse generate(UUID userId, ComplaintGenerationRequest request, boolean allowFallback) {
        // Find user debts for this institution
        List<Debt> userDebts = debtRepository.findAllByUserId(userId);
        List<Debt> instDebts = userDebts.stream()
                .filter(d -> d.getInstitution() != null && d.getInstitution().equalsIgnoreCase(request.getInstitution()))
                .toList();

        // Increment version
        int maxVersion = complaintRepository.findMaxVersionByUserIdAndInstitution(userId, request.getInstitution());
        int newVersion = maxVersion + 1;

        String prompt = promptBuilder.buildPrompt(request.getInstitution(), instDebts, request.getCurrentDebtValue());

        String generatedText;
        String generatedBy;
        String message = null;

        try {
            generatedText = llmClient.generate(prompt);
            generatedBy = llmProvider.toUpperCase();
        } catch (Exception e) {
            if (!allowFallback) {
                throw e;
            }
            // Fallback determinístico
            generatedText = PromptBuilder.BASE_TEMPLATE;
            generatedBy = "TEMPLATE_ONLY";
            message = "Não foi possível personalizar o texto neste momento. Uma versão padrão foi gerada com sucesso.";
        }

        Complaint complaint = Complaint.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .institution(request.getInstitution())
                .title("Solicitação de revisão contratual")
                .complaintText(generatedText)
                .currentDebtValue(request.getCurrentDebtValue())
                .generatedBy(generatedBy)
                .version(newVersion)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        complaintRepository.save(complaint);

        return mapToResponse(complaint, message);
    }

    @Transactional
    public ComplaintResponse regenerate(UUID userId, UUID id, ComplaintGenerationRequest request) {
        // Look up original complaint
        Complaint original = complaintRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        // Use new currentDebtValue if supplied, otherwise retain original
        java.math.BigDecimal finalDebtValue = (request != null && request.getCurrentDebtValue() != null)
                ? request.getCurrentDebtValue()
                : original.getCurrentDebtValue();

        // Create the new request context
        ComplaintGenerationRequest newRequest = ComplaintGenerationRequest.builder()
                .institution(original.getInstitution())
                .currentDebtValue(finalDebtValue)
                .build();

        // Delegate to standard generation (which increments version correctly)
        return generate(userId, newRequest);
    }

    public byte[] generateComplaintPdf(Complaint complaint) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(doc, page);
            contentStream.beginText();

            // Load font from resources
            PDType0Font font;
            try (InputStream fontStream = getClass().getResourceAsStream("/arial.ttf")) {
                if (fontStream == null) {
                    throw new IllegalStateException("Font file /arial.ttf not found in classpath");
                }
                font = PDType0Font.load(doc, fontStream);
            }

            // Title
            contentStream.setFont(font, 16);
            contentStream.newLineAtOffset(50, 750);
            contentStream.showText("Reclamacao - " + complaint.getInstitution());
            contentStream.newLineAtOffset(0, -25);

            // Metadata
            contentStream.setFont(font, 10);
            contentStream.showText("Versao: " + complaint.getVersion() + " | Gerado por: " + complaint.getGeneratedBy());
            contentStream.newLineAtOffset(0, -15);
            contentStream.showText("Data: " + complaint.getCreatedAt().toString());
            contentStream.newLineAtOffset(0, -25);

            contentStream.setFont(font, 11);

            String[] paragraphs = complaint.getComplaintText().split("\n");
            float yPosition = 685;
            float margin = 50;
            float leading = 15;

            for (String paragraph : paragraphs) {
                // Strip emoji or unsupported characters (keep latin basic and punctuation)
                String cleanText = paragraph.replaceAll("[^\\p{L}\\p{N}\\p{P}\\p{Z}\\n]", "");
                if (cleanText.trim().isEmpty()) {
                    contentStream.newLineAtOffset(0, -leading);
                    yPosition -= leading;
                    if (yPosition < margin) {
                        contentStream.endText();
                        contentStream.close();

                        page = new PDPage();
                        doc.addPage(page);
                        contentStream = new PDPageContentStream(doc, page);
                        contentStream.beginText();
                        contentStream.setFont(font, 11);
                        contentStream.newLineAtOffset(50, 750);
                        yPosition = 750;
                    }
                    continue;
                }

                // Wrap words
                String[] words = cleanText.split(" ");
                StringBuilder line = new StringBuilder();
                for (String word : words) {
                    String testLine = line.length() == 0 ? word : line + " " + word;
                    float width = font.getStringWidth(testLine) / 1000 * 11;
                    if (width > 500) {
                        contentStream.showText(line.toString());
                        contentStream.newLineAtOffset(0, -leading);
                        yPosition -= leading;
                        if (yPosition < margin) {
                            contentStream.endText();
                            contentStream.close();

                            page = new PDPage();
                            doc.addPage(page);
                            contentStream = new PDPageContentStream(doc, page);
                            contentStream.beginText();
                            contentStream.setFont(font, 11);
                            contentStream.newLineAtOffset(50, 750);
                            yPosition = 750;
                        }
                        line = new StringBuilder(word);
                    } else {
                        line = new StringBuilder(testLine);
                    }
                }
                if (line.length() > 0) {
                    contentStream.showText(line.toString());
                    contentStream.newLineAtOffset(0, -leading);
                    yPosition -= leading;
                    if (yPosition < margin) {
                        contentStream.endText();
                        contentStream.close();

                        page = new PDPage();
                        doc.addPage(page);
                        contentStream = new PDPageContentStream(doc, page);
                        contentStream.beginText();
                        contentStream.setFont(font, 11);
                        contentStream.newLineAtOffset(50, 750);
                        yPosition = 750;
                    }
                }
            }

            contentStream.endText();
            contentStream.close();

            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    private ComplaintResponse mapToResponse(Complaint c, String message) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .institution(c.getInstitution())
                .title(c.getTitle())
                .complaint(c.getComplaintText())
                .attachments(SUGGESTED_ATTACHMENTS)
                .editable(true)
                .disclaimer(JURIDICAL_DISCLAIMER)
                .consumerGovInstructions(CONSUMER_GOV_STEPS)
                .message(message)
                .build();
    }
}
