import type {
  IaAnalyzeEnterpriseContext,
  IaAnalyzeFeedbackInput,
} from '../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeScopeType } from '../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import type { IaAnalyzeInsights } from '../../../shared/interfaces/contracts/ia-analyze/analysis.contract.js';
import type { IaAnalyzeRemoteFeedbackAnalysis } from '../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';

/**
 * Tipos do cliente de IA do dominio ia-analyze.
 * Centraliza contratos de entrada, saida e erros da chamada ao modelo.
 */

/**
 * Codigos de erro previstos na comunicacao com o provedor de IA.
 * Serve para padronizar tratamento de falhas no engine.
 */
export type IaApiClientErrorCode = 'failed_ia_request' | 'invalid_ai_response';

/**
 * Shape parseado da resposta da IA apos extracao de JSON.
 * Serve como contrato de retorno do cliente para o engine.
 */
export type ParsedIaResponse = {
  feedbacks?: IaAnalyzeRemoteFeedbackAnalysis[];
  global_insights?: IaAnalyzeInsights;
};

/**
 * Parametros necessarios para analisar um batch no modelo.
 * Serve para transportar escopo, contexto de empresa e feedbacks.
 */
export type AnalyzeBatchWithIaParams = {
  scopeType: IaAnalyzeScopeType;
  enterpriseContext: IaAnalyzeEnterpriseContext;
  feedbacks: IaAnalyzeFeedbackInput[];
};

/**
 * Contrato publico do cliente de IA utilizado pelo engine.
 * Serve para desacoplar implementacao da chamada remota do restante do fluxo.
 */
export type IaApiClient = {
  analyzeBatch: (params: AnalyzeBatchWithIaParams) => Promise<ParsedIaResponse>;
};

/**
 * Shape minimo esperado do SDK de IA para leitura do texto bruto.
 * Serve para proteger cast e lidar com variacao de retorno da biblioteca.
 */
export type AiResponseShape = {
  text?: string | (() => string);
};
