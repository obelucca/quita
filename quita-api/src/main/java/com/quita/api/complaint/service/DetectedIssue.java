package com.quita.api.complaint.service;

public record DetectedIssue(
    RegulatoryIssue issue,
    double confidenceScore,
    String explanation
) {}
