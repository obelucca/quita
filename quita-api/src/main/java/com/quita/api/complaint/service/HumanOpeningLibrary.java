package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class HumanOpeningLibrary {

    private final Map<String, List<String>> openingsByProfile;
    private final List<String> defaultOpenings;

    public HumanOpeningLibrary() {
        openingsByProfile = new HashMap<>();

        openingsByProfile.put("PROFILE_BALANCE_DIVERGENCE", Arrays.asList(
            "Ao revisar os apontamentos constantes em meu relatório Registrato, chamou minha atenção a diferença significativa entre o saldo originalmente registrado e o valor atualmente informado pela instituição.",
            "A evolução do débito relacionado a esta operação apresentou variação relevante ao longo do período, sem que eu disponha de documentação suficiente para compreender os fatores que contribuíram para esse resultado.",
            "O histórico financeiro vinculado a esta obrigação desperta dúvidas objetivas quanto à composição do saldo atualmente exigido."
        ));

        openingsByProfile.put("PROFILE_NO_ACTIVE_OPERATION", Arrays.asList(
            "Embora não mantenha conhecimento de obrigação ativa vinculada a esta instituição, identifiquei registros cuja origem demanda esclarecimentos adicionais.",
            "A existência dos apontamentos encontrados no relatório oficial exige confirmação detalhada acerca de sua natureza e fundamento."
        ));

        openingsByProfile.put("PROFILE_ASSIGNED_DEBT", Arrays.asList(
            "A transferência da titularidade da obrigação registrada impõe a necessidade de compreender como se deu a sucessão das informações financeiras.",
            "Os registros atualmente disponíveis não permitem compreender integralmente a trajetória da obrigação após a cessão realizada."
        ));

        defaultOpenings = Arrays.asList(
            "Ao analisar os registros consolidados no relatório oficial de informações de crédito do Banco Central, identifiquei apontamentos que demandam esclarecimentos pontuais.",
            "Com o objetivo de verificar a regularidade das informações mantidas em meu nome, apresento questionamentos acerca dos lançamentos associados a esta instituição."
        );
    }

    public List<String> getOpenings(String profile) {
        List<String> result = openingsByProfile.get(profile);
        if (result == null || result.isEmpty()) {
            return defaultOpenings;
        }
        return result;
    }

    public String selectOpening(String profile, String seed) {
        List<String> list = getOpenings(profile);
        int index = Math.abs((seed != null ? seed : "").hashCode()) % list.size();
        return list.get(index);
    }
}
