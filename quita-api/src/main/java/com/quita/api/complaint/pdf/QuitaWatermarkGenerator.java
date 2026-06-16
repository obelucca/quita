package com.quita.api.complaint.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.util.Matrix;

import java.io.IOException;

public class QuitaWatermarkGenerator {

    public static void renderWatermark(PDDocument doc, PDPageContentStream contentStream) throws IOException {
        // Salvar estado inicial (com opacidade 100% e matriz identidade)
        contentStream.saveGraphicsState();

        // Opacidade 6%
        PDExtendedGraphicsState gs = new PDExtendedGraphicsState();
        gs.setNonStrokingAlphaConstant(0.06f);
        gs.setStrokingAlphaConstant(0.06f);
        contentStream.setGraphicsStateParameters(gs);

        // Cor Emerald 500 (#10b981)
        contentStream.setNonStrokingColor(16 / 255f, 185 / 255f, 129 / 255f);
        contentStream.setStrokingColor(16 / 255f, 185 / 255f, 129 / 255f);

        // aplicar rotação de -30 graus no centro da página (306, 396)
        contentStream.transform(Matrix.getRotateInstance(Math.toRadians(-30), 306, 396));

        float cx = 306;
        float cy = 396;
        float r = 55f;

        // 1. Desenhar a letra Q minimalista (círculo)
        contentStream.setLineWidth(4.5f);
        drawCircle(contentStream, cx, cy, r, false);
        
        // Cauda do Q
        contentStream.moveTo(cx + 15, cy - 15);
        contentStream.lineTo(cx + r + 15, cy - r - 15);
        contentStream.stroke();

        // 2. Linha contínua atravessando o interior do Q
        contentStream.setLineWidth(1.5f);
        contentStream.moveTo(cx - 180, cy + 90);
        contentStream.lineTo(cx + 180, cy - 90);
        contentStream.stroke();

        // 3. Pequenos pontos conectados
        drawCircle(contentStream, cx - 120, cy + 60, 4.5f, true);
        drawCircle(contentStream, cx - 60, cy + 30, 4.5f, true);
        drawCircle(contentStream, cx + 60, cy - 30, 4.5f, true);
        drawCircle(contentStream, cx + 120, cy - 60, 4.5f, true);

        // Restaurar estado gráfico inicial (revertendo opacidade, rotação, etc.)
        contentStream.restoreGraphicsState();
    }

    private static void drawCircle(PDPageContentStream contentStream, float x, float y, float r, boolean fill) throws IOException {
        float k = 0.552284749831f; // Bezier constant
        contentStream.moveTo(x - r, y);
        contentStream.curveTo(x - r, y + r * k, x - r * k, y + r, x, y + r);
        contentStream.curveTo(x + r * k, y + r, x + r, y + r * k, x + r, y);
        contentStream.curveTo(x + r, y - r * k, x + r * k, y - r, x, y - r);
        contentStream.curveTo(x - r * k, y - r, x - r, y - r * k, x - r, y);
        if (fill) {
            contentStream.fill();
        } else {
            contentStream.stroke();
        }
    }
}
