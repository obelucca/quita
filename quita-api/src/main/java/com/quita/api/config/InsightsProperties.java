package com.quita.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Configuration
@ConfigurationProperties(prefix = "quita.insights")
@Getter
@Setter
public class InsightsProperties {
    private BigDecimal highDebtThreshold = new BigDecimal("10000.00");
}
