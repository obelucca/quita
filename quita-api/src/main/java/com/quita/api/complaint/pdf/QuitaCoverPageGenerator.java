package com.quita.api.complaint.pdf;

import com.quita.api.complaint.model.Complaint;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.state.RenderingMode;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class QuitaCoverPageGenerator {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    public static void renderCover(PDDocument doc, PDType0Font font, Complaint complaint, String docId) throws IOException {
        PDPage page = new PDPage();
        doc.addPage(page);

        try (PDPageContentStream contentStream = new PDPageContentStream(doc, page)) {
            // Desenhar a marca d'água de fundo (mesmo na capa, para ficar premium)
            QuitaWatermarkGenerator.renderWatermark(doc, contentStream);

            // 1. Logo Quita Centralizado (Retângulo verde e Letra Q branca)
            contentStream.setNonStrokingColor(16 / 255f, 185 / 255f, 129 / 255f);
            contentStream.addRect(291, 550, 30, 30);
            contentStream.fill();

            contentStream.beginText();
            contentStream.setFont(font, 18);
            contentStream.setNonStrokingColor(255 / 255f, 255 / 255f, 255 / 255f);
            // Simular negrito para a letra Q
            contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
            contentStream.setLineWidth(0.3f);
            contentStream.setStrokingColor(1f, 1f, 1f);
            contentStream.newLineAtOffset(300, 558);
            contentStream.showText("Q");
            contentStream.endText();

            // 2. Nome da Marca "Quita"
            contentStream.beginText();
            contentStream.setFont(font, 24);
            contentStream.setNonStrokingColor(15 / 255f, 23 / 255f, 42 / 255f); // slate-900
            contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
            contentStream.setLineWidth(0.4f);
            contentStream.setStrokingColor(15 / 255f, 23 / 255f, 42 / 255f);
            contentStream.newLineAtOffset(278, 510);
            contentStream.showText("Quita");
            contentStream.endText();

            // 3. Linha divisória horizontal central
            contentStream.setNonStrokingColor(226 / 255f, 232 / 255f, 240 / 255f); // slate-200
            contentStream.setLineWidth(1f);
            contentStream.moveTo(206, 460);
            contentStream.lineTo(406, 460);
            contentStream.stroke();

            // 4. Título Principal: "MANIFESTAÇÃO ADMINISTRATIVA"
            contentStream.beginText();
            contentStream.setFont(font, 18);
            contentStream.setNonStrokingColor(15 / 255f, 23 / 255f, 42 / 255f); // slate-900
            contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
            contentStream.setLineWidth(0.3f);
            contentStream.setStrokingColor(15 / 255f, 23 / 255f, 42 / 255f);
            String title = "MANIFESTAÇÃO ADMINISTRATIVA";
            float titleWidth = font.getStringWidth(title) / 1000f * 18;
            contentStream.newLineAtOffset(306 - (titleWidth / 2), 410);
            contentStream.showText(title);
            contentStream.endText();

            // Resetar modo de texto para o padrão
            contentStream.setRenderingMode(RenderingMode.FILL);

            // 5. Subtítulo (Wrapped)
            String subtitle = "Documento elaborado para auxiliar a organização das informações necessárias à resolução administrativa da demanda apresentada.";
            contentStream.beginText();
            contentStream.setFont(font, 10);
            contentStream.setNonStrokingColor(100 / 255f, 116 / 255f, 139 / 255f); // slate-500
            List<String> subLines = wrapText(subtitle, font, 10, 360);
            float currentY = 370;
            for (String line : subLines) {
                float lineWidth = font.getStringWidth(line) / 1000f * 10;
                contentStream.newLineAtOffset(306 - (lineWidth / 2), 0);
                contentStream.newLineAtOffset(0, -14);
                contentStream.showText(line);
                // Reset offset X to absolute center for the next line
                contentStream.newLineAtOffset(-(306 - (lineWidth / 2)), 0);
                currentY -= 14;
            }
            contentStream.endText();

            // 6. Bloco de Informações do Caso
            float infoY = 220;
            contentStream.setNonStrokingColor(248 / 255f, 250 / 255f, 252 / 255f); // slate-50 (fundo leve)
            contentStream.addRect(106, infoY - 80, 400, 100);
            contentStream.fill();
            contentStream.setStrokingColor(241 / 255f, 245 / 255f, 249 / 255f); // slate-100 (borda leve)
            contentStream.addRect(106, infoY - 80, 400, 100);
            contentStream.stroke();

            // Texto interno do bloco de informações
            contentStream.beginText();
            contentStream.setFont(font, 10);
            contentStream.setNonStrokingColor(51 / 255f, 65 / 255f, 85 / 255f); // slate-700
            contentStream.newLineAtOffset(126, infoY - 10);

            // Instituição
            contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
            contentStream.setLineWidth(0.2f);
            contentStream.setStrokingColor(51 / 255f, 65 / 255f, 85 / 255f);
            contentStream.showText("Destinatário: ");
            contentStream.setRenderingMode(RenderingMode.FILL);
            contentStream.showText(complaint.getInstitution());

            // Código
            contentStream.newLineAtOffset(0, -20);
            contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
            contentStream.setLineWidth(0.2f);
            contentStream.setStrokingColor(51 / 255f, 65 / 255f, 85 / 255f);
            contentStream.showText("Código de Identificação: ");
            contentStream.setRenderingMode(RenderingMode.FILL);
            contentStream.showText(docId);

            // Data
            contentStream.newLineAtOffset(0, -20);
            contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
            contentStream.setLineWidth(0.2f);
            contentStream.setStrokingColor(51 / 255f, 65 / 255f, 85 / 255f);
            contentStream.showText("Data de Emissão: ");
            contentStream.setRenderingMode(RenderingMode.FILL);
            String dateStr = (complaint.getCreatedAt() != null)
                ? complaint.getCreatedAt().format(TIME_FORMATTER)
                : java.time.LocalDateTime.now().format(TIME_FORMATTER);
            contentStream.showText(dateStr);

            contentStream.endText();
        }
    }

    private static List<String> wrapText(String text, PDType0Font font, float fontSize, float width) throws IOException {
        String[] words = text.split(" ");
        List<String> lines = new ArrayList<>();
        StringBuilder line = new StringBuilder();
        for (String word : words) {
            String testLine = line.length() == 0 ? word : line + " " + word;
            float lineWidth = font.getStringWidth(testLine) / 1000f * fontSize;
            if (lineWidth > width) {
                lines.add(line.toString());
                line = new StringBuilder(word);
            } else {
                line = new StringBuilder(testLine);
            }
        }
        if (line.length() > 0) {
            lines.add(line.toString());
        }
        return lines;
    }
}
