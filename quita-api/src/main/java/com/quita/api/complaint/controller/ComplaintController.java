package com.quita.api.complaint.controller;

import com.quita.api.auth.security.UserPrincipal;
import com.quita.api.complaint.dto.ComplaintGenerationRequest;
import com.quita.api.complaint.dto.ComplaintHistoryResponse;
import com.quita.api.complaint.dto.ComplaintResponse;
import com.quita.api.complaint.model.Complaint;
import com.quita.api.complaint.service.ComplaintGenerationService;
import com.quita.api.complaint.service.ComplaintHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintGenerationService complaintGenerationService;
    private final ComplaintHistoryService complaintHistoryService;

    public ComplaintController(
            ComplaintGenerationService complaintGenerationService,
            ComplaintHistoryService complaintHistoryService) {
        this.complaintGenerationService = complaintGenerationService;
        this.complaintHistoryService = complaintHistoryService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ComplaintResponse> generate(
            @Valid @RequestBody ComplaintGenerationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintGenerationService.generate(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ComplaintHistoryResponse>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ComplaintHistoryResponse> history = complaintHistoryService.getHistory(principal.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Complaint complaint = complaintHistoryService.getById(id, principal.getId());
        return ResponseEntity.ok(mapToResponse(complaint));
    }

    @PostMapping("/{id}/regenerate")
    public ResponseEntity<ComplaintResponse> regenerate(
            @PathVariable UUID id,
            @RequestBody(required = false) ComplaintGenerationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintGenerationService.regenerate(principal.getId(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getPdf(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean showCover,
            @RequestParam(defaultValue = "true") boolean showWatermark,
            @RequestParam(defaultValue = "true") boolean showFooter,
            @RequestParam(defaultValue = "true") boolean showDocId,
            @RequestParam(defaultValue = "true") boolean showEditorialSeal,
            @RequestParam(defaultValue = "true") boolean showHighlights,
            @AuthenticationPrincipal UserPrincipal principal) {
        Complaint complaint = complaintHistoryService.getById(id, principal.getId());
        try {
            com.quita.api.complaint.pdf.QuitaPdfOptions options = com.quita.api.complaint.pdf.QuitaPdfOptions.builder()
                    .showCover(showCover)
                    .showWatermark(showWatermark)
                    .showFooter(showFooter)
                    .showDocId(showDocId)
                    .showEditorialSeal(showEditorialSeal)
                    .showHighlights(showHighlights)
                    .build();
            byte[] pdfBytes = complaintGenerationService.generateComplaintPdf(complaint, options);
            String filename = "reclamacao_" + complaint.getInstitution().replaceAll("\\s+", "_") + "_v" + complaint.getVersion() + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(pdfBytes);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF", e);
        }
    }

    private ComplaintResponse mapToResponse(Complaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .institution(c.getInstitution())
                .title(c.getTitle())
                .complaint(c.getComplaintText())
                .attachments(Arrays.asList("Relatório Registrato", "Contrato", "Extrato atualizado", "Boletos"))
                .editable(true)
                .disclaimer("O Quita gera sugestões de texto com base nas informações fornecidas pelo usuário. Revise cuidadosamente o conteúdo antes do envio. Esta ferramenta não constitui aconselhamento jurídico.")
                .consumerGovInstructions(Arrays.asList(
                        new ComplaintResponse.ConsumerGovInstruction(1, "Acesse o Consumidor.gov.br"),
                        new ComplaintResponse.ConsumerGovInstruction(2, "Selecione a instituição financeira correspondente."),
                        new ComplaintResponse.ConsumerGovInstruction(3, "Cole ou revise o texto sugerido."),
                        new ComplaintResponse.ConsumerGovInstruction(4, "Anexe documentos, caso possua."),
                        new ComplaintResponse.ConsumerGovInstruction(5, "Revise cuidadosamente antes do envio.")
                ))
                .build();
    }
}
