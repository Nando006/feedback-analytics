import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import { truncateMessage } from 'lib/utils/truncateText';
import { formatDateTime } from 'lib/utils/FormatDate';
import type { LatestFeedbacksProps } from './ui.types';

const ANSWER_LABEL: Record<string, string> = {
  PESSIMO: 'Péssimo',
  RUIM: 'Ruim',
  MEDIANA: 'Mediana',
  BOA: 'Boa',
  OTIMA: 'Ótima',
};

export default function SectionLatestFeedbacks({
  latestFeedbacks,
  latestLimit,
}: LatestFeedbacksProps) {
  return (
    <section className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">Feedbacks recentes</h2>
          <p className="text-sm text-(--text-tertiary)">
            Últimos {latestLimit} retornos enviados pelos clientes
          </p>
        </div>
        <Link
          to="/user/feedbacks/all"
          className="inline-flex items-center gap-2 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)">
          Ver todos
          <FaArrowRight className="text-xs" />
        </Link>
      </header>

      <div className="mt-6 space-y-4">
        {latestFeedbacks.length === 0 ? (
          <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-6 text-center text-sm text-(--text-tertiary)">
            Nenhum feedback foi recebido até o momento.
          </div>
        ) : (
          latestFeedbacks.map((feedback) => (
            <article
              key={feedback.id}
              className="space-y-2 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
              <div className="flex items-center gap-3 text-sm text-(--text-secondary)">
                <span className="inline-flex items-center gap-1 rounded-full border border-(--quaternary-color)/12 bg-(--bg-secondary) px-2 py-1 text-xs uppercase tracking-wide text-(--text-tertiary)">
                  {feedback.collection_points?.type ?? 'N/A'}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: feedback.rating }).map((_, starIndex) => (
                    <FaStar key={starIndex} size={12} />
                  ))}
                </div>
                <span className="text-xs text-(--text-tertiary)">
                  {formatDateTime(feedback.created_at)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-(--text-primary)">
                {truncateMessage(feedback.message)}
              </p>
              {(feedback.feedback_question_answers ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(feedback.feedback_question_answers ?? []).slice(0, 3).map((answer, index) => (
                    <span
                      key={`${feedback.id}-latest-question-answer-${answer.question_id}`}
                      title={answer.question_text_snapshot}
                      className="rounded-full border border-(--quaternary-color)/15 bg-(--bg-secondary) px-2.5 py-1 text-xs text-(--text-secondary)"
                    >
                      {index + 1}. {ANSWER_LABEL[answer.answer_value] ?? answer.answer_value}
                    </span>
                  ))}
                </div>
              ) : null}
              {feedback.tracked_devices?.customer ? (
                <p className="text-xs text-(--text-tertiary)">
                  Cliente:{' '}
                  <span className="text-(--text-secondary)">
                    {feedback.tracked_devices.customer.name ?? 'Não identificado'}
                  </span>
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
