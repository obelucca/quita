package com.quita.api.complaint.pdf;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class QuitaHighlightEngine {

    public static class TextSegment {
        private final String text;
        private final boolean highlight;

        public TextSegment(String text, boolean highlight) {
            this.text = text;
            this.highlight = highlight;
        }

        public String getText() {
            return text;
        }

        public boolean isHighlight() {
            return highlight;
        }
    }

    public static List<TextSegment> parseSegments(String text, String institution) {
        List<TextSegment> segments = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return segments;
        }

        // Regex para capturar: nome da instituição, valores monetários (R$ ...), código do documento QT-..., ou "X operações"
        String instEscaped = Pattern.quote(institution);
        String regex = "(" + instEscaped + "|R\\$\\s*\\d+(?:\\.\\d{3})*(?:,\\d{2})?|QT-\\d{8}-[A-Z0-9]{6}|\\b\\d+\\s+operac[oõ]es\\b)";
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);

        int lastIdx = 0;
        while (matcher.find()) {
            if (matcher.start() > lastIdx) {
                segments.add(new TextSegment(text.substring(lastIdx, matcher.start()), false));
            }
            segments.add(new TextSegment(matcher.group(), true));
            lastIdx = matcher.end();
        }
        if (lastIdx < text.length()) {
            segments.add(new TextSegment(text.substring(lastIdx), false));
        }

        return segments;
    }
}
