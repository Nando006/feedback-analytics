import { useEffect } from 'react';
import { useFetcher, useLoaderData, useRevalidator } from 'react-router-dom';
import type {
  FeedbackAnalysisSummary,
} from 'lib/interfaces/user/feedback';
import type { LoaderFeedbacksInsightsReport } from 'src/routes/loaders/loaderFeedbacksInsightsReport';

type ActionData = {
  ok?: boolean;
  error?: string;
};

function getMoodFromSummary(summary: FeedbackAnalysisSummary | null) {
  if (!summary || summary.totalAnalyzed === 0) {
    return {
      label: 'Sem dados suficientes',
      tone: 'neutral' as const,
      description:
        'Ainda não há feedbacks suficientes analisados pela IA para determinar o clima emocional.',
    };
  }

  const { positive, neutral, negative } = summary.sentiments;
  const max = Math.max(positive, neutral, negative);

  if (max === positive) {
    return {
      label: 'Clima Positivo',
      tone: 'positive' as const,
      description:
        'A maioria dos feedbacks recentes está positiva, indicando satisfação geral com a experiência.',
    };
  }

  if (max === negative) {
    return {
      label: 'Clima de Atenção',
      tone: 'negative' as const,
      description:
        'Há concentração de feedbacks negativos, sugerindo pontos críticos que precisam de ação imediata.',
    };
  }

  return {
    label: 'Clima Neutro',
    tone: 'neutral' as const,
    description:
      'Os feedbacks estão balanceados entre elogios e reclamações, apontando espaço claro para melhoria.',
  };
}

export default function FeedbacksInsightsReport() {
  const { report, summary, error: loaderError } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsReport>>>();
  const revalidator = useRevalidator();
  const fetcher = useFetcher<ActionData>();

  const refreshing =
    fetcher.state !== 'idle' || revalidator.state === 'loading';
  const error = fetcher.data?.error ?? loaderError;

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  const handleRefreshClick = () => {
    const form = new FormData();
    form.set('intent', 'run_feedback_ia');
    fetcher.submit(form, { method: 'post' });
  };

  if (refreshing && !report && !summary && !loaderError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-primary)]">
          Carregando relatório de insights...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const hasContent =
    report && ((report.summary && report.summary.trim().length > 0) ||
      (report.recommendations && report.recommendations.length > 0));

  if (!hasContent) {
    return (
      <div className="font-inter space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Relatório de Insights da IA
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Gere um relatório inteligente a partir dos feedbacks já
                analisados pela IA.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={refreshing}
              className="px-4 py-2 text-sm rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-[var(--text-secondary)] disabled:opacity-60">
              {refreshing ? 'Atualizando...' : 'Gerar relatório com IA'}
            </button>
          </div>

          <div className="text-sm text-[var(--text-muted)] mt-2">
            Ainda não há um relatório gerado. Clique em{' '}
            <span className="font-medium text-[var(--text-secondary)]">
              &quot;Gerar relatório com IA&quot;
            </span>{' '}
            para que o sistema analise os feedbacks, categorize sentimentos e
            produza um resumo com recomendações.
          </div>
        </div>
      </div>
    );
  }

  const updatedLabel =
    report?.updatedAt != null
      ? new Date(report.updatedAt).toLocaleString('pt-BR')
      : null;

  const mood = getMoodFromSummary(summary);

  const total = summary?.totalAnalyzed ?? 0;
  const positivePct =
    total > 0 ? Math.round((summary!.sentiments.positive / total) * 100) : 0;
  const neutralPct =
    total > 0 ? Math.round((summary!.sentiments.neutral / total) * 100) : 0;
  const negativePct =
    total > 0 ? Math.round((summary!.sentiments.negative / total) * 100) : 0;

  const toneColors: Record<
    'positive' | 'neutral' | 'negative',
    { border: string; bg: string; text: string }
  > = {
    positive: {
      border: 'border-emerald-500/60',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
    },
    neutral: {
      border: 'border-amber-500/60',
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
    },
    negative: {
      border: 'border-rose-500/60',
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
    },
  };

  const toneKey = mood.tone === 'positive' || mood.tone === 'negative'
    ? mood.tone
    : 'neutral';
  const tone = toneColors[toneKey];

  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card space-y-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Relatório de Insights da IA
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-2xl">
              Resumo estratégico gerado automaticamente a partir dos feedbacks,
              sentimentos e categorias identificadas pela IA, com foco em
              oportunidades de melhoria e pontos fortes da experiência do
              cliente.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {updatedLabel && (
              <span className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                Última atualização: {updatedLabel}
              </span>
            )}
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={refreshing}
              className="px-4 py-2 text-sm rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-[var(--text-secondary)] disabled:opacity-60">
              {refreshing ? 'Atualizando...' : 'Atualizar insights com IA'}
            </button>
          </div>
        </div>

        {/* Clima emocional geral */}
        <div
          className={`rounded-2xl border ${tone.border} ${tone.bg} p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
          <div className="space-y-1">
            <div className={`text-xs uppercase tracking-wide ${tone.text}`}>
              Clima emocional geral
            </div>
            <div className={`text-xl font-semibold ${tone.text}`}>
              {mood.label}
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-xl">
              {mood.description}
            </p>
          </div>
          {summary && summary.totalAnalyzed > 0 && (
            <div className="w-full md:w-1/2 space-y-2">
              <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden flex">
                <div
                  style={{ width: `${positivePct}%` }}
                  className="h-full bg-emerald-500/70"
                />
                <div
                  style={{ width: `${neutralPct}%` }}
                  className="h-full bg-amber-500/70"
                />
                <div
                  style={{ width: `${negativePct}%` }}
                  className="h-full bg-rose-500/70"
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>Positivos: {positivePct}%</span>
                <span>Neutros: {neutralPct}%</span>
                <span>Negativos: {negativePct}%</span>
              </div>
            </div>
          )}
        </div>

        {report?.summary && report.summary.trim().length > 0 && (
          <div className="mt-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Visão geral
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
              {report.summary}
            </p>
          </div>
        )}

        {report?.recommendations && report.recommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Recomendações da IA
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--text-primary)]">
              {report.recommendations.map((rec, index) => (
                <li key={`${index}-${rec.slice(0, 16)}`}>
                  <span className="leading-relaxed whitespace-pre-wrap">
                    {rec}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
