package com.quita.api.agent.tools;

import com.quita.api.complaint.dto.ComplaintGenerationRequest;
import com.quita.api.complaint.dto.ComplaintResponse;
import com.quita.api.complaint.service.ComplaintGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ComplaintGeneratorTool implements AgentTool {

    private final ComplaintGenerationService complaintGenerationService;

    @Override
    public String name() {
        return "complaint_generator";
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

        Object institutionObj = context.getParameter("institution");
        if (institutionObj == null) {
            return ToolResult.failure("Missing required parameter: institution");
        }
        String institution = institutionObj.toString();

        BigDecimal currentDebtValue = null;
        Object currentDebtValueObj = context.getParameter("currentDebtValue");
        if (currentDebtValueObj != null) {
            try {
                if (currentDebtValueObj instanceof BigDecimal) {
                    currentDebtValue = (BigDecimal) currentDebtValueObj;
                } else if (currentDebtValueObj instanceof Number) {
                    currentDebtValue = BigDecimal.valueOf(((Number) currentDebtValueObj).doubleValue());
                } else {
                    currentDebtValue = new BigDecimal(currentDebtValueObj.toString());
                }
            } catch (Exception e) {
                return ToolResult.failure("Invalid currentDebtValue format: " + currentDebtValueObj);
            }
        }

        try {
            ComplaintGenerationRequest request = ComplaintGenerationRequest.builder()
                    .institution(institution)
                    .currentDebtValue(currentDebtValue)
                    .build();

            // Run with allowFallback = false so LLM client failure produces a ToolResult.failure
            ComplaintResponse response = complaintGenerationService.generate(userId, request, false);
            return ToolResult.success("Successfully generated complaint", response);
        } catch (Exception e) {
            return ToolResult.failure("Failed to generate complaint: " + e.getMessage());
        }
    }
}
