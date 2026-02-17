import type { Feedback } from 'lib/interfaces/user/feedback';

interface PropsFeedbackDetailsModal {
  selectedFeedback: Feedback;
  onClose: () => void;
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FeedbackDetailsModal({
  selectedFeedback,
  onClose,
}: PropsFeedbackDetailsModal) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 glass-card"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Detalhes do Feedback</h2>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-[var(--text-secondary)] hover:bg-neutral-800">
            Fechar
          </button>
        </div>

        <div className="space-y-6 text-sm">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                Rating: {selectedFeedback.rating}
              </span>
              <span className="text-[var(--text-muted)]">
                Criado: {formatDateTime(selectedFeedback.created_at)}
              </span>
              {selectedFeedback.updated_at && (
                <span className="text-[var(--text-muted)]">
                  Atualizado: {formatDateTime(selectedFeedback.updated_at)}
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap leading-relaxed text-[var(--text-primary)]">
              {selectedFeedback.message}
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Ponto de Coleta</h3>
            {selectedFeedback.collection_points ? (
              <div className="grid grid-cols-1 gap-2 text-[var(--text-muted)] md:grid-cols-3">
                <div>
                  <span className="text-[var(--text-secondary)]">Nome:</span>{' '}
                  {selectedFeedback.collection_points.name}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Tipo:</span>{' '}
                  {selectedFeedback.collection_points.type}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Identificador:</span>{' '}
                  {selectedFeedback.collection_points.identifier || '—'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--text-muted)]">
                Nenhuma informação de ponto de coleta.
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Dispositivo</h3>
            {selectedFeedback.tracked_devices ? (
              <div className="grid grid-cols-1 gap-2 text-[var(--text-muted)] md:grid-cols-2">
                <div>
                  <span className="text-[var(--text-secondary)]">Fingerprint:</span>{' '}
                  {selectedFeedback.tracked_devices.device_fingerprint || '—'}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Feedbacks:</span>{' '}
                  {selectedFeedback.tracked_devices.feedback_count ?? 0}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">IP:</span>{' '}
                  {selectedFeedback.tracked_devices.ip_address || '—'}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Blocked:</span>{' '}
                  {selectedFeedback.tracked_devices.is_blocked ? 'Sim' : 'Não'}
                </div>
                <div className="md:col-span-2">
                  <span className="text-[var(--text-secondary)]">User Agent:</span>{' '}
                  {selectedFeedback.tracked_devices.user_agent || '—'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--text-muted)]">
                Nenhuma informação de dispositivo.
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Cliente</h3>
            {selectedFeedback.tracked_devices?.customer ? (
              <div className="grid grid-cols-1 gap-2 text-[var(--text-muted)] md:grid-cols-2">
                <div>
                  <span className="text-[var(--text-secondary)]">Nome:</span>{' '}
                  {selectedFeedback.tracked_devices.customer.name || '—'}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Email:</span>{' '}
                  {selectedFeedback.tracked_devices.customer.email || '—'}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Gênero:</span>{' '}
                  {selectedFeedback.tracked_devices.customer.gender || '—'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--text-muted)]">
                Nenhuma informação de cliente foi cadastrada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
