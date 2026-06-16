import type { IaAnalyzeScopeType } from './scope.contract';
import type {
  IaAnalyzeAnalyzedItem,
  IaAnalyzeContext,
  IaAnalyzeInsights,
} from './analysis.contract';

/**
 * Contratos da API pública de execução de análise IA.
 * Servem para tipar requisição, resposta e erro do endpoint protegido.
 */
export interface IaAnalyzeRunRequest {
  limit?: number;
  scope_type?: IaAnalyzeScopeType;
  catalog_item_id?: string;
}

export interface IaAnalyzeRunResponse {
  analyzedCount: number;
  feedbacksAnalyzed: IaAnalyzeAnalyzedItem[];
  globalInsights: IaAnalyzeInsights | null;
  contexts: IaAnalyzeContext[];
}

export interface IaAnalyzeRunErrorResponse {
  error: string;
  message?: string;
  issues?: unknown;
}

export interface IaAnalyzeRawRunRequest {
  limit?: number;
  scope_type?: IaAnalyzeScopeType;
  catalog_item_id?: string;
}

export interface IaAnalyzeRawRunResponse {
  analyzedCount: number;
  feedbacksAnalyzed: IaAnalyzeAnalyzedItem[];
}

export interface IaAnalyzeRegenerateInsightsRequest {
  scope_type?: IaAnalyzeScopeType;
  catalog_item_id?: string;
}

export interface IaAnalyzeRegenerateInsightsResponse {
  globalInsights: IaAnalyzeInsights | null;
  contexts: IaAnalyzeContext[];
  /**
   * `true` somente quando um relatório foi DE FATO persistido para o escopo
   * pedido (escopo informado: existe relatório salvo para scope_type+item;
   * sem escopo: ao menos um relatório foi salvo). Evita o "falso sucesso":
   * permite ao front avisar honestamente quando nada foi gerado (ex.: escopo
   * sem feedbacks com texto analisados suficientes).
   */
  reportGenerated: boolean;
}
