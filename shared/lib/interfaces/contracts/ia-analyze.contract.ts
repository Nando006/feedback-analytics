/**
 * Escopos aceitos para execução de análise IA.
 * Usado em: Frontend (filtros), gateway e serviço ia-analyze
 */
export type IaAnalyzeScopeType =
  | 'COMPANY'
  | 'PRODUCT'
  | 'SERVICE'
  | 'DEPARTMENT';

/**
 * Sentimento padrão retornado pela análise.
 */
export type IaAnalyzeSentiment = 'positive' | 'neutral' | 'negative';

/**
 * Payload para executar analise IA
 * Usado em: POST /api/protected/ia-analyze/send-message
 */
export interface IaAnalyzeRunRequest {
  limit?: number;
  scope_type?: IaAnalyzeScopeType;
  catalog_item_id?: string;
}

/**
 * Contexto de negócio para montar prompts no serviço de IA.
 */
export interface IaAnalyzeEnterpriseContext {
  enterprise_name: string | null;
  company_objective: string | null;
  analytics_goal: string | null;
  business_summary: string | null;
  main_products_or_services: string[] | null;
}

export interface IaAnalyzeDynamicAnswer {
  question_id: string;
  question_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
}

export interface IaAnalyzeDynamicSubanswer {
  subquestion_id: string;
  subquestion_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
}

export interface IaAnalyzeFeedbackInput {
  id: string;
  message: string;
  rating: number | null;
  created_at: string | null;
  scope_type: IaAnalyzeScopeType;
  collection_point: {
    id: string | null;
    name: string | null;
    type: string | null;
    identifier: string | null;
  } | null;
  catalog_item: {
    id: string;
    name: string;
    kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
    description: string | null;
  } | null;
  dynamic_answers: IaAnalyzeDynamicAnswer[];
  dynamic_subanswers: IaAnalyzeDynamicSubanswer[];
}

export interface IaAnalyzeRemoteBatchInput {
  scope_type: IaAnalyzeScopeType;
  catalog_item_id: string | null;
  catalog_item_name: string | null;
  feedbacks: IaAnalyzeFeedbackInput[];
}

/**
 * Payload interno entre gateway e serviço remoto de IA.
 * O gateway prepara contexto e dados do banco; o serviço só analisa.
 */
export interface IaAnalyzeRemoteRunRequest {
  enterprise_context: IaAnalyzeEnterpriseContext;
  batches: IaAnalyzeRemoteBatchInput[];
}

/**
 * Item de feedback efetivament analisado
 */
export interface IaAnalyzeAnalyzedItem {
  id: string;
  feedback_id: string;
  sentiment: IaAnalyzeSentiment;
  categories: string[];
  keywords: string[];
}

/**
 * Bloco de insights textuais
 */
export interface IaAnalyzeInsights {
  summary?: string;
  recommendations?: string[];
}

/**
 * Contexto de insights por escopo/item
 */
export interface IaAnalyzeContext {
  scope_type: IaAnalyzeScopeType;
  catalog_item_id: string | null;
  catalog_item_name: string | null;
  analyzedCount: number;
  globalInsights: IaAnalyzeInsights | null;
}

export interface IaAnalyzeRemoteFeedbackAnalysis {
  feedback_id: string;
  sentiment: IaAnalyzeSentiment;
  categories: string[];
  keywords: string[];
}

/**
 * Resposta do serviço interno de IA para o gateway.
 */
export interface IaAnalyzeRemoteRunResponse {
  analyses: IaAnalyzeRemoteFeedbackAnalysis[];
  contexts: IaAnalyzeContext[];
}

/**
 * Resposta da execução de analise IA.
 */
export interface IaAnalyzeRunResponse {
  analyzedCount: number;
  feedbacksAnalyzed: IaAnalyzeAnalyzedItem[];
  globalInsights: IaAnalyzeInsights | null;
  contexts: IaAnalyzeContext[];
}

/**
 * Erro padrão de contrato da API de IA
 */
export interface IaAnalyzeRunErrorResponse {
  error: string;
  message?: string;
  issues?: unknown;
}