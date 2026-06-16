package com.quita.api.complaint.service;

import java.util.List;

public record ComplaintPattern(
    String id,
    String title,
    String tone,
    List<String> applicableProfiles,
    List<String> openingExamples,
    String narrativeInstructions,
    List<String> closingExamples
) {}
