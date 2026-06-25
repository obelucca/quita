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
public class RecentComplaintCheckResponse {
    private boolean exists;
    private UUID complaintId;
    private LocalDateTime createdAt;
}
