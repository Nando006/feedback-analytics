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
