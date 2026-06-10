package com.quita.api.complaint.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintHistoryResponse {

    private UUID id;
    private String institution;
    private String title;
    private Integer version;
    private LocalDateTime createdAt;
}
