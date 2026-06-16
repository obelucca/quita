package com.quita.api.complaint.pdf;

import com.quita.api.complaint.model.Complaint;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.state.RenderingMode;

import java.io.IOException;
import java.time.format.DateTimeFormatter;

public class QuitaHeaderRenderer {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    public static void renderHeader(PDDocument doc, PDPageContentStream contentStream, PDType0Font font, Complaint complaint, String docId) throws IOException {
        contentStream.saveGraphicsState();

        // 1. Logo Quita (Retângulo verde pequeno e Letra Q)
        contentStream.setNonStrokingColor(16 / 255f, 185 / 255f, 129 / 255f);
        contentStream.addRect(54, 742, 14, 14);
        contentStream.fill();

        contentStream.beginText();
        contentStream.setFont(font, 9);
        contentStream.setNonStrokingColor(1f, 1f, 1f);
        contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
        contentStream.setLineWidth(0.2f);
        contentStream.setStrokingColor(1f, 1f, 1f);
        contentStream.newLineAtOffset(58.5f, 746f);
        contentStream.showText("Q");
        contentStream.endText();

        // 2. Nome da Marca "Quita"
        contentStream.beginText();
        contentStream.setFont(font, 10);
        contentStream.setNonStrokingColor(15 / 255f, 23 / 255f, 42 / 255f); // slate-900
        contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
        contentStream.setLineWidth(0.2f);
        contentStream.setStrokingColor(15 / 255f, 23 / 255f, 42 / 255f);
        contentStream.newLineAtOffset(73, 745);
        contentStream.showText("Quita");
        contentStream.endText();

        // 3. Título do Documento à direita: "MANIFESTAÇÃO PARA ESCLARECIMENTOS FINANCEIROS"
        contentStream.beginText();
        contentStream.setFont(font, 8);
        contentStream.setNonStrokingColor(100 / 255f, 116 / 255f, 139 / 255f); // slate-500
        contentStream.setRenderingMode(RenderingMode.FILL);
        String subTitle = "MANIFESTAÇÃO PARA ESCLARECIMENTOS FINANCEIROS";
        float subTitleWidth = font.getStringWidth(subTitle) / 1000f * 8;
        contentStream.newLineAtOffset(558 - subTitleWidth, 746);
        contentStream.showText(subTitle);
        contentStream.endText();

        // 4. Sub-cabeçalho de metadados
        contentStream.beginText();
        contentStream.setFont(font, 7);
        contentStream.setNonStrokingColor(148 / 255f, 163 / 255f, 184 / 255f); // slate-400
        String dateStr = (complaint.getCreatedAt() != null)
                ? complaint.getCreatedAt().format(TIME_FORMATTER)
                : java.time.LocalDateTime.now().format(TIME_FORMATTER);
        String metadataText = "Documento nº " + docId + " | Gerado em: " + dateStr;
        float metadataWidth = font.getStringWidth(metadataText) / 1000f * 7;
        contentStream.newLineAtOffset(558 - metadataWidth, 734);
        contentStream.showText(metadataText);
        contentStream.endText();

        // 5. Linha divisória horizontal
        contentStream.setStrokingColor(226 / 255f, 232 / 255f, 240 / 255f); // slate-200
        contentStream.setLineWidth(0.8f);
        contentStream.moveTo(54, 725);
        contentStream.lineTo(558, 725);
        contentStream.stroke();

        contentStream.restoreGraphicsState();
    }
}
