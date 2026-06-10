package com.quita.api.complaint.dto;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private UUID id;
    private String institution;
    private String title;
    private String complaint;
    private List<String> attachments;
    private boolean editable;
    private String disclaimer;
    private List<ConsumerGovInstruction> consumerGovInstructions;
    private String message;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsumerGovInstruction {
        private int step;
        private String instruction;
    }
}
