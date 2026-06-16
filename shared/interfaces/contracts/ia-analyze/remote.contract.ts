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

/**
 * Análise de UM aspecto (ABSA) extraído do texto do feedback.
 * `sentiment_score` é a intensidade graduada em [-1, 1] (opcional).
 */
export interface AspectAnalysis {
  aspect: string;
  sentiment: IaAnalyzeSentiment;
  sentiment_score?: number;
}

export interface IaAnalyzeRemoteFeedbackAnalysis {
  feedback_id: string;
  sentiment: IaAnalyzeSentiment;
  categories: string[];
  keywords: string[];
  /** Intensidade graduada do sentimento geral em [-1, 1] (opcional). */
  sentiment_score?: number;
  /** Confiança da classificação em [0, 1] (opcional). */
  confidence?: number;
  /** Sentimento por aspecto (ABSA), extraído do texto (opcional). */
  aspects?: AspectAnalysis[];
}

export interface IaAnalyzeRemoteRunResponse {
  analyses: IaAnalyzeRemoteFeedbackAnalysis[];
  contexts: IaAnalyzeContext[];
}
