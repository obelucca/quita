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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.quita.api.user.service.CreditService;

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
    private final RegulatoryCaseClassifier regulatoryCaseClassifier;
    private final ComplaintTextPostProcessor complaintTextPostProcessor;
    private final ComplaintPatternSelector complaintPatternSelector;
    private final NarrativeVariationEngine narrativeVariationEngine;
    private final ComplaintQualityValidator complaintQualityValidator;
    private final RegulatoryIssueDetector regulatoryIssueDetector;
    private final RegulatoryIssuePromptEnricher regulatoryIssuePromptEnricher;
    private final RegulatoryReasoningBuilder regulatoryReasoningBuilder;
    private final HumanComplaintBlueprint humanComplaintBlueprint;
    private final CreditService creditService;

    @Value("${quita.llm.provider:GEMINI}")
    private String llmProvider;

    public ComplaintGenerationService(
            ComplaintRepository complaintRepository,
            DebtRepository debtRepository,
            LLMClient llmClient,
            PromptBuilder promptBuilder,
            RegulatoryCaseClassifier regulatoryCaseClassifier,
            ComplaintTextPostProcessor complaintTextPostProcessor,
            ComplaintPatternSelector complaintPatternSelector,
            NarrativeVariationEngine narrativeVariationEngine,
            ComplaintQualityValidator complaintQualityValidator,
            RegulatoryIssueDetector regulatoryIssueDetector,
            RegulatoryIssuePromptEnricher regulatoryIssuePromptEnricher,
            RegulatoryReasoningBuilder regulatoryReasoningBuilder,
            HumanComplaintBlueprint humanComplaintBlueprint,
            CreditService creditService) {
        this.complaintRepository = complaintRepository;
        this.debtRepository = debtRepository;
        this.llmClient = llmClient;
        this.promptBuilder = promptBuilder;
        this.regulatoryCaseClassifier = regulatoryCaseClassifier;
        this.complaintTextPostProcessor = complaintTextPostProcessor;
        this.complaintPatternSelector = complaintPatternSelector;
        this.narrativeVariationEngine = narrativeVariationEngine;
        this.complaintQualityValidator = complaintQualityValidator;
        this.regulatoryIssueDetector = regulatoryIssueDetector;
        this.regulatoryIssuePromptEnricher = regulatoryIssuePromptEnricher;
        this.regulatoryReasoningBuilder = regulatoryReasoningBuilder;
        this.humanComplaintBlueprint = humanComplaintBlueprint;
        this.creditService = creditService;
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
        creditService.validateCanGenerate(userId);

        // Find user debts for this institution
        List<Debt> userDebts = debtRepository.findAllByUserId(userId);
        List<Debt> instDebts = userDebts.stream()
                .filter(d -> d.getInstitution() != null && d.getInstitution().equalsIgnoreCase(request.getInstitution()))
                .toList();

        // Increment version
        int maxVersion = complaintRepository.findMaxVersionByUserIdAndInstitution(userId, request.getInstitution());
        int newVersion = maxVersion + 1;

        RegulatoryCaseContext context = regulatoryCaseClassifier.classify(
                request.getInstitution(), instDebts, request.getCurrentDebtValue(), userDebts);

        // SDD-007F: Detect issues
        List<DetectedIssue> detectedIssues = regulatoryIssueDetector.detectIssues(context);
        List<String> issueExplanations = detectedIssues.stream()
                .map(di -> di.issue().getDescription() + ": " + di.explanation())
                .toList();

        // SDD-007E: Pattern selection & variation
        ComplaintPattern pattern = complaintPatternSelector.selectPattern(userId, context, newVersion);
        String opening = narrativeVariationEngine.selectOpening(userId, request.getInstitution(), pattern, newVersion);
        String closing = narrativeVariationEngine.selectClosing(userId, request.getInstitution(), pattern, newVersion);

        String enrichmentText = regulatoryIssuePromptEnricher.enrichPrompt(detectedIssues);
        List<String> reasonings = regulatoryReasoningBuilder.buildReasonings(
                request.getInstitution(), context, request.getCurrentDebtValue(), detectedIssues);
        String blueprintInst = humanComplaintBlueprint.getBlueprintInstructions();

        String prompt = promptBuilder.buildPrompt(
                request.getInstitution(), context, request.getCurrentDebtValue(), pattern, opening, closing, 
                enrichmentText, blueprintInst, reasonings);

        String generatedText = null;
        String generatedBy = null;
        String message = null;

        boolean success = false;
        try {
            // 1. Generate via LLM (1 attempt)
            String rawText = llmClient.generate(prompt);
            
            // 2. Evaluate
            ComplaintQualityValidator.ValidationResult val = complaintQualityValidator.validate(
                    rawText, request.getInstitution(), context.getTotalAmount(), request.getCurrentDebtValue());
            
            String textToChallenge = null;
            if (val.isValid()) {
                textToChallenge = rawText;
            } else {
                // Score < 85 -> run Repair (post-processing)
                String repairedText = complaintTextPostProcessor.postProcess(rawText);
                val = complaintQualityValidator.validate(
                        repairedText, request.getInstitution(), context.getTotalAmount(), request.getCurrentDebtValue());
                if (val.isValid()) {
                    textToChallenge = repairedText;
                }
            }

            if (textToChallenge != null) {
                // 3. Challenge Stage
                String challengePrompt = "Analise criticamente a seguinte manifestação regulatória destinada a uma instituição financeira. "
                        + "Identifique se ela possui clichês genéricos, se parece um modelo pronto de internet, se falha em individualizar os dados do caso do consumidor, ou se tem pedidos desvinculados dos fatos.\n"
                        + "Se encontrar qualquer falha ou ponto fraco, descreva qual é esse ponto mais fraco em uma única frase direta.\n"
                        + "Se a manifestação estiver perfeita, altamente técnica, individualizada e excelente, responda APENAS: EXCELENTE\n\n"
                        + "MANIFESTAÇÃO:\n" + textToChallenge;
                
                String critique = llmClient.generate(challengePrompt);
                if (critique != null && critique.trim().toUpperCase().contains("EXCELENTE") && critique.trim().length() < 25) {
                    generatedText = textToChallenge;
                    generatedBy = llmProvider.toUpperCase();
                    success = true;
                } else {
                    // Challenge failed! Trigger Regeneration with the critique
                    String regenPrompt = prompt + "\n\nCRÍTICA INTERNA DETECTADA A CORRIGIR: " + critique 
                            + "\nPor favor, reescreva a manifestação de forma a sanar essa fraqueza específica, mantendo as evidências fáticas e sem clichês.";
                    String regeneratedText = llmClient.generate(regenPrompt);
                    
                    ComplaintQualityValidator.ValidationResult valRegen = complaintQualityValidator.validate(
                            regeneratedText, request.getInstitution(), context.getTotalAmount(), request.getCurrentDebtValue());
                    if (valRegen.isValid()) {
                        generatedText = regeneratedText;
                        generatedBy = llmProvider.toUpperCase();
                        success = true;
                    } else {
                        // Attempt to repair the regenerated text as a last resort before fallback
                        String repairedRegen = complaintTextPostProcessor.postProcess(regeneratedText);
                        valRegen = complaintQualityValidator.validate(
                                repairedRegen, request.getInstitution(), context.getTotalAmount(), request.getCurrentDebtValue());
                        if (valRegen.isValid()) {
                            generatedText = repairedRegen;
                            generatedBy = llmProvider.toUpperCase();
                            success = true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // LLM threw an exception, fall through to fallback
        }

        if (!success) {
            if (!allowFallback) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível gerar uma manifestação com qualidade aceitável.");
            }
            // Fallback Premium Dinâmico V2
            String fallbackRaw = promptBuilder.buildFallbackText(
                    request.getInstitution(), context, request.getCurrentDebtValue(), pattern, opening, closing, newVersion);
            generatedText = complaintTextPostProcessor.postProcess(fallbackRaw);
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
                .creditConsumed(false)
                .creditConsumedAt(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        complaintRepository.save(complaint);
        creditService.consumeCredit(userId, complaint.getId());

        return mapToResponse(complaint, message, issueExplanations);
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
        return generateComplaintPdf(complaint, new com.quita.api.complaint.pdf.QuitaPdfOptions());
    }

    public byte[] generateComplaintPdf(Complaint complaint, com.quita.api.complaint.pdf.QuitaPdfOptions options) throws IOException {
        return com.quita.api.complaint.pdf.QuitaDocumentRenderer.render(complaint, options);
    }

    private ComplaintResponse mapToResponse(Complaint c, String message) {
        return mapToResponse(c, message, null);
    }

    private ComplaintResponse mapToResponse(Complaint c, String message, List<String> detectedIssues) {
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
                .detectedIssues(detectedIssues)
                .build();
    }
}
