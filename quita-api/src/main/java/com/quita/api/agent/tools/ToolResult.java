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
}
