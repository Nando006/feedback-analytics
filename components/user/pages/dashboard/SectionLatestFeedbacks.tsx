import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import { truncateMessage } from 'lib/utils/truncateText';
import { formatDateTime } from 'lib/utils/FormatDate';
import type { LatestFeedbacksProps } from './ui.types';

export default function SectionLatestFeedbacks({
  latestFeedbacks,
  latestLimit,
}: LatestFeedbacksProps) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100">Feedbacks recentes</h2>
          <p className="text-sm text-neutral-400">
            Últimos {latestLimit} retornos enviados pelos clientes
          </p>
        </div>
        <Link
          to="/user/feedbacks/all"
          className="inline-flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-neutral-100">
          Ver todos
          <FaArrowRight className="text-xs" />
        </Link>
      </header>

      <div className="mt-6 space-y-4">
        {latestFeedbacks.length === 0 ? (
          <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 p-6 text-center text-sm text-neutral-400">
            Nenhum feedback foi recebido até o momento.
          </div>
        ) : (
          latestFeedbacks.map((feedback) => (
            <article
              key={feedback.id}
              className="space-y-2 rounded-xl border border-neutral-800/60 bg-neutral-900/80 p-4">
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2 py-1 text-xs uppercase tracking-wide text-neutral-400">
                  {feedback.collection_points?.type ?? 'N/A'}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: feedback.rating }).map((_, starIndex) => (
                    <FaStar key={starIndex} size={12} />
                  ))}
                </div>
                <span className="text-xs text-neutral-500">
                  {formatDateTime(feedback.created_at)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-200">
                {truncateMessage(feedback.message)}
              </p>
              {feedback.tracked_devices?.customer ? (
                <p className="text-xs text-neutral-500">
                  Cliente:{' '}
                  <span className="text-neutral-300">
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
