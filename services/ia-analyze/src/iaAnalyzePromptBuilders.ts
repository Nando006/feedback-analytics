import { PROMPT_HEADER } from './prompts/promptHeader.js';
import { getScopeInstructions } from './prompts/scopeInstructions.js';
import type {
  BuildIaPromptByScopeParams,
  PromptExpectedSchema,
} from '../types/iaAnalyzePromptBuilders.types.js';

/**
 * Monta o prompt (texto) que será enviado ao modelo de IA para análise.
 *
 * - Recebe o escopo da análise, contexto da empresa e os feedbacks.
 * - Insere instruções específicas do escopo e um exemplo do esquema esperado
 *   de resposta (para o modelo não alterar as chaves JSON).
 * - Constrói o payload com os feedbacks e sinais de contexto e o anexa
 *   ao prompt final.
 *
 * Retorna uma string pronta para ser usada na chamada à API do modelo.
 */
export function buildIaPromptByScope(params: BuildIaPromptByScopeParams): string {
  const { scopeType, enterpriseContext, feedbacks } = params;

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
    PROMPT_HEADER,
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
