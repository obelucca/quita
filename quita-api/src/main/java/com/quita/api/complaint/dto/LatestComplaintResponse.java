package com.quita.api.complaint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LatestComplaintResponse {
    private UUID id;
    private LocalDateTime createdAt;
    private String status;
    private String bankName;
    private String content;
}
