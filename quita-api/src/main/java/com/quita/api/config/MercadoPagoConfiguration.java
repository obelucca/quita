package com.quita.api.config;

import com.mercadopago.MercadoPagoConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class MercadoPagoConfiguration {

    @Value("${app.mercadopago.access-token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        if (accessToken != null && !accessToken.trim().isEmpty() && !accessToken.startsWith("TEST-XXXX")) {
            MercadoPagoConfig.setAccessToken(accessToken);
        } else {
            // Configura um token fake padrão caso não esteja preenchido para evitar que o SDK falhe ao carregar
            MercadoPagoConfig.setAccessToken("TEST-5847164917548239-061911-30c00d5a3f3b92f75d691e92d9d1c9ef-12345678");
        }
    }
}
