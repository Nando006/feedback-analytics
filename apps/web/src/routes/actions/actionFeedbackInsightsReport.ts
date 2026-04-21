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
      await ServiceRunRawFeedbackAnalysis({ scope_type, catalog_item_id });
    } else {
      await ServiceRunFeedbackIAAnalysis({ scope_type, catalog_item_id });
    }

    return { ok: true };
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

    return { error: 'Erro ao atualizar insights com IA' };
  }
}