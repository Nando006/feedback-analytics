/**
 * Construtores de prompt do dominio ia-analyze.
 * Define instrucoes por escopo e monta o payload textual enviado ao modelo,
 * buscando respostas JSON consistentes para o pipeline de analise.
 */

import type { IaAnalyzeScopeType } from '../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import type {
  BuildIaPromptByScopeParams,
  PromptExpectedSchema,
  ScopeInstructionsByType,
} from '../types/iaAnalyzePromptBuilders.types.js';

/**
 * Retorna instrucoes especificas por escopo de analise.
 * Serve para guiar o modelo conforme contexto de empresa, produto, servico ou departamento.
 */
function getScopeInstructions(scopeType: IaAnalyzeScopeType) {
  const instructionsByScope: ScopeInstructionsByType = {
    COMPANY: [
      'Contexto: feedbacks gerais da empresa (visao ampla da experiencia).',
      'Priorize categorias como atendimento, comunicacao, preco, ambiente, experiencia geral e confianca.',
      'Considere respostas dinamicas apenas como sinal auxiliar de polaridade, sem copiar rotulos para categorias/keywords.',
    ],
    PRODUCT: [
      'Contexto: feedbacks de produto especifico.',
      'Priorize categorias como qualidade, durabilidade, custo-beneficio, funcionalidades e embalagem.',
      'Use o nome/descricao do produto e respostas dinamicas apenas para enriquecer contexto da analise textual.',
    ],
    SERVICE: [
      'Contexto: feedbacks de servico especifico.',
      'Priorize categorias como tempo de resposta, eficiencia, cordialidade, clareza e resolucao de problemas.',
      'Considere respostas dinamicas apenas para apoiar inferencias do texto, sem virar palavras-chave literais.',
    ],
    DEPARTMENT: [
      'Contexto: feedbacks de departamento/setor especifico.',
      'Priorize categorias como processo interno, comunicacao da equipe, agilidade e qualidade da interacao.',
      'Use respostas dinamicas para apoiar recomendacoes praticas, mas extraia termos prioritariamente da descricao.',
    ],
  };

  return instructionsByScope[scopeType];
}

/**
 * Monta o prompt final enviado ao modelo com contexto e schema esperado.
 * Serve para padronizar a resposta da IA e reduzir variacao de formato.
 */
export function buildIaPromptByScope(params: BuildIaPromptByScopeParams): string {
  const { scopeType, enterpriseContext, feedbacks } = params;

  const header = `Voce e uma IA especialista em analise de feedbacks de clientes para empresas.
Seu objetivo e:
- Entender o contexto e os objetivos da empresa.
- Analisar cada feedback individualmente.
- Classificar o sentimento de cada feedback (positive, neutral, negative).
- Categorizar o tema principal do feedback em poucas categorias de negocio.
- Extrair palavras-chave importantes do texto.
- Gerar insights acionaveis para ajudar a empresa a melhorar.

Regras IMPORTANTES:
- Responda SEMPRE em JSON valido.
- Nao inclua comentarios, texto fora do JSON ou explicacoes adicionais.
- Use apenas os valores 'positive', 'neutral' ou 'negative' em "sentiment".
- Em "categories" e "keywords", use arrays de strings curtas (ex.: ["atendimento", "preco"]).
- A fonte principal para categories/keywords e EXCLUSIVAMENTE o campo "message" do feedback.
- Campos estruturados (rating, dynamic_answers, dynamic_subanswers, catalog_item) sao contexto auxiliar e NAO podem ser copiados literalmente.
- NAO use termos como "pessimo", "ruim", "mediana", "boa" ou "otima" como keywords/categorias.
- NAO copie texto das perguntas ou subperguntas dinamicas como keywords/categorias.
- Se o texto for curto, prefira poucos termos relevantes e evidentes no proprio message.

Regras de SENTIMENTO (siga esta hierarquia):
1. O campo "dynamic_answers" e "dynamic_subanswers" sao o SINAL PRIMARIO de sentimento: cada item contem "question" (contexto da pergunta), "score" (nota de 1 a 5) e "label" (rotulo textual). Analise cada resposta no contexto da sua pergunta para determinar a polaridade real do cliente em cada aspecto avaliado.
2. Se a maioria das respostas dinamicas tiver score <= 2, classifique como 'negative'. Se a maioria tiver score >= 4, classifique como 'positive'. Scores intermediarios ou mistos indicam 'neutral'.
3. O campo "rating" (nota geral de estrelas) e apenas um sinal de VALIDACAO SECUNDARIA. Use-o para desempatar quando os scores dinamicos forem muito heterogeneos, nunca como unico determinante.
4. O campo "message" pode confirmar ou contradizer os scores dinamicos. Contradições explicitas no texto (ex: nota alta mas critica severa no message) devem ser consideradas.
5. Se nao houver dynamic_answers, use o "message" como sinal primario e o "rating" como sinal secundario.`;

  const scopeInstructions = getScopeInstructions(scopeType);

  const expectedSchemaExample: PromptExpectedSchema = {
    feedbacks: [
      {
        feedback_id: 'uuid-do-feedback',
        sentiment: 'positive',
        categories: ['atendimento', 'experiencia'],
        keywords: ['agilidade', 'cordialidade'],
      },
    ],
    global_insights: {
      summary:
        'Resumo geral dos principais padroes encontrados nos feedbacks, em poucas frases.',
      recommendations: [
        'Sugestao objetiva 1 para melhorar a experiencia.',
        'Sugestao objetiva 2 para melhorar processos, produto ou atendimento.',
      ],
    },
  };

  const payload = {
    analysis_scope: scopeType,
    enterprise: enterpriseContext,
    feedbacks: feedbacks.map((feedback) => ({
      id: feedback.id,
      created_at: feedback.created_at,
      scope_type: feedback.scope_type,
      message_primary: feedback.message,
      context_signals: {
        rating_star: feedback.rating,
        dynamic_answers: feedback.dynamic_answers.map((a) => ({
          question: a.question_text_snapshot,
          score: a.answer_score,
          label: a.answer_value,
        })),
        dynamic_subanswers: feedback.dynamic_subanswers.map((a) => ({
          question: a.subquestion_text_snapshot,
          score: a.answer_score,
          label: a.answer_value,
        })),
        collection_point: feedback.collection_point,
        catalog_item: feedback.catalog_item,
      },
    })),
  };

  return [
    header,
    '',
    `Escopo atual da analise: ${scopeType}`,
    ...scopeInstructions.map((line) => `- ${line}`),
    '',
    'Estrutura exata de resposta (NAO altere as chaves):',
    JSON.stringify(expectedSchemaExample, null, 2),
    '',
    'Dados de entrada (em JSON):',
    JSON.stringify(payload),
  ].join('\n');
}
