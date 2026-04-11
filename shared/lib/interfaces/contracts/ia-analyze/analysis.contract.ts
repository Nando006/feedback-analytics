import type {
  IaAnalyzeScopeType,
  IaAnalyzeSentiment,
} from './scope.contract';

/**
 * Contratos de saída semântica da análise IA.
 * Servem para representar itens analisados, insights e contexto agregado.
 */
export interface IaAnalyzeAnalyzedItem {
  id: string;
  feedback_id: string;
  sentiment: IaAnalyzeSentiment;
  categories: string[];
  keywords: string[];
}

export interface IaAnalyzeInsights {
  summary?: string;
  recommendations?: string[];
}

export interface IaAnalyzeContext {
  scope_type: IaAnalyzeScopeType;
  catalog_item_id: string | null;
  catalog_item_name: string | null;
  analyzedCount: number;
  globalInsights: IaAnalyzeInsights | null;
}
