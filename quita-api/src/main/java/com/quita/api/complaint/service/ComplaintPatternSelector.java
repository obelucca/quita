package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class ComplaintPatternSelector {

    private final ComplaintPatternLibrary patternLibrary;

    public ComplaintPatternSelector(ComplaintPatternLibrary patternLibrary) {
        this.patternLibrary = patternLibrary;
    }

    public ComplaintPattern selectPattern(UUID userId, RegulatoryCaseContext context) {
        return selectPattern(userId, context, 1);
    }

    public ComplaintPattern selectPattern(UUID userId, RegulatoryCaseContext context, int version) {
        List<ComplaintPattern> eligible = patternLibrary.getAllPatterns().stream()
                .filter(p -> p.applicableProfiles().contains(context.getProfile()))
                .collect(Collectors.toList());

        if (eligible.isEmpty()) {
            return patternLibrary.getAllPatterns().stream()
                    .filter(p -> "PATTERN_CLARIFICATION".equals(p.id()))
                    .findFirst()
                    .orElse(patternLibrary.getAllPatterns().get(0));
        }

        int index = Math.abs(userId.hashCode() + version) % eligible.size();
        return eligible.get(index);
    }
}
