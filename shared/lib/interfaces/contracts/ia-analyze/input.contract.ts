import type { IaAnalyzeScopeType } from './scope.contract';

/**
 * Contratos de entrada para análise IA.
 * Servem para transportar contexto de empresa e feedbacks brutos para processamento.
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
