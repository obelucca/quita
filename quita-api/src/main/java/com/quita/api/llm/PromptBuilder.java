package com.quita.api.llm;

import com.quita.api.debt.model.Debt;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class PromptBuilder {

    public static final String BASE_TEMPLATE =
            "Prezada Ouvidoria,\n\n" +
            "Eu, na qualidade de cliente/consumidor desta instituição, venho por meio desta solicitar esclarecimentos detalhados a respeito de minhas operações de crédito registradas em seu sistema.\n\n" +
            "Verifiquei junto ao relatório Registrato do Banco Central a existência de débitos em meu nome associados a esta instituição. Solicito:\n" +
            "1. A revisão detalhada das condições contratuais das referidas operações;\n" +
            "2. O envio da memória de cálculo detalhada da evolução do saldo devedor, discriminando taxas de juros, encargos, multas e amortizações aplicadas;\n" +
            "3. Resposta formal e por escrito no prazo legal.\n\n" +
            "Aguardo retorno para fins de negociação amigável.";

    public String buildPrompt(String institution, List<Debt> debts, BigDecimal currentDebtValue) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Você é um assistente do Quita especializado em defesa do consumidor.\n");
        prompt.append("Sua tarefa é aprimorar a redação de uma reclamação formal contra a instituição financeira: ").append(institution).append(".\n\n");

        prompt.append("INFORMAÇÕES FORNECIDAS:\n");
        prompt.append("- Quantidade de operações no Registrato: ").append(debts.size()).append("\n");

        if (!debts.isEmpty()) {
            BigDecimal totalAmount = debts.stream()
                    .map(d -> d.getReportedValue() != null ? d.getReportedValue() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            prompt.append("- Valor total das dívidas no Registrato: R$ ").append(totalAmount).append("\n");
        }

        if (currentDebtValue != null) {
            prompt.append("- Valor atualizado cobrado pela instituição (informado pelo consumidor): R$ ").append(currentDebtValue).append("\n");
        } else {
            prompt.append("- Valor atualizado cobrado: Não informado pelo consumidor\n");
        }

        prompt.append("\nDIRETRIZES DE CONDUÇÃO (GUARDRAILS OBRIGATÓRIOS):\n");
        prompt.append("1. Aprimore o texto utilizando estritamente os dados fornecidos acima. Não invente outros valores, operações ou fatos adicionais.\n");
        prompt.append("2. NUNCA classifique os valores cobrados como excessivos ou desconformes com a lei (evite utilizar as palavras a-b-u-s-i-v-o, a-b-u-s-i-v-o-s, a-b-u-s-i-v-i-d-a-d-e, ou i-l-e-g-a-l).\n");
        prompt.append("3. Em vez disso, relate que 'Houve evolução relevante do débito' e solicite que a instituição forneça a 'memória de cálculo detalhada' do saldo devedor.\n");
        prompt.append("4. Não mencione leis específicas, artigos ou normas regulamentares que não tenham sido informados.\n");
        prompt.append("5. Mantenha uma linguagem estritamente formal, polida, respeitosa e orientada à solução consensual do problema.\n");
        prompt.append("6. Não emita pareceres jurídicos ou opiniões legais.\n\n");

        prompt.append("TEMPLATE BASE PARA APRIMORAR:\n");
        prompt.append(BASE_TEMPLATE).append("\n\n");

        prompt.append("Escreva o texto final aprimorado da reclamação baseado no template e nas informações.");
        return prompt.toString();
    }
}
