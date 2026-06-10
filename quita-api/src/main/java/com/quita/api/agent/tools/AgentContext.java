package com.quita.api.agent.tools;

import lombok.*;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentContext {
    @Builder.Default
    private Map<String, Object> parameters = new HashMap<>();

    public Object getParameter(String name) {
        return parameters != null ? parameters.get(name) : null;
    }

    public void setParameter(String name, Object value) {
        if (this.parameters == null) {
            this.parameters = new HashMap<>();
        }
        this.parameters.put(name, value);
    }
}
