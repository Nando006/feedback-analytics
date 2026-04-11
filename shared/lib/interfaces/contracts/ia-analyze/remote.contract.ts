import type {
  IaAnalyzeEnterpriseContext,
  IaAnalyzeRemoteBatchInput,
} from './input.contract';
import type { IaAnalyzeSentiment } from './scope.contract';
import type { IaAnalyzeContext } from './analysis.contract';

/**
 * Contratos de integração interna remota entre gateway e serviço IA.
 * Servem para envio de lotes preparados e retorno estruturado da análise.
 */
export interface IaAnalyzeRemoteRunRequest {
  enterprise_context: IaAnalyzeEnterpriseContext;
  batches: IaAnalyzeRemoteBatchInput[];
}

export interface IaAnalyzeRemoteFeedbackAnalysis {
  feedback_id: string;
  sentiment: IaAnalyzeSentiment;
  categories: string[];
  keywords: string[];
}

export interface IaAnalyzeRemoteRunResponse {
  analyses: IaAnalyzeRemoteFeedbackAnalysis[];
  contexts: IaAnalyzeContext[];
}
