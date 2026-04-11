import type {
  IaAnalyzeEnterpriseContext,
  IaAnalyzeFeedbackInput,
} from '../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeScopeType } from '../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

/**
 * Tipos do construtor de prompts do dominio ia-analyze.
 * Centraliza contratos do payload enviado ao modelo e do schema esperado no retorno.
 */

/**
 * Parametros de entrada do builder de prompt por escopo.
 * Serve para tipar contexto de negocio e lote de feedbacks.
 */
export type BuildIaPromptByScopeParams = {
  scopeType: IaAnalyzeScopeType;
  enterpriseContext: IaAnalyzeEnterpriseContext;
  feedbacks: IaAnalyzeFeedbackInput[];
};

/**
 * Estrutura esperada de analise individual de feedback no exemplo do prompt.
 * Serve para orientar o modelo sobre o formato minimo de cada item retornado.
 */
export type PromptExpectedFeedbackItem = {
  feedback_id: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: string[];
  keywords: string[];
};

/**
 * Estrutura esperada de insights globais no exemplo do prompt.
 * Serve para induzir respostas com resumo e recomendacoes acionaveis.
 */
export type PromptExpectedGlobalInsights = {
  summary?: string;
  recommendations?: string[];
};

/**
 * Schema completo de exemplo que o prompt pede como resposta.
 * Serve para manter consistencia entre feedbacks analisados e insights globais.
 */
export type PromptExpectedSchema = {
  feedbacks: PromptExpectedFeedbackItem[];
  global_insights: PromptExpectedGlobalInsights;
};

/**
 * Mapa de instrucoes especificas por tipo de escopo.
 * Serve para reforcar foco semantico da analise de acordo com o dominio.
 */
export type ScopeInstructionsByType = Record<IaAnalyzeScopeType, string[]>;
