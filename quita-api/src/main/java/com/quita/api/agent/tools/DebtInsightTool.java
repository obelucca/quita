package com.quita.api.agent.tools;

import com.quita.api.debt.dto.DebtInsightResponse;
import com.quita.api.debt.service.DebtInsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DebtInsightTool implements AgentTool {

    private final DebtInsightService debtInsightService;

    @Override
    public String name() {
        return "debt_insight";
    }

    @Override
    public ToolResult execute(AgentContext context) {
        if (context == null) {
            return ToolResult.failure("Context cannot be null");
        }

        Object userIdObj = context.getParameter("userId");
        if (userIdObj == null) {
            return ToolResult.failure("Missing required parameter: userId");
        }

        UUID userId;
        try {
            if (userIdObj instanceof UUID) {
                userId = (UUID) userIdObj;
            } else {
                userId = UUID.fromString(userIdObj.toString());
            }
        } catch (IllegalArgumentException e) {
            return ToolResult.failure("Invalid userId format: " + userIdObj);
        }

        try {
            DebtInsightResponse insights = debtInsightService.getInsights(userId);
            return ToolResult.success("Successfully generated debt insights", insights);
        } catch (Exception e) {
            return ToolResult.failure("Failed to generate insights: " + e.getMessage());
        }
    }
}
