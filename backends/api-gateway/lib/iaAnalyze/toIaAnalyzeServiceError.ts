import { IaAnalyzeServiceError } from '../../errors/iaAnalyze.errors.js';
import { normalizeStatusCode } from './normalizeStatusCode.js';

export function toIaAnalyzeServiceError(params: {
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
