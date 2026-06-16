package com.quita.api.complaint.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

import java.io.IOException;

public class QuitaFooterRenderer {

    public static void renderFooter(PDDocument doc, PDType0Font font, boolean showCover) throws IOException {
        int totalPages = doc.getNumberOfPages();
        
        for (int i = 0; i < totalPages; i++) {
            // Se houver capa e for a primeira página, não renderiza rodapé
            if (showCover && i == 0) {
                continue;
            }

            PDPage page = doc.getPage(i);
            
            // Abre o contentStream em modo APPEND para desenhar por cima do conteúdo existente
            try (PDPageContentStream contentStream = new PDPageContentStream(doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                contentStream.saveGraphicsState();

                // 1. Linha divisória horizontal do rodapé
                contentStream.setStrokingColor(226 / 255f, 232 / 255f, 240 / 255f); // slate-200
                contentStream.setLineWidth(0.8f);
                contentStream.moveTo(54, 52);
                contentStream.lineTo(558, 52);
                contentStream.stroke();

                // 2. Linha 1 do rodapé
                contentStream.beginText();
                contentStream.setFont(font, 7.5f);
                contentStream.setNonStrokingColor(100 / 255f, 116 / 255f, 139 / 255f); // slate-500
                contentStream.newLineAtOffset(54, 40);
                contentStream.showText("Quita — Plataforma de organização e mediação administrativa. | www.quita.com.br");
                contentStream.endText();

                // Número de página "Página X de Y" à direita
                // Se showCover for true, a página i é a página número i (capa é 0 e não conta como página numerada, ou conta? Geralmente a capa não é numerada, então a primeira página de conteúdo é "Página 1 de Y-1")
                int pageNum = showCover ? i : i + 1;
                int totalCount = showCover ? totalPages - 1 : totalPages;
                
                contentStream.beginText();
                contentStream.setFont(font, 7.5f);
                contentStream.setNonStrokingColor(100 / 255f, 116 / 255f, 139 / 255f); // slate-500
                String pageText = String.format("Página %d de %d", pageNum, totalCount);
                float pageTextWidth = font.getStringWidth(pageText) / 1000f * 7.5f;
                contentStream.newLineAtOffset(558 - pageTextWidth, 40);
                contentStream.showText(pageText);
                contentStream.endText();

                // 3. Linha 2 do rodapé (Disclaimer legal administrativo)
                contentStream.beginText();
                contentStream.setFont(font, 6f);
                contentStream.setNonStrokingColor(148 / 255f, 163 / 255f, 184 / 255f); // slate-400
                contentStream.newLineAtOffset(54, 28);
                contentStream.showText("Documento elaborado com base nas informações fornecidas pelo usuário e nos registros identificados no relatório Registrato.");
                contentStream.endText();

                contentStream.restoreGraphicsState();
            }
        }
    }
}
