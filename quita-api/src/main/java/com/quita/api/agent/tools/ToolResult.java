package com.quita.api.agent.tools;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolResult {
    private boolean success;
    private String message;
    private Object data;

    public static ToolResult success(Object payload) {
        return ToolResult.builder()
                .success(true)
                .message("Success")
                .data(payload)
                .build();
    }

    public static ToolResult success(String message, Object payload) {
        return ToolResult.builder()
                .success(true)
                .message(message)
                .data(payload)
                .build();
    }

    public static ToolResult failure(String message) {
        return ToolResult.builder()
                .success(false)
                .message(message)
                .build();
    }
}
