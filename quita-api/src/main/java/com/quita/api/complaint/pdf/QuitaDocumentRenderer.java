package com.quita.api.complaint.pdf;

import com.quita.api.complaint.model.Complaint;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.state.RenderingMode;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class QuitaDocumentRenderer {

    public static byte[] render(Complaint complaint, QuitaPdfOptions options) throws IOException {
        String docId = DocumentIdentifierGenerator.generate(complaint);

        try (PDDocument doc = new PDDocument()) {
            // Carregar a fonte Arial (com suporte a acentuação UTF-8)
            PDType0Font font;
            try (InputStream fontStream = QuitaDocumentRenderer.class.getResourceAsStream("/arial.ttf")) {
                if (fontStream == null) {
                    throw new IllegalStateException("Font file /arial.ttf not found in classpath");
                }
                font = PDType0Font.load(doc, fontStream);
            }

            // 1. Renderizar Capa se configurado
            if (options.isShowCover()) {
                QuitaCoverPageGenerator.renderCover(doc, font, complaint, docId);
            }

            // 2. Renderizar Conteúdo Principal
            PDPage page = new PDPage();
            doc.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(doc, page);
            
            // Renderizar cabeçalho da página 1 de conteúdo
            QuitaHeaderRenderer.renderHeader(doc, contentStream, font, complaint, docId);
            
            // Renderizar marca d'água da página 1 de conteúdo
            if (options.isShowWatermark()) {
                QuitaWatermarkGenerator.renderWatermark(doc, contentStream);
            }

            float yPosition = 680;
            float leftMargin = 54;
            float rightMargin = 558;
            float printableWidth = rightMargin - leftMargin; // 504 pt
            float leading = 15;
            float bottomLimit = 80;

            String[] paragraphs = complaint.getComplaintText().split("\n");
            for (String paragraph : paragraphs) {
                // Remover caracteres não imprimíveis (emojis)
                String cleanParagraph = paragraph.replaceAll("[^\\p{L}\\p{N}\\p{P}\\p{Z}\\n]", "");
                
                if (cleanParagraph.trim().isEmpty()) {
                    yPosition -= leading;
                    if (yPosition < bottomLimit) {
                        contentStream.close();
                        page = new PDPage();
                        doc.addPage(page);
                        contentStream = new PDPageContentStream(doc, page);
                        QuitaHeaderRenderer.renderHeader(doc, contentStream, font, complaint, docId);
                        if (options.isShowWatermark()) {
                            QuitaWatermarkGenerator.renderWatermark(doc, contentStream);
                        }
                        yPosition = 680;
                    }
                    continue;
                }

                // Envelopar linhas
                List<String> wrappedLines = wrapText(cleanParagraph, font, 10.5f, printableWidth);
                for (String line : wrappedLines) {
                    if (yPosition < bottomLimit) {
                        contentStream.close();
                        page = new PDPage();
                        doc.addPage(page);
                        contentStream = new PDPageContentStream(doc, page);
                        QuitaHeaderRenderer.renderHeader(doc, contentStream, font, complaint, docId);
                        if (options.isShowWatermark()) {
                            QuitaWatermarkGenerator.renderWatermark(doc, contentStream);
                        }
                        yPosition = 680;
                    }

                    // Renderizar a linha com destaques aplicados
                    if (options.isShowHighlights()) {
                        List<QuitaHighlightEngine.TextSegment> segments = QuitaHighlightEngine.parseSegments(line, complaint.getInstitution());
                        contentStream.beginText();
                        contentStream.setFont(font, 10.5f);
                        contentStream.newLineAtOffset(leftMargin, yPosition);

                        for (QuitaHighlightEngine.TextSegment seg : segments) {
                            if (seg.isHighlight()) {
                                contentStream.setRenderingMode(RenderingMode.FILL_STROKE);
                                contentStream.setLineWidth(0.2f);
                                contentStream.setNonStrokingColor(15 / 255f, 118 / 255f, 110 / 255f); // Emerald dark (#0f766e)
                                contentStream.setStrokingColor(15 / 255f, 118 / 255f, 110 / 255f);
                            } else {
                                contentStream.setRenderingMode(RenderingMode.FILL);
                                contentStream.setNonStrokingColor(51 / 255f, 65 / 255f, 85 / 255f); // slate-700 (#334155)
                            }
                            contentStream.showText(seg.getText());
                            
                            // Avançar offset da linha para o próximo segmento
                            float segWidth = font.getStringWidth(seg.getText()) / 1000f * 10.5f;
                            contentStream.newLineAtOffset(segWidth, 0);
                        }
                        contentStream.endText();
                    } else {
                        // Sem destaques, desenha texto corrido normal
                        contentStream.beginText();
                        contentStream.setFont(font, 10.5f);
                        contentStream.setNonStrokingColor(51 / 255f, 65 / 255f, 85 / 255f); // slate-700
                        contentStream.newLineAtOffset(leftMargin, yPosition);
                        contentStream.showText(line);
                        contentStream.endText();
                    }

                    yPosition -= leading;
                }

                // Espaço extra entre parágrafos
                yPosition -= 6;
            }

            // 3. Renderizar Selo Editorial se configurado
            if (options.isShowEditorialSeal()) {
                if (yPosition - 45 < bottomLimit) {
                    contentStream.close();
                    page = new PDPage();
                    doc.addPage(page);
                    contentStream = new PDPageContentStream(doc, page);
                    QuitaHeaderRenderer.renderHeader(doc, contentStream, font, complaint, docId);
                    if (options.isShowWatermark()) {
                        QuitaWatermarkGenerator.renderWatermark(doc, contentStream);
                    }
                    yPosition = 680;
                }
                
                yPosition = QuitaEditorialSeal.renderSeal(contentStream, font, leftMargin, yPosition, printableWidth);
            }

            contentStream.close();

            // 4. Segunda passagem para numerar páginas e renderizar rodapé
            if (options.isShowFooter()) {
                QuitaFooterRenderer.renderFooter(doc, font, options.isShowCover());
            }

            // Retorna os bytes do PDF gerado
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
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
