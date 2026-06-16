package com.quita.api.llm;

import com.quita.api.common.MonetaryFormatter;
import com.quita.api.complaint.service.RegulatoryCaseContext;
import com.quita.api.complaint.service.ComplaintPattern;
import com.quita.api.complaint.service.ComplaintPatternLibrary;
import com.quita.api.complaint.service.ComplaintPatternSelector;
import com.quita.api.complaint.service.NarrativeVariationEngine;
import com.quita.api.complaint.service.HumanComplaintBlueprint;
import com.quita.api.complaint.service.RegulatoryReasoningBuilder;
import com.quita.api.complaint.service.RegulatoryEvidenceBuilder;
import com.quita.api.complaint.service.HumanOpeningLibrary;
import com.quita.api.complaint.service.HumanClosingLibrary;
import com.quita.api.complaint.service.RegulatoryLegitimacyEngine;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class PromptBuilder {

    private final RegulatoryEvidenceBuilder evidenceBuilder;
    private final HumanOpeningLibrary openingLibrary;
    private final HumanClosingLibrary closingLibrary;
    private final RegulatoryLegitimacyEngine legitimacyEngine;

    public PromptBuilder() {
        this.evidenceBuilder = new RegulatoryEvidenceBuilder();
        this.openingLibrary = new HumanOpeningLibrary();
        this.closingLibrary = new HumanClosingLibrary();
        this.legitimacyEngine = new RegulatoryLegitimacyEngine();
    }

    public PromptBuilder(RegulatoryEvidenceBuilder evidenceBuilder) {
        this.evidenceBuilder = evidenceBuilder;
        this.openingLibrary = new HumanOpeningLibrary();
        this.closingLibrary = new HumanClosingLibrary();
        this.legitimacyEngine = new RegulatoryLegitimacyEngine();
    }

    public String buildPrompt(String institution, RegulatoryCaseContext context, BigDecimal currentDebtValue) {
        ComplaintPatternLibrary lib = new ComplaintPatternLibrary();
        ComplaintPatternSelector selector = new ComplaintPatternSelector(lib);
        ComplaintPattern pattern = selector.selectPattern(java.util.UUID.randomUUID(), context);
        
        String seed = java.util.UUID.randomUUID().toString();
        String opening = openingLibrary.selectOpening(context.getProfile(), seed);
        String closing = closingLibrary.selectClosing(seed);
        
        HumanComplaintBlueprint blueprint = new HumanComplaintBlueprint();
        RegulatoryReasoningBuilder reasoningBuilder = new RegulatoryReasoningBuilder();
        List<String> reasonings = reasoningBuilder.buildReasonings(institution, context, currentDebtValue, java.util.Collections.emptyList());
        
        return buildPrompt(institution, context, currentDebtValue, pattern, opening, closing, "", blueprint.getBlueprintInstructions(), reasonings);
    }

    public String buildPrompt(
            String institution,
            RegulatoryCaseContext context,
            BigDecimal currentDebtValue,
            ComplaintPattern pattern,
            String opening,
            String closing,
            String enrichmentText) {
        HumanComplaintBlueprint blueprint = new HumanComplaintBlueprint();
        RegulatoryReasoningBuilder reasoningBuilder = new RegulatoryReasoningBuilder();
        List<String> reasonings = reasoningBuilder.buildReasonings(institution, context, currentDebtValue, java.util.Collections.emptyList());
        return buildPrompt(institution, context, currentDebtValue, pattern, opening, closing, enrichmentText, blueprint.getBlueprintInstructions(), reasonings);
    }

    public String buildPrompt(
            String institution,
            RegulatoryCaseContext context,
            BigDecimal currentDebtValue,
            ComplaintPattern pattern,
            String opening,
            String closing,
            String enrichmentText,
            String blueprintInstructions,
            List<String> reasonings) {
        
        RegulatoryEvidenceBuilder.EvidenceResult evidence = evidenceBuilder.buildEvidence(institution, context, currentDebtValue);
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("Você é um especialista altamente experiente em auditoria e relações regulatórias no setor financeiro brasileiro.\n");
        prompt.append("Sua tarefa é: Redija uma manifestação técnica individualizada baseada exclusivamente nas evidências fornecidas.\n\n");

        prompt.append("EVIDÊNCIAS FÁTICAS OBRIGATÓRIAS:\n");
        for (String fact : evidence.concreteFacts()) {
            prompt.append("- ").append(fact).append("\n");
        }
        
        if (reasonings != null && !reasonings.isEmpty()) {
            prompt.append("\nHIPÓTESES E RACIOCÍNIOS REGULATÓRIOS DO CASO:\n");
            for (String reasoning : reasonings) {
                prompt.append("- ").append(reasoning).append("\n");
            }
        }

        prompt.append("\nESTILOS E REFERÊNCIAS EDITORIAIS DE LEGITIMIDADE E HUMANIZAÇÃO:\n");
        prompt.append("1. Ganchos humanos de introdução para este perfil:\n");
        for (String op : openingLibrary.getOpenings(context.getProfile())) {
            prompt.append("   * \"").append(op).append("\"\n");
        }
        prompt.append("2. Justificativas legítimas de boa-fé para solicitações:\n");
        for (String just : legitimacyEngine.getJustifications(context.getProfile())) {
            prompt.append("   * \"").append(just).append("\"\n");
        }
        prompt.append("3. Encerramentos orientados à solução:\n");
        for (String cl : closingLibrary.getClosings()) {
            prompt.append("   * \"").append(cl).append("\"\n");
        }

        prompt.append("\nESTILO NARRATIVO SELECIONADO: ").append(pattern.title()).append(" (Tom: ").append(pattern.tone()).append(")\n");
        prompt.append("INSTRUÇÃO EDITORIAL ESPECÍFICA:\n").append(pattern.narrativeInstructions()).append("\n");

        if (enrichmentText != null && !enrichmentText.isEmpty()) {
            prompt.append("\nAUDITORIA REGULATÓRIA (ADICIONAL):\n").append(enrichmentText).append("\n");
        }

        String profile = context.getProfile();
        String seed = institution + (profile != null ? profile : "");
        prompt.append("\nESTRUTURA NARRATIVA OBRIGATÓRIA (5 BLOCOS CONTÍNUOS):\n");
        prompt.append("Sua resposta deve seguir implicitamente a estrutura narrativa estruturada em 5 fases/blocos contínuos, sem fazer qualquer menção direta aos nomes dos blocos e sem utilizar numeração ou títulos para eles:\n");
        prompt.append("1. BLOCO 1 (Gancho humano contextual): Introduza a manifestação de forma espontânea e humanizada a partir da revisão de seu relatório Registrato (ex: \"").append(openingLibrary.selectOpening(profile, seed)).append("\").\n");
        prompt.append("2. BLOCO 2 (Descrição fática): Apresente de forma puramente objetiva e precisa os dados da instituição e os valores fáticos de débito encontrados.\n");
        prompt.append("3. BLOCO 3 (Racional de dúvida): Explique de maneira sóbria como a falta de clareza ou a discrepância de valores impede a compreensão da trajetória financeira (ex: \"").append(legitimacyEngine.selectJustification(profile, seed)).append("\").\n");
        prompt.append("4. BLOCO 4 (Pedidos específicos): Formule as perguntas e os pedidos de documentos cabíveis decorrentes da narrativa (como memória de cálculo e cópia de contratos).\n");
        prompt.append("5. BLOCO 5 (Conclusão conciliatória): Finalize a manifestação de forma profissional, reforçando a boa-fé e a busca por solução consensual (ex: \"").append(closingLibrary.selectClosing(seed)).append("\").\n");

        prompt.append("\nDIRETRIZES DE REDAÇÃO E GUARDRAILS (OBRIGATÓRIAS):\n");
        prompt.append("1. OBRIGATORIEDADE DE ABERTURA E FECHAMENTO:\n");
        prompt.append("   - Inicie o texto utilizando OBRIGATORIAMENTE a seguinte abertura: \"").append(opening).append("\"\n");
        prompt.append("   - Encerre o texto utilizando OBRIGATORIAMENTE o seguinte fechamento: \"").append(closing).append("\"\n");
        
        prompt.append("2. NÃO UTILIZE LISTAS:\n");
        prompt.append("   - Escreva o texto de forma contínua e natural. NÃO utilize marcadores, bullets, numerações ou checklists em hipótese alguma.\n");
        
        prompt.append("3. RACIOCÍNIO DE PEDIDO (ENCADEAMENTO LÓGICO):\n");
        prompt.append("   - Para cada pedido ou questionamento formulado, explique implicitamente qual fato fático observado torna aquele pedido necessário.\n");
        prompt.append("   - Exemplo: FATO (há evolução de saldo de R$ X para R$ Y) -> CONSEQUÊNCIA (ausência de demonstrativo contendo juros) -> PEDIDO (solicitação de memória de cálculo).\n");
        
        prompt.append("4. SUBSTITUA PEDIDOS POR QUESTÕES ESPONTÂNEAS:\n");
        prompt.append("   - Não estruture a reclamação como uma petição ou com termos robóticos de 'solicito'. Formule questionamentos legítimos e técnicos.\n");
        
        prompt.append("5. LEI E DIREITO:\n");
        prompt.append("   - NUNCA classifique os valores cobrados como excessivos ou desconformes com a lei de forma direta. É expressamente proibido usar os termos: a-b-u-s-i-v-o, a-b-u-s-i-v-a, a-b-u-s-i-v-o-s, a-b-u-s-i-v-i-d-a-d-e, i-l-e-g-a-l, i-l-e-g-a-l-i-d-a-d-e, f-r-a-u-d-e, m-á - f-é ou v-i-o-l-a-ç-ã-o.\n");
        
        prompt.append("6. ATESTAÇÃO DE LEITURA DOS DADOS:\n");
        prompt.append("   - É OBRIGATÓRIO constar no texto final a identificação clara da instituição financeira (").append(institution).append("), o valor inicial original informado no relatório do Registrato (").append(MonetaryFormatter.formatBRL(evidence.originalAmount())).append(")");
        if (evidence.currentAmount() != null) {
            prompt.append(" e o valor atual cobrado de ").append(MonetaryFormatter.formatBRL(evidence.currentAmount())).append(".\n");
        } else {
            prompt.append(" e a devida menção à evolução do saldo devedor.\n");
        }
        
        prompt.append("7. NATURALIDADE E RESTRIÇÃO DE CLICHÊS:\n");
        prompt.append("   - É EXPRESSAMENTE PROIBIDO utilizar as seguintes expressões genéricas/robóticas:\n");
        prompt.append("     * \"Venho por meio desta\"\n");
        prompt.append("     * \"Na qualidade de consumidor\"\n");
        prompt.append("     * \"Solicito formalmente\"\n");
        prompt.append("     * \"Diante do exposto\"\n");
        prompt.append("     * \"Aguardo providências cabíveis\"\n");
        prompt.append("     * \"Com base no relatório\"\n");
        prompt.append("     * \"Espero que este e-mail\"\n");
        prompt.append("     * \"Gostaria de solicitar\"\n");
        prompt.append("     * \"Prezada Ouvidoria\"\n");
        prompt.append("     * \"Conforme mencionado\"\n");
        
        prompt.append("8. TAMANHO DO TEXTO (CONCISÃO):\n");
        prompt.append("   - A redação final da manifestação técnica deve conter obrigatoriamente entre 450 e 700 palavras.\n");
        
        prompt.append("9. TESTE DA SUBSTITUIÇÃO (AUTO-CRÍTICA):\n");
        prompt.append("   - Antes de concluir o texto, faça a pergunta interna: 'Este texto poderia ser enviado por outro consumidor sem alterações?' Se a resposta for sim, reescreva-o inteiramente para torná-lo individualizado com base nas evidências.\n\n");

        prompt.append("Escreva a manifestação final de forma técnica, fática, e extremamente humana.");
        return prompt.toString();
    }

    public String buildFallbackText(
            String institution,
            RegulatoryCaseContext context,
            BigDecimal currentDebtValue,
            ComplaintPattern pattern,
            String opening,
            String closing) {
        return buildFallbackText(institution, context, currentDebtValue, pattern, opening, closing, 1);
    }

    public String buildFallbackText(
            String institution,
            RegulatoryCaseContext context,
            BigDecimal currentDebtValue,
            ComplaintPattern pattern,
            String opening,
            String closing,
            int version) {
        
        RegulatoryEvidenceBuilder.EvidenceResult evidence = evidenceBuilder.buildEvidence(institution, context, currentDebtValue);
        
        StringBuilder sb = new StringBuilder();
        sb.append(opening).append("\n\n");

        // BLOCO 1 - Constatação Técnica
        sb.append(String.format("Ao consultar o relatório Registrato emitido pelo Banco Central do Brasil, identifiquei registro associado à instituição %s, no qual consta saldo originalmente apontado de %s correspondente a %d operação(ões) ativa(s).\n\n",
                evidence.institution(), MonetaryFormatter.formatBRL(evidence.originalAmount()), evidence.debtCount()));

        // BLOCO 2 - Evolução e Raciocínio
        if (evidence.currentAmount() != null) {
            sb.append(String.format("Atualmente, fui informado de cobrança correspondente ao valor de %s. Entretanto, não disponho dos elementos necessários para compreender quais eventos contratuais justificaram a trajetória financeira entre esses montantes.\n\n",
                    MonetaryFormatter.formatBRL(evidence.currentAmount())));
        } else {
            sb.append("Entretanto, a falta de histórico detalhado da evolução do saldo devedor apontado impede a correta visualização e acompanhamento dos lançamentos efetuados no período.\n\n");
        }

        // BLOCO 3 - Racional de dúvida / Legitimação
        sb.append(legitimacyEngine.selectJustification(context.getProfile(), institution)).append("\n\n");

        // BLOCO 4 - Pedido Técnico Fundamentado
        sb.append("Solicito o encaminhamento da memória de cálculo detalhada da evolução da dívida, contemplando o histórico cronológico do débito, a identificação dos contratos vinculados e o detalhamento de todos os encargos aplicados.\n\n");
        
        if (evidence.hasCedida()) {
            sb.append("Adicionalmente, requeiro o fornecimento da cópia do termo de cessão do crédito correspondente para verificação de legitimidade da operação.\n\n");
        }
        if (evidence.hasNoActiveOperation()) {
            sb.append("Requeiro ainda a disponibilização das vias assinadas dos contratos que originaram os registros citados no relatório SCR do Banco Central.\n\n");
        }

        // BLOCO 5 - Encerramento Conciliatório
        sb.append("Esta manifestação possui caráter estritamente conciliatório e busca reunir os elementos necessários para avaliação adequada da obrigação registrada, favorecendo a construção de solução transparente e consensual.");

        // Adicionando o encerramento do padrão
        sb.append("\n\n").append(closing);
        
        return sb.toString();
    }
}
