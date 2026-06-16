package com.quita.api.complaint.pdf;

import com.quita.api.complaint.model.Complaint;
import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class QuitaDocumentRendererTest {

    @Test
    void shouldRenderPdfSuccessfully() throws IOException {
        Complaint complaint = Complaint.builder()
                .id(UUID.randomUUID())
                .institution("Banco Inter S.A.")
                .title("Reclamação de saldo")
                .complaintText("Olá,\nEste é o texto de manifestação de teste.\nFim do teste.")
                .currentDebtValue(new BigDecimal("50000.00"))
                .generatedBy("IA")
                .version(1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        QuitaPdfOptions options = QuitaPdfOptions.builder()
                .showCover(true)
                .showWatermark(true)
                .showFooter(true)
                .showHighlights(true)
                .showEditorialSeal(true)
                .build();

        byte[] pdfBytes = QuitaDocumentRenderer.render(complaint, options);
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    void shouldRenderPdfWithoutCoverSuccessfully() throws IOException {
        Complaint complaint = Complaint.builder()
                .id(UUID.randomUUID())
                .institution("Nubank")
                .title("Reclamação de taxa")
                .complaintText("Este é outro parágrafo de teste.")
                .currentDebtValue(new BigDecimal("1234.56"))
                .generatedBy("Fallback")
                .version(2)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        QuitaPdfOptions options = QuitaPdfOptions.builder()
                .showCover(false)
                .showWatermark(false)
                .showFooter(false)
                .showHighlights(false)
                .showEditorialSeal(false)
                .build();

        byte[] pdfBytes = QuitaDocumentRenderer.render(complaint, options);
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }
}
