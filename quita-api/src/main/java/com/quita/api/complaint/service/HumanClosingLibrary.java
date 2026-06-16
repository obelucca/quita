package com.quita.api.complaint.service;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class HumanClosingLibrary {

    private final List<String> closings;

    public HumanClosingLibrary() {
        closings = Arrays.asList(
            "O recebimento dessas informações permitirá a adequada compreensão da obrigação apontada e contribuirá para a construção de eventual solução administrativa pautada pela transparência e boa-fé negocial.",
            "Permanecerei à disposição para avaliar alternativas de regularização tão logo os esclarecimentos solicitados sejam disponibilizados.",
            "A disponibilização desses elementos permitirá uma análise responsável da situação apresentada e favorecerá a busca de solução consensual."
        );
    }

    public List<String> getClosings() {
        return closings;
    }

    public String selectClosing(String seed) {
        int index = Math.abs((seed != null ? seed : "").hashCode()) % closings.size();
        return closings.get(index);
    }
}
