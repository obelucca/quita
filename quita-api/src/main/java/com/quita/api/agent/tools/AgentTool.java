package com.quita.api.agent.tools;

public interface AgentTool {
    String name();
    ToolResult execute(AgentContext context);
}
