import type { ActionFunctionArgs } from 'react-router-dom';
import {
  ServiceRunFeedbackIAAnalysis,
  ServiceRunRawFeedbackAnalysis,
} from 'src/services/serviceFeedbacks';
import {
  INTENT_FEEDBACK_ANALYZE_RAW,
  INTENT_FEEDBACK_RUN_IA,
} from 'src/lib/constants/routes/intents';
import { ACTION_ERROR_INVALID_INTENT } from 'src/lib/constants/routes/errors';
import type { IaAnalyzeScopeType } from 'lib/interfaces/contracts/ia-analyze/scope.contract';

type HttpActionError = Error & {
  status?: number;
  code?: string;
};

/**
 * Códigos/situações em que o serviço de IA (microserviço remoto) está
 * indisponível, inalcançável ou demorou demais — gateway responde 502/503/504.
 * O usuário precisa de uma mensagem clara em vez de um "502 Bad Gateway" cru.
 */
const IA_SERVICE_UNAVAILABLE_CODES = new Set<string>([
  'failed_remote_ia_analyze_request',
  'remote_ia_analyze_error',
  'invalid_remote_ia_analyze_response_shape',
  'missing_ia_analyze_remote_url',
  'missing_gemini_api_key',
  'failed_ia_request',
  'invalid_ai_response',
]);

function isIaServiceUnavailable(error: HttpActionError): boolean {
  if (error.code && IA_SERVICE_UNAVAILABLE_CODES.has(error.code)) return true;
  return error.status === 502 || error.status === 503 || error.status === 504;
}

function parseScopeType(value: FormDataEntryValue | null): IaAnalyzeScopeType | undefined {
  const normalized = String(value ?? '').trim().toUpperCase();

  if (
    normalized === 'COMPANY' ||
    normalized === 'PRODUCT' ||
    normalized === 'SERVICE' ||
    normalized === 'DEPARTMENT'
  ) {
    return normalized;
  }

  return undefined;
}

export async function ActionFeedbackInsightsReport({
  request,
}: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent !== INTENT_FEEDBACK_RUN_IA && intent !== INTENT_FEEDBACK_ANALYZE_RAW) {
    return { error: ACTION_ERROR_INVALID_INTENT };
  }

  const scope_type = parseScopeType(form.get('scope_type'));
  const catalog_item_id = String(form.get('catalog_item_id') ?? '').trim() || undefined;

  if (scope_type && scope_type !== 'COMPANY' && !catalog_item_id) {
    return {
      errorCode: 'item_selection_required',
      error: 'Selecione um item para analisar este escopo.',
    };
  }

  try {
    if (intent === INTENT_FEEDBACK_ANALYZE_RAW) {
      const result = await ServiceRunRawFeedbackAnalysis({ scope_type, catalog_item_id });
      return { ok: true, analyzedCount: result.analyzedCount };
    }

    const result = await ServiceRunFeedbackIAAnalysis({ scope_type, catalog_item_id });
    return { ok: true, reportGenerated: result.reportGenerated };
  } catch (error) {
    const typedError = error as HttpActionError;

    if (typedError.code === 'insufficient_feedbacks_for_analysis') {
      return {
        errorCode: 'insufficient_feedbacks_for_analysis',
        error:
          'Há poucos feedbacks neste contexto para uma análise relevante. É necessário no mínimo 10 feedbacks.',
      };
    }

    if (typedError.code === 'collecting_data_required_for_analysis') {
      return {
        errorCode: 'collecting_data_required_for_analysis',
        error:
          'Para analisar os feedbacks, preencha as informações da empresa em Editar > Configuração de Coleta de Dados.',
      };
    }

    if (isIaServiceUnavailable(typedError)) {
      return {
        errorCode: 'ia_service_unavailable',
        error:
          'O serviço de análise por IA está indisponível ou demorou demais para responder. Tente novamente em alguns instantes.',
      };
    }

    return { error: 'Erro ao atualizar insights com IA' };
  }
}