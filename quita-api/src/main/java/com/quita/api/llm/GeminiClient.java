package com.quita.api.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class GeminiClient implements LLMClient {

    @Value("${quita.llm.mock:true}")
    private boolean mock;

    @Value("${quita.llm.gemini.api-key:}")
    private String apiKey;

    @Value("${quita.llm.gemini.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String generate(String prompt) {
        if (prompt.contains("FAIL_INTEGRATION_TEST")) {
            throw new RuntimeException("Gemini provider error");
        }

        if (mock) {
            return getMockResponse();
        }

        try {
            String urlWithKey = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            Map<String, Object> response = restTemplate.postForObject(urlWithKey, entity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                List<?> candidates = (List<?>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                    if (content != null && content.containsKey("parts")) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (!parts.isEmpty()) {
                            Map<?, ?> part = (Map<?, ?>) parts.get(0);
                            if (part.containsKey("text")) {
                                return part.get("text").toString();
                            }
                        }
                    }
                }
            }
            throw new RuntimeException("Empty response received from Gemini API");
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    private String getMockResponse() {
        return "Prezada Ouvidoria,\n\n" +
                "Eu, na qualidade de cliente/consumidor desta instituição, venho por meio desta solicitar esclarecimentos detalhados a respeito de minhas operações de crédito registradas em seu sistema.\n\n" +
                "Com base em meu relatório Registrato do Banco Central, identifiquei a existência de débitos em meu nome associados a esta instituição. Diante disso, solicito formalmente:\n" +
                "1. A revisão detalhada de todas as condições contratuais aplicadas às referidas operações;\n" +
                "2. O envio imediato da memória de cálculo detalhada com o histórico da evolução do saldo devedor, demonstrando de forma clara as taxas de juros, encargos moratórios, multas e amortizações aplicadas;\n" +
                "3. Resposta formal e por escrito no prazo legal regulamentar.\n\n" +
                "Houve evolução relevante do débito associado a esta conta. Solicito esclarecimentos adicionais e memória de cálculo detalhada.\n\n" +
                "Aguardo retorno para iniciarmos uma negociação amigável.\n\n" +
                "[Versão aprimorada por Inteligência Artificial (GEMINI)]";
    }
}
