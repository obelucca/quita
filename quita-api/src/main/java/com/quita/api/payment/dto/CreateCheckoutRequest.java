package com.quita.api.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCheckoutRequest {
    @NotBlank(message = "O ID do pacote é obrigatório.")
    private String packageId; // STARTER, INTERMEDIATE, PREMIUM
}
