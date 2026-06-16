import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackAnalysisData } from 'src/routes/load/loadFeedbackAnalysis';

export async function LoaderFeedbacksInsightsEmotional(
  _args: LoaderFunctionArgs,
) {
  void _args;
  // Semeia no escopo Empresa (o hook pula o 1º fetch quando o escopo é Empresa);
  // sem scope_type explícito o backend retornaria TODOS os feedbacks.
  const data = await loadFeedbackAnalysisData({ scope_type: 'COMPANY' });

  return {
    ...data,
    error: data.error ? 'Erro ao carregar insights emocionais' : null,
  };
}
