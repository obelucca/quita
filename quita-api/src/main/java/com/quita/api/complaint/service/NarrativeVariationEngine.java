package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class NarrativeVariationEngine {

    public String selectOpening(UUID userId, String institution, ComplaintPattern pattern) {
        return selectOpening(userId, institution, pattern, 1);
    }

    public String selectOpening(UUID userId, String institution, ComplaintPattern pattern, int version) {
        if (pattern.openingExamples().isEmpty()) {
            return "Ao consultar as informações registradas...";
        }
        int index = Math.abs((userId.toString() + institution + version).hashCode()) % pattern.openingExamples().size();
        return pattern.openingExamples().get(index);
    }

    public String selectClosing(UUID userId, String institution, ComplaintPattern pattern) {
        return selectClosing(userId, institution, pattern, 1);
    }

    public String selectClosing(UUID userId, String institution, ComplaintPattern pattern, int version) {
        if (pattern.closingExamples().isEmpty()) {
            return "Aguardo manifestação formal.";
        }
        int index = Math.abs((userId.toString() + institution + "closing" + version).hashCode()) % pattern.closingExamples().size();
        return pattern.closingExamples().get(index);
    }
}
