package com.quita.api.agent.tools;

import com.quita.api.complaint.dto.ComplaintGenerationRequest;
import com.quita.api.complaint.dto.ComplaintResponse;
import com.quita.api.complaint.service.ComplaintGenerationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComplaintGeneratorToolTest {

    @Mock
    private ComplaintGenerationService complaintGenerationService;

    @InjectMocks
    private ComplaintGeneratorTool tool;

    private UUID userId;
    private String institution;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        institution = "Nubank";
    }

    @Test
    void shouldExecuteToolSuccessfully() {
        AgentContext context = new AgentContext();
        context.setParameter("userId", userId);
        context.setParameter("institution", institution);
        context.setParameter("currentDebtValue", 1200.50);

        ComplaintResponse response = ComplaintResponse.builder()
                .id(UUID.randomUUID())
                .institution(institution)
                .complaint("Reclamação gerada")
                .build();

        when(complaintGenerationService.generate(eq(userId), any(ComplaintGenerationRequest.class), eq(false)))
                .thenReturn(response);

        ToolResult result = tool.execute(context);

        assertTrue(result.isSuccess());
        assertEquals("Successfully generated complaint", result.getMessage());
        assertEquals(response, result.getData());
    }

    @Test
    void shouldReturnFailureWhenRequiredParametersAreMissing() {
        AgentContext context = new AgentContext();

        // Missing userId
        ToolResult result = tool.execute(context);
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Missing required parameter: userId"));

        // Missing institution
        context.setParameter("userId", userId);
        result = tool.execute(context);
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Missing required parameter: institution"));
    }

    @Test
    void shouldReturnFailureWhenLLMThrowsException() {
        AgentContext context = new AgentContext();
        context.setParameter("userId", userId);
        context.setParameter("institution", institution);

        when(complaintGenerationService.generate(eq(userId), any(ComplaintGenerationRequest.class), eq(false)))
                .thenThrow(new RuntimeException("LLM integration timeout error"));

        ToolResult result = tool.execute(context);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Failed to generate complaint: LLM integration timeout error"));
    }
}
