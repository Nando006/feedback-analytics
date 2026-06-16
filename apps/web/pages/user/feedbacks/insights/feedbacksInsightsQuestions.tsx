import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksInsightsQuestions } from 'src/routes/loaders/loaderFeedbacksInsightsQuestions';
import PageHeader from 'components/user/shared/PageHeader';
import { useScopedFeedbackQuestions } from 'src/lib/hooks/useScopedFeedbackQuestions';
import InsightsQuestionsSection from 'components/user/pages/feedbacksInsightsQuestions/InsightsQuestionsSection';

export default function FeedbacksInsightsQuestions() {
  const initialData =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsQuestions>>>();
  const { questions, error } = useScopedFeedbackQuestions(initialData);

  return (
    <div className="font-work-sans space-y-6">
      <PageHeader />

      {error ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-(--negative)/30 bg-(--negative)/10 p-6 text-center text-(--text-primary) glass-card">
            {error}
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 text-center text-(--text-tertiary) glass-card">
            Ainda não há respostas de perguntas para o escopo selecionado.
          </div>
        </div>
      ) : (
        <InsightsQuestionsSection questions={questions} />
      )}
    </div>
  );
}
