import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import ConfidenceBadge from 'components/user/shared/ConfidenceBadge';
import type { SectionLowestQuestionsProps } from './ui.types';

function meanTone(mean: number): string {
  if (mean >= 4) return 'text-(--positive)';
  if (mean >= 3) return 'text-(--neutral)';
  return 'text-(--negative)';
}

/**
 * Atalho no dashboard: as 3 perguntas com menor nota média no escopo, com link
 * para a análise completa. Oculto quando não há respostas de perguntas.
 */
export default function SectionLowestQuestions({ questions }: SectionLowestQuestionsProps) {
  // Só perguntas ATUAIS — não faz sentido sugerir ação sobre redação antiga/removida.
  const current = questions.filter((q) => q.isCurrent);
  if (current.length === 0) return null;

  const worst = [...current].sort((a, b) => a.mean - b.mean).slice(0, 3);

  return (
    <section className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">
            Perguntas com menor nota
          </h2>
          <p className="text-sm text-(--text-tertiary)">
            As que mais precisam de atenção no escopo selecionado.
          </p>
        </div>
        <Link
          to="/user/insights/questions"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
        >
          Ver todas
          <FaArrowRight className="text-xs" />
        </Link>
      </header>

      <ul className="mt-4 space-y-2">
        {worst.map((q) => (
          <li
            key={q.question_id}
            className="flex items-center justify-between gap-3 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-(--text-primary)">{q.text}</p>
              <div className="mt-1">
                <ConfidenceBadge tier={q.confidenceTier} n={q.count} />
              </div>
            </div>
            <span className={`shrink-0 text-lg font-semibold ${meanTone(q.mean)}`}>
              {q.mean.toFixed(1)}
              <span className="text-xs text-(--text-tertiary)">/5</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
