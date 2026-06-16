package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class RegulatoryLegitimacyEngine {

    private final Map<String, List<String>> justificationsByProfile;
    private final List<String> defaultJustifications;

    public RegulatoryLegitimacyEngine() {
        justificationsByProfile = new HashMap<>();

        justificationsByProfile.put("PROFILE_BALANCE_DIVERGENCE", Arrays.asList(
            "O acesso a essas informações é indispensável para compreender adequadamente a composição da obrigação registrada, avaliar sua evolução ao longo do tempo e adotar eventual medida de regularização de forma consciente e responsável.",
            "Sem tais elementos, torna-se inviável analisar alternativas de composição ou verificar a correspondência entre os registros apresentados e a evolução efetiva da obrigação."
        ));

        defaultJustifications = Arrays.asList(
            "A documentação solicitada e o detalhamento contábil são necessários para resguardar a transparência e possibilitar uma análise responsável da relação mantida com esta instituição.",
            "Sem tais esclarecimentos e a respectiva comprovação documental, inviabiliza-se o correto acompanhamento da trajetória da obrigação financeira e a pactuação de eventual regularização de boa-fé."
        );
    }

    public List<String> getJustifications(String profile) {
        List<String> result = justificationsByProfile.get(profile);
        if (result == null || result.isEmpty()) {
            return defaultJustifications;
        }
        return result;
    }

    public String selectJustification(String profile, String seed) {
        List<String> list = getJustifications(profile);
        int index = Math.abs((seed != null ? seed : "").hashCode()) % list.size();
        return list.get(index);
    }
}
