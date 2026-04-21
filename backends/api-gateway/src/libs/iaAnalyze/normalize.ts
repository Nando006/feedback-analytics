import type { IaAnalyzeScopeType } from '../../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import type { FeedbackWithAnalysisRow, FeedbackWithAnalysisRowNormalized, FeedbackWithAnalysisRowRaw } from '../../types/iaAnalyze.types.js';
import { IaAnalyzeServiceError } from './errors.js';


/**
 * Normaliza uma base URL removendo barras finais e espaços.
 *
 * Se a string estiver vazia ou nula, retorna null.
 * Útil para garantir que URLs fiquem padronizadas antes de montar endpoints.
 */
export function normalizeBaseUrl(rawValue: string): string | null {
  const value = String(rawValue ?? '').trim();

  if (!value) {
    return null;
  }

  return value.replace(/\/+$/, '');
}

/**
 * Normaliza o status code HTTP para respostas de erro.
 *
 * Se o status estiver entre 400 e 599, retorna ele mesmo (erro válido).
 * Caso contrário, retorna 502 (Bad Gateway) como fallback.
 * Útil para garantir que respostas de erro sempre tenham um status apropriado.
 */
export function normalizeStatusCode(status: number): number {
  if (status >= 400 && status <= 599) {
    return status;
  }

  return 502;
}

/**
 * Normaliza uma lista de feedbacks analisados vindos da IA.
 *
 * - Aceita dados "crus" (FeedbackWithAnalysisRowRaw), que podem ter feedback_analysis como array, objeto ou null.
 * - Garante que cada item retornado tenha feedback_analysis válido (descarta os nulos).
 * - Se feedback_analysis for array, pega o primeiro elemento.
 *
 * Útil para padronizar a estrutura dos dados antes de consumir na aplicação, evitando bugs com formatos inesperados.
 */
export function normalizeFeedbackAnalysisRows(
  data: unknown,
): FeedbackWithAnalysisRowNormalized[] {
  const rows = (Array.isArray(data) ? data : []) as FeedbackWithAnalysisRowRaw[];

  return rows
    .map((row): FeedbackWithAnalysisRow => {
      const analysis = Array.isArray(row.feedback_analysis)
        ? (row.feedback_analysis[0] ?? null)
        : row.feedback_analysis;

      return {
        id: row.id,
        message: row.message,
        rating: row.rating,
        created_at: row.created_at,
        feedback_analysis: analysis,
      };
    })
    .filter(
      (row): row is FeedbackWithAnalysisRowNormalized => row.feedback_analysis !== null,
    );
}

/**
 * Normaliza o tipo de escopo recebido, garantindo que sempre retorna um valor válido do domínio.
 *
 * - Aceita string, null ou undefined.
 * - Converte para maiúsculas e retorna um dos valores esperados ('PRODUCT', 'SERVICE', 'DEPARTMENT', 'COMPANY').
 * - Se não reconhecer, retorna 'COMPANY' como padrão.
 *
 * Útil para evitar erros de digitação ou valores inesperados ao processar escopos de análise.
 */
export function normalizeScopeType(kind: string | null | undefined): IaAnalyzeScopeType {
  const normalized = String(kind ?? '').toUpperCase();

  if (normalized === 'PRODUCT') return 'PRODUCT';
  if (normalized === 'SERVICE') return 'SERVICE';
  if (normalized === 'DEPARTMENT') return 'DEPARTMENT';
  return 'COMPANY';
}

/**
 * Constrói um erro padronizado (IaAnalyzeServiceError) a partir de resposta da IA ou valores default.
 *
 * - Extrai código e mensagem do payload, se disponíveis e válidos.
 * - Usa valores default caso não haja código/mensagem válidos.
 * - Normaliza o status HTTP para garantir consistência.
 *
 * Útil para tratar erros da IA de forma uniforme na aplicação.
 */
export function normalizeIaAnalyzeServiceError(params: {
  status: number;
  payload: Record<string, unknown> | null;
  defaultCode: string;
  defaultMessage: string;
}) {
  const { status, payload, defaultCode, defaultMessage } = params;

  const code =
    typeof payload?.error === 'string' && payload.error.trim().length > 0
      ? payload.error.trim()
      : defaultCode;

  const message =
    typeof payload?.message === 'string' && payload.message.trim().length > 0
      ? payload.message.trim()
      : defaultMessage;

  return new IaAnalyzeServiceError(message, normalizeStatusCode(status), code);
}
