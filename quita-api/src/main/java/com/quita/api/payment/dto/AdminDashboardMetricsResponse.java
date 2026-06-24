package com.quita.api.payment.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class AdminDashboardMetricsResponse {
    BigDecimal totalRevenue;
    long approvedCount;
    long pendingCount;
    long failedCount;
}
