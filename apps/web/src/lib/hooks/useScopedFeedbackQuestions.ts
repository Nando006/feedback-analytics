import { useCallback, useEffect, useRef, useState } from 'react';
import type { QuestionMetric } from 'lib/interfaces/domain/feedback.domain';
import type { FeedbackQuestionsLoadData } from 'src/routes/load/loadFeedbackQuestions';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { ServiceGetFeedbackQuestions } from 'src/services/serviceFeedbacks';

type UseScopedFeedbackQuestionsResult = {
  questions: QuestionMetric[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/**
 * Métricas por pergunta filtradas pelo escopo selecionado em `useInsightsControls`.
 * Semeia com os dados do loader (escopo Empresa) e recarrega ao trocar de
 * escopo/item. Não depende da IA (perguntas são determinísticas), então não
 * reage a Analisar/Gerar.
 */
export function useScopedFeedbackQuestions(
  initialData: FeedbackQuestionsLoadData,
): UseScopedFeedbackQuestionsResult {
  const { scope, catalogItemId } = useInsightsControls();

  const didInitRef = useRef(false);
  const [questions, setQuestions] = useState<QuestionMetric[]>(initialData.questions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialData.error);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const catalogParam =
      scope !== 'COMPANY' ? catalogItemId || undefined : undefined;

    try {
      const data = await ServiceGetFeedbackQuestions({
        scope_type: scope,
        catalog_item_id: catalogParam,
      });
      setQuestions(data.questions);
    } catch {
      setQuestions([]);
      setError('Erro ao carregar métricas por pergunta');
    } finally {
      setLoading(false);
    }
  }, [scope, catalogItemId]);

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      if (scope === 'COMPANY' && !catalogItemId) {
        return;
      }
    }
    fetchQuestions();
  }, [fetchQuestions, scope, catalogItemId]);

  return { questions, loading, error, reload: fetchQuestions };
}
