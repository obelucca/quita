package com.quita.api.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreditsResponse {
    private Boolean freeComplaintUsed;
    private Integer availableCredits;
}
