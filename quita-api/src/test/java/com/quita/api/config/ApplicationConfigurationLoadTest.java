package com.quita.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("local")
class ApplicationConfigurationLoadTest {

    @Test
    void contextLoads() {
        // Verifies that the Spring Boot application context and configuration files 
        // load successfully under the local profile.
    }

}
