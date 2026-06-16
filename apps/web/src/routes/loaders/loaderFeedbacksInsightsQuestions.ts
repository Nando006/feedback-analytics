import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackQuestionsData } from 'src/routes/load/loadFeedbackQuestions';

export async function LoaderFeedbacksInsightsQuestions(
  _args: LoaderFunctionArgs,
) {
  void _args;
  // Semeia no escopo Empresa (o hook pula o 1º fetch quando o escopo é Empresa).
  // Sem o scope_type explícito, o backend trataria "sem escopo" como TODOS os
  // feedbacks, vazando perguntas de produto/serviço para a visão Empresa.
  const data = await loadFeedbackQuestionsData({ scope_type: 'COMPANY' });

  return {
    ...data,
    error: data.error ? 'Erro ao carregar métricas por pergunta' : null,
  };
}
