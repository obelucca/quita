package com.quita.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class StartupConfigurationValidator implements BeanFactoryPostProcessor, EnvironmentAware {

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        if (environment == null) {
            log.warn("Environment is null in StartupConfigurationValidator. Skipping validations.");
            return;
        }

        String[] activeProfiles = environment.getActiveProfiles();
        if (Arrays.asList(activeProfiles).contains("prod")) {
            log.info("Production profile detected. Running early configuration hardening validations...");
            validateRequiredEnvironment();
        } else {
            log.info("Non-production profile active. Skipping startup configuration validation.");
        }
    }

    private void validateRequiredEnvironment() {
        boolean hasErrors = false;
        StringBuilder errorReport = new StringBuilder();

        // 1. Validate Database and Security Credentials
        List<String> requiredKeys = List.of(
                "SPRING_DATASOURCE_URL",
                "SPRING_DATASOURCE_USERNAME",
                "SPRING_DATASOURCE_PASSWORD",
                "JWT_SECRET"
        );

        for (String key : requiredKeys) {
            String value = environment.getProperty(key);
            
            // Check both environment key and property representation
            if (value == null || value.trim().isEmpty()) {
                String propKey = convertEnvToProperty(key);
                value = environment.getProperty(propKey);
            }

            if (isInvalidOrPlaceholder(value)) {
                errorReport.append(String.format("\n  - %s: Missing or contains invalid placeholder value.", key));
                hasErrors = true;
            }
        }

        // 2. Validate LLM Configuration
        String provider = environment.getProperty("quita.llm.provider");
        String mockStr = environment.getProperty("quita.llm.mock");
        boolean isMock = mockStr == null || Boolean.parseBoolean(mockStr);

        if ("GEMINI".equalsIgnoreCase(provider) && !isMock) {
            String geminiApiKey = environment.getProperty("GEMINI_API_KEY");
            if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
                geminiApiKey = environment.getProperty("quita.llm.gemini.api-key");
            }

            if (isInvalidOrPlaceholder(geminiApiKey) || geminiApiKey.contains("your_gemini_api_key_here")) {
                errorReport.append("\n  - GEMINI_API_KEY: Required when provider is GEMINI and mock is false.");
                hasErrors = true;
            }
        }

        if (hasErrors) {
            String errorMessage = "\n" +
                    "=======================================================================\n" +
                    "  APPLICATION STARTUP FAILED: Missing Required Environment Variables\n" +
                    "=======================================================================\n" +
                    "  The following configurations are invalid for the 'prod' profile:" +
                    errorReport.toString() + "\n" +
                    "=======================================================================";
            log.error(errorMessage);
            throw new IllegalStateException(errorMessage);
        }

        log.info("Startup configuration validation passed successfully.");
    }

    private boolean isInvalidOrPlaceholder(String value) {
        if (value == null || value.trim().isEmpty()) {
            return true;
        }
        
        List<String> placeholders = List.of(
                "your_",
                "YOUR_",
                "change-me",
                "replace-me",
                "example"
        );

        for (String placeholder : placeholders) {
            if (value.contains(placeholder)) {
                return true;
            }
        }
        
        return false;
    }

    private String convertEnvToProperty(String envKey) {
        return envKey.toLowerCase().replace("_", ".");
    }
}
