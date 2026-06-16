import type {
  QuestionDistribution,
  QuestionMetric,
  QuestionMetricStatus,
} from 'lib/interfaces/domain/feedback.domain';
import type { InsightsQuestionsSectionProps } from './ui.types';
import ConfidenceBadge from 'components/user/shared/ConfidenceBadge';
import MetricHelp from 'components/user/shared/MetricHelp';
import { formatInterval } from 'src/lib/utils/statistics';

const DIST_ORDER = [
  { key: 'OTIMA', label: 'Ótima', cls: 'bg-(--positive)/70' },
  { key: 'BOA', label: 'Boa', cls: 'bg-(--positive)/40' },
  { key: 'MEDIANA', label: 'Mediana', cls: 'bg-(--neutral)/70' },
  { key: 'RUIM', label: 'Ruim', cls: 'bg-(--negative)/45' },
  { key: 'PESSIMO', label: 'Péssima', cls: 'bg-(--negative)/75' },
] as const;

function meanTone(mean: number): string {
  if (mean >= 4) return 'text-(--positive)';
  if (mean >= 3) return 'text-(--neutral)';
  return 'text-(--negative)';
}

/** Selo do estado: "Desativada" (recuperável) ou "Antiga" (texto editado/removida). */
function statusTag(status: QuestionMetricStatus) {
  if (status === 'deactivated') {
    return (
      <span className="rounded-full border border-(--neutral)/40 bg-(--neutral)/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-(--neutral)">
        Desativada
      </span>
    );
  }
  if (status === 'past') {
    return (
      <span className="rounded-full border border-(--quaternary-color)/30 bg-(--seventh-color) px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-(--text-tertiary)">
        Antiga
      </span>
    );
  }
  return null;
}

function distributionBar(distribution: QuestionDistribution, total: number) {
  if (total <= 0) return null;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-(--seventh-color)">
      {DIST_ORDER.map(({ key, label, cls }) => {
        const value = distribution[key];
        if (!value) return null;
        return (
          <div
            key={key}
            className={`h-full ${cls}`}
            style={{ width: `${(value / total) * 100}%` }}
            title={`${label}: ${value}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Card de uma pergunta (uma redação): nota média + faixa provável + % satisfeitos
 * + mini-distribuição + selo de confiança, com subperguntas aninhadas. Quando não é
 * a redação atual, recebe um visual atenuado e o selo de estado; subperguntas
 * desativadas/antigas também recebem o selo.
 */
function renderQuestionCard(q: QuestionMetric, key: string) {
  const muted = q.status !== 'current';
  return (
    <div
      key={key}
      className={
        muted
          ? 'font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-(--seventh-color)/40 p-5'
          : 'font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-5 glass-card'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-(--text-primary) font-montserrat">
          {q.text}
          {statusTag(q.status)}
        </h3>
        <ConfidenceBadge tier={q.confidenceTier} n={q.count} unit="respostas" />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div>
          <span className={`text-2xl font-semibold ${meanTone(q.mean)}`}>{q.mean.toFixed(1)}</span>
          <span className="text-sm text-(--text-tertiary)"> /5 · nota média</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-(--text-tertiary)">
          faixa provável {formatInterval(q.ci, 1)}
          <MetricHelp term="confidenceInterval" />
        </span>
        <span className="text-sm text-(--text-secondary)">{q.satisfiedPct.toFixed(0)}% satisfeitos</span>
      </div>

      <div className="mt-3">{distributionBar(q.distribution, q.count)}</div>

      {q.subquestions.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-(--quaternary-color)/10 pt-3">
          {q.subquestions.map((s, idx) => (
            <li
              key={`${s.subquestion_id}-${idx}`}
              className="rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color)/60 px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex flex-wrap items-center gap-2 text-sm text-(--text-secondary)">
                  {s.text}
                  {statusTag(s.status)}
                </span>
                <span className="text-xs text-(--text-tertiary)">
                  <span className={`font-semibold ${meanTone(s.mean)}`}>{s.mean.toFixed(1)}/5</span>
                  {' · '}
                  {s.satisfiedPct.toFixed(0)}% satisfeitos · {s.count} respostas
                </span>
              </div>
              <div className="mt-2">{distributionBar(s.distribution, s.count)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function renderCollapsible(title: string, hint: string, items: QuestionMetric[]) {
  if (items.length === 0) return null;
  return (
    <details className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary)/40">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3 text-sm font-medium text-(--text-secondary) select-none">
        <span>
          {title} ({items.length})
        </span>
        <span className="text-xs font-normal text-(--text-tertiary)">{hint}</span>
      </summary>
      <div className="space-y-4 px-3 pb-4 sm:px-4">
        {items.map((q, idx) => renderQuestionCard(q, `${q.question_id}-${idx}`))}
      </div>
    </details>
  );
}

/**
 * Lista de perguntas separada em três grupos por estado:
 * - "Perguntas atuais": ativas, redação atual (em destaque).
 * - "Perguntas desativadas": desligadas na configuração — reative para voltarem às
 *   atuais com o histórico (seção recolhível).
 * - "Perguntas antigas": redações editadas ou perguntas removidas (seção recolhível).
 * Cada grupo já vem ordenado pior→melhor do backend.
 */
export default function InsightsQuestionsSection({ questions }: InsightsQuestionsSectionProps) {
  const atuais = questions.filter((q) => q.status === 'current');
  const desativadas = questions.filter((q) => q.status === 'deactivated');
  const antigas = questions.filter((q) => q.status === 'past');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {atuais.length === 0 ? (
          <p className="text-sm text-(--text-tertiary)">
            Nenhuma pergunta ativa com respostas neste escopo.
          </p>
        ) : (
          atuais.map((q, idx) => renderQuestionCard(q, `${q.question_id}-${idx}`))
        )}
      </div>

      {renderCollapsible(
        'Perguntas desativadas',
        'desligadas na configuração — reative para voltarem às atuais com o histórico',
        desativadas,
      )}

      {renderCollapsible(
        'Perguntas antigas',
        'redações editadas ou perguntas removidas — histórico preservado',
        antigas,
      )}
    </div>
  );
}
