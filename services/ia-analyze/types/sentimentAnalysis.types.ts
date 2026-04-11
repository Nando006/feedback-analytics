import type {
  IaAnalyzeFeedbackInput,
} from '../../../shared/lib/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeRemoteFeedbackAnalysis } from '../../../shared/lib/interfaces/contracts/ia-analyze/remote.contract.js';

/**
 * Tipos do modulo de validacao de sentimento do dominio ia-analyze.
 * Centraliza contratos de entrada para filtragem de itens retornados pela IA.
 */

/**
 * Parametros para validar se um item analisado pode ser processado.
 * Serve para garantir que item e referencia de feedback estejam coerentes.
 */
export type CanProcessAnalyzedItemParams = {
  item: IaAnalyzeRemoteFeedbackAnalysis;
  feedbackById: Map<string, IaAnalyzeFeedbackInput>;
};
