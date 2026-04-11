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
 * Payload interno entre gateway e serviço remoto de IA.
 */
export interface IaAnalyzeRemoteRunRequest {
  user_id: string;
  options?: IaAnalyzeRunRequest;
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