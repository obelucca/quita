package com.quita.api.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class LLMConfig {

    @Value("${quita.llm.provider:GEMINI}")
    private String provider;

    @Bean
    @Primary
    public LLMClient llmClient(
            OpenAIClient openAIClient,
            GeminiClient geminiClient,
            OllamaClient ollamaClient) {
        if ("OPENAI".equalsIgnoreCase(provider)) {
            return openAIClient;
        } else if ("OLLAMA".equalsIgnoreCase(provider)) {
            return ollamaClient;
        } else {
            return geminiClient;
        }
    }
}
