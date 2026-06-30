import { useMemo } from 'react';
import {
  FaComments,
  FaFrown,
  FaSmile,
  FaStar,
  FaCalendar,
} from 'react-icons/fa';
import { FaChartBar, FaRegFaceSmile } from 'react-icons/fa6';
import ComparisonMetricCard from '../../shared/cards/ComparisonMetricCard';
import FormatToCurrencyReal from 'src/lib/utils/FormatToReal';
import type { SectionComparisonMetricsProps } from './ui.types';

const RATING_ORDER = [5, 4, 3, 2, 1] as const;

const PRESET_LABELS: Record<string, string> = {
  today: 'Hoje',
  last_7_days: 'Últimos 7 dias',
  last_30_days: 'Últimos 30 dias',
  this_month: 'Este mês',
  last_month: 'Mês passado',
  custom: 'Personalizado',
};

const REFERENCE_LABELS: Record<string, string> = {
  today: 'ontem',
  last_7_days: '7 dias anteriores',
  last_30_days: '30 dias anteriores',
  this_month: 'mesmo mês do ano anterior',
  last_month: 'mês retrasado',
  custom: 'período anterior equivalente',
};

function formatDate(isoStr?: string) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function SectionComparisonMetrics({
  data,
  datePreset,
  startDate,
  endDate,
  referenceStartDate,
  referenceEndDate,
  comparisonReferenceType,
}: SectionComparisonMetricsProps) {
  const { primary, reference, deltas } = data;

  const RATING_LABELS: Record<number, string> = {
    5: 'Excelentes',
    4: 'Bons',
    3: 'Medianos',
    2: 'Ruins',
    1: 'Péssimos',
  };

  const getReferenceLabel = () => {
    if (comparisonReferenceType === 'custom') {
      return 'período personalizado';
    }
    if (comparisonReferenceType === 'previous_year') {
      return 'mesmo período no ano passado';
    }
    return REFERENCE_LABELS[datePreset] || 'período anterior equivalente';
  };

  // Cálculo das porcentagens de sentimentos
  const priSentiment = useMemo(() => {
    const total = primary.totalFeedbacks || 0;
    const pos = primary.sentimentBreakdown.positive;
    const neu = primary.sentimentBreakdown.neutral;
    const neg = primary.sentimentBreakdown.negative;
    if (total === 0) return { posPct: 0, neuPct: 0, negPct: 0 };
    return {
      posPct: (pos / total) * 100,
      neuPct: (neu / total) * 100,
      negPct: (neg / total) * 100,
    };
  }, [primary]);

  const refSentiment = useMemo(() => {
    const total = reference.totalFeedbacks || 0;
    const pos = reference.sentimentBreakdown.positive;
    const neu = reference.sentimentBreakdown.neutral;
    const neg = reference.sentimentBreakdown.negative;
    if (total === 0) return { posPct: 0, neuPct: 0, negPct: 0 };
    return {
      posPct: (pos / total) * 100,
      neuPct: (neu / total) * 100,
      negPct: (neg / total) * 100,
    };
  }, [reference]);

  return (
    <div className="space-y-6">
      {/* Banner explicativo de comparação */}
      <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-sm text-(--text-secondary) flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <FaCalendar className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-(--text-primary)">
            Comparação de Períodos Ativa
          </p>
          <p className="text-xs text-(--text-tertiary) leading-relaxed">
            Você está comparando o período de <span className="font-medium text-(--text-secondary)">{PRESET_LABELS[datePreset] || 'Personalizado'}</span> ({formatDate(startDate)} a {formatDate(endDate)}) 
            com o <span className="font-medium text-(--text-secondary)">período de referência ({getReferenceLabel()})</span> ({formatDate(referenceStartDate)} a {formatDate(referenceEndDate)}).
          </p>
        </div>
      </div>

      {/* Grid de Cartões de Métricas */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ComparisonMetricCard
          title="Média de satisfação"
          value={FormatToCurrencyReal(primary.averageRating, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
          refValue={FormatToCurrencyReal(reference.averageRating, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
          delta={deltas.averageRating}
          icon={FaStar}
          helper="Nota média ponderada"
        />
        <ComparisonMetricCard
          title="Feedbacks recebidos"
          value={FormatToCurrencyReal(primary.totalFeedbacks)}
          refValue={FormatToCurrencyReal(reference.totalFeedbacks)}
          delta={deltas.totalFeedbacks}
          isPercentageDelta={true}
          icon={FaComments}
          helper="Total coletado no período"
        />
        <ComparisonMetricCard
          title="Feedbacks positivos"
          value={FormatToCurrencyReal(primary.sentimentBreakdown.positive)}
          refValue={FormatToCurrencyReal(reference.sentimentBreakdown.positive)}
          delta={{
            absolute: primary.sentimentBreakdown.positive - reference.sentimentBreakdown.positive,
            percentage: reference.sentimentBreakdown.positive > 0
              ? ((primary.sentimentBreakdown.positive - reference.sentimentBreakdown.positive) / reference.sentimentBreakdown.positive) * 100
              : null
          }}
          isPercentageDelta={true}
          icon={FaSmile}
          helper="Avaliações 4 ★ e 5 ★"
        />
        <ComparisonMetricCard
          title="Feedbacks críticos"
          value={FormatToCurrencyReal(primary.sentimentBreakdown.negative)}
          refValue={FormatToCurrencyReal(reference.sentimentBreakdown.negative)}
          delta={{
            absolute: primary.sentimentBreakdown.negative - reference.sentimentBreakdown.negative,
            percentage: reference.sentimentBreakdown.negative > 0
              ? ((primary.sentimentBreakdown.negative - reference.sentimentBreakdown.negative) / reference.sentimentBreakdown.negative) * 100
              : null
          }}
          isPercentageDelta={true}
          invertColor={true}
          icon={FaFrown}
          helper="Avaliações 1 ★ e 2 ★"
        />
      </section>

      {/* Seção de Gráficos Comparativos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuição de Avaliações */}
        <section className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">
                Distribuição das avaliações
              </h2>
              <p className="text-sm text-(--text-tertiary)">
                Percentual por estrela (Atual vs. Período anterior)
              </p>
            </div>
            <FaChartBar className="text-(--text-tertiary)" size={20} />
          </header>

          <div className="mt-6 space-y-5">
            {RATING_ORDER.map((rating) => {
              const primaryCount = primary.ratingDistribution[rating] ?? 0;
              const primaryPercent = primary.totalFeedbacks ? Math.round((primaryCount / primary.totalFeedbacks) * 100) : 0;

              const referenceCount = reference.ratingDistribution[rating] ?? 0;
              const referencePercent = reference.totalFeedbacks ? Math.round((referenceCount / reference.totalFeedbacks) * 100) : 0;

              return (
                <div key={rating} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-sm text-(--text-secondary) font-medium">
                      <FaStar className="text-yellow-400" size={12} />
                      <span>{rating} ({RATING_LABELS[rating]})</span>
                    </div>
                    <div className="text-xs text-(--text-tertiary)">
                      <span className="font-semibold text-(--text-primary)">{primaryPercent}%</span> ({primaryCount})
                      <span className="mx-1.5 font-normal text-slate-400 dark:text-slate-500">vs</span>
                      <span>{referencePercent}%</span> ({referenceCount})
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {/* Barra Período Atual */}
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-(--seventh-color)">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) transition-all duration-500"
                        style={{ width: `${primaryPercent}%` }}
                      />
                    </div>
                    {/* Barra Período Referência */}
                    <div className="relative h-1.5 overflow-hidden rounded-full bg-(--seventh-color)/60">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-slate-400/40 dark:bg-slate-500/30 transition-all duration-500"
                        style={{ width: `${referencePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Distribuição de Sentimento */}
        <section className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">
                Análise de sentimento comparativa
              </h2>
              <p className="text-sm text-(--text-tertiary)">
                Proporção de feedbacks positivos, neutros e críticos
              </p>
            </div>
            <FaRegFaceSmile className="text-(--text-tertiary)" size={20} />
          </header>

          <div className="mt-8 space-y-6">
            {/* Período Atual */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-(--text-primary)">Período Atual</span>
                <span className="text-(--text-tertiary)">{primary.totalFeedbacks} feedbacks</span>
              </div>
              <div className="flex h-5 w-full overflow-hidden rounded-lg bg-(--seventh-color) shadow-inner">
                {priSentiment.posPct > 0 && (
                  <div
                    style={{ width: `${priSentiment.posPct}%` }}
                    className="bg-emerald-500 transition-all duration-500 hover:opacity-90"
                    title={`Positivos: ${priSentiment.posPct.toFixed(1)}%`}
                  />
                )}
                {priSentiment.neuPct > 0 && (
                  <div
                    style={{ width: `${priSentiment.neuPct}%` }}
                    className="bg-amber-400 transition-all duration-500 hover:opacity-90"
                    title={`Neutros: ${priSentiment.neuPct.toFixed(1)}%`}
                  />
                )}
                {priSentiment.negPct > 0 && (
                  <div
                    style={{ width: `${priSentiment.negPct}%` }}
                    className="bg-rose-500 transition-all duration-500 hover:opacity-90"
                    title={`Críticos: ${priSentiment.negPct.toFixed(1)}%`}
                  />
                )}
              </div>
            </div>

            {/* Período Anterior */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-(--text-secondary)">Período Anterior</span>
                <span className="text-(--text-tertiary)">{reference.totalFeedbacks} feedbacks</span>
              </div>
              <div className="flex h-5 w-full overflow-hidden rounded-lg bg-(--seventh-color) opacity-50 shadow-inner">
                {refSentiment.posPct > 0 && (
                  <div
                    style={{ width: `${refSentiment.posPct}%` }}
                    className="bg-emerald-500 transition-all duration-500 hover:opacity-90"
                    title={`Positivos: ${refSentiment.posPct.toFixed(1)}%`}
                  />
                )}
                {refSentiment.neuPct > 0 && (
                  <div
                    style={{ width: `${refSentiment.neuPct}%` }}
                    className="bg-amber-400 transition-all duration-500 hover:opacity-90"
                    title={`Neutros: ${refSentiment.neuPct.toFixed(1)}%`}
                  />
                )}
                {refSentiment.negPct > 0 && (
                  <div
                    style={{ width: `${refSentiment.negPct}%` }}
                    className="bg-rose-500 transition-all duration-500 hover:opacity-90"
                    title={`Críticos: ${refSentiment.negPct.toFixed(1)}%`}
                  />
                )}
              </div>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center justify-center gap-6 border-t border-(--quaternary-color)/6 pt-5 text-xs text-(--text-secondary)">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-emerald-500" />
                <span>Positivos (4-5 ★)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-amber-400" />
                <span>Neutros (3 ★)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-rose-500" />
                <span>Críticos (1-2 ★)</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
