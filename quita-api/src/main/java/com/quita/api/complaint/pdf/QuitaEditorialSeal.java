package com.quita.api.complaint.pdf;

import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.util.Matrix;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class QuitaEditorialSeal {

    public static float renderSeal(PDPageContentStream contentStream, PDType0Font font, float x, float y, float width) throws IOException {
        float currentY = y - 15;

        // 1. Linha divisória fina
        contentStream.saveGraphicsState();
        contentStream.setStrokingColor(226 / 255f, 232 / 255f, 240 / 255f); // slate-200
        contentStream.setLineWidth(0.6f);
        contentStream.moveTo(x, currentY);
        contentStream.lineTo(x + width, currentY);
        contentStream.stroke();
        contentStream.restoreGraphicsState();

        currentY -= 15;

        // 2. Texto do Selo Editorial (Em itálico falso, cinza escuro, menor)
        String sealText = "Documento elaborado a partir das informações disponibilizadas pelo usuário e dos registros financeiros analisados para fins de esclarecimento administrativo.";
        List<String> wrappedLines = wrapText(sealText, font, 7.5f, width);

        for (String line : wrappedLines) {
            contentStream.beginText();
            contentStream.setFont(font, 7.5f);
            contentStream.setNonStrokingColor(100 / 255f, 116 / 255f, 139 / 255f); // slate-500
            
            // Inclinação de 0.2f para simular itálico
            Matrix italicMatrix = new Matrix(1f, 0f, 0.18f, 1f, x, currentY);
            contentStream.setTextMatrix(italicMatrix);
            
            contentStream.showText(line);
            contentStream.endText();
            
            currentY -= 11;
        }

        return currentY;
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
