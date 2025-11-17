import { useEffect, useState } from 'react';
import {
  ServiceGetFeedbackInsightsReport,
  ServiceRunFeedbackIAAnalysis,
} from 'src/services/serviceFeedbacks';
import type { FeedbackInsightsReport } from 'lib/interfaces/user/feedback';

export default function FeedbacksInsightsReport() {
  const [report, setReport] = useState<FeedbackInsightsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ServiceGetFeedbackInsightsReport();
      setReport(data);
    } catch (err) {
      console.error('Erro ao carregar relatório de insights (IA):', err);
      setError('Erro ao carregar relatório de insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const handleRefreshClick = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Dispara reprocessamento de feedbacks pela IA
      await ServiceRunFeedbackIAAnalysis();

      // Recarrega o relatório após a atualização
      await loadReport();
    } catch (err) {
      console.error('Erro ao atualizar insights com IA:', err);
      setError('Erro ao atualizar insights com IA');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
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

  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
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
