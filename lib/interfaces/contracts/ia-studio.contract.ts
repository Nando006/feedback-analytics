/**
 * Escopos aceitos para execução de análise IA.
 * Usado em: Frontend (filtros), gateway e serviço ia-studio
 */
export type IaStudioScopeType = | 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

/**
 * Sentimento padrão retornado pela análise.
 */
export type IaStudioSentiment = 'positive' | 'neutral' | 'negative';

/**
 * Payload para executar analise IA
 * Usado em: POST /api/protected/ia-studio/send-message
 */
export interface IaStudioRunRequest {
  limit?: number;
  scope_type?: IaStudioScopeType;
  catalog_item_id?: string;
}

/**
 * Item de feedback efetivament analisado
 */
export interface IaStudioAnalyzedItem {
  id: string;
  feedback_id: string;
  sentiment: IaStudioSentiment;
  categories: string[];
  keywords: string[];
}

/**
 * Bloco de insights textuais
 */
export interface IaStudioInsights {
  summary?: string;
  recommendations?: string[];
}

/**
 * Contexto de insights por escopo/item
 */
export interface IaStudioContext {
  scope_type: IaStudioScopeType;
  catalog_item_id: string | null;
  catalog_item_name: string | null;
  analyzedCount: number;
  globalInsights: IaStudioInsights | null
}

/**
 * Resposta da execução de analise IA.
 */
export interface IaStudioRunResponse {
  analyzedCount: number;
  feedbacksAnalyzed: IaStudioAnalyzedItem[];
  globalInsights: IaStudioInsights | null;
  contexts: IaStudioContext[];
}

/**
 * Erro padrão de contrato da API de IA
 */
export interface IaStudioRunErrorResponse {
  error: string;
  message?: string;
  issues?: unknown;
}