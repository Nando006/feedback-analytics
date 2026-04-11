import type { FeedbackDetailsModalProps } from './ui.types';

import { formatDateTime } from 'lib/utils/FormatDate';

const ANSWER_LABEL: Record<string, string> = {
  PESSIMO: 'Péssimo',
  RUIM: 'Ruim',
  MEDIANA: 'Mediana',
  BOA: 'Boa',
  OTIMA: 'Ótima',
};

export default function FeedbackDetailsModal({
  selectedFeedback,
  onClose,
}: FeedbackDetailsModalProps) {
  const catalogItem = Array.isArray(selectedFeedback.collection_points?.catalog_items)
    ? (selectedFeedback.collection_points?.catalog_items[0] ?? null)
    : (selectedFeedback.collection_points?.catalog_items ?? null);

  const resolvedItemKind =
    selectedFeedback.collection_points?.catalog_item_kind ?? catalogItem?.kind ?? null;

  const normalizedItemKind = String(resolvedItemKind ?? '').toUpperCase();

  const resolvedItemName =
    selectedFeedback.collection_points?.catalog_item_name ?? catalogItem?.name ?? null;

  const itemKindLabel =
    normalizedItemKind === 'PRODUCT'
      ? 'Produto'
      : normalizedItemKind === 'SERVICE'
        ? 'Serviço'
        : normalizedItemKind === 'DEPARTMENT'
          ? 'Departamento'
          : 'Empresa';

  const itemName = resolvedItemName;
  const channelDisplayName =
    selectedFeedback.collection_points?.type === 'QR_CODE'
      ? (selectedFeedback.collection_points?.name || '').replace(/^QR Code\s*-\s*.+$/, 'QR Code')
      : (selectedFeedback.collection_points?.name || 'N/A');

  const questionAnswers = selectedFeedback.feedback_question_answers ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">Detalhes do Feedback</h2>
          <button
            onClick={onClose}
            className="btn-ghost font-poppins px-3 py-1 text-sm">
            Fechar
          </button>
        </div>

        <div className="font-work-sans space-y-6 text-sm">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-full border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-1 font-poppins text-xs font-medium text-(--text-secondary)">
                Rating: {selectedFeedback.rating}
              </span>
              <span className="text-(--text-tertiary)">
                Criado: {formatDateTime(selectedFeedback.created_at)}
              </span>
              {selectedFeedback.updated_at && (
                <span className="text-(--text-tertiary)">
                  Atualizado: {formatDateTime(selectedFeedback.updated_at)}
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap leading-relaxed text-(--text-primary)">
              {selectedFeedback.message}
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
            <h3 className="text-sm font-montserrat font-medium text-(--text-secondary)">Ponto de Coleta</h3>
            {selectedFeedback.collection_points ? (
              <div className="grid grid-cols-1 gap-2 text-(--text-tertiary) md:grid-cols-3">
                <div>
                  <span className="text-(--text-secondary)">Canal:</span>{' '}
                  {channelDisplayName}
                </div>
                <div>
                  <span className="text-(--text-secondary)">Tipo:</span>{' '}
                  {selectedFeedback.collection_points.type}
                </div>
                <div>
                  <span className="text-(--text-secondary)">Identificador:</span>{' '}
                  {selectedFeedback.collection_points.identifier || '—'}
                </div>
                <div>
                  <span className="text-(--text-secondary)">Categoria:</span>{' '}
                  {itemKindLabel}
                </div>
                <div className="md:col-span-2">
                  <span className="text-(--text-secondary)">Item:</span>{' '}
                  {itemName || '—'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-(--text-tertiary)">
                Nenhuma informação de ponto de coleta.
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
            <h3 className="text-sm font-montserrat font-medium text-(--text-secondary)">Perguntas Dinâmicas</h3>
            {questionAnswers.length > 0 ? (
              <div className="space-y-2">
                {questionAnswers.slice(0, 3).map((answer, index) => (
                  <div
                    key={`${selectedFeedback.id}-question-answer-${answer.question_id}`}
                    className="rounded-lg border border-(--quaternary-color)/10 bg-(--bg-secondary) px-3 py-2"
                  >
                    <p className="text-xs text-(--text-tertiary)">
                      {index + 1}. {answer.question_text_snapshot}
                    </p>
                    <p className="mt-1 text-sm font-medium text-(--text-primary)">
                      {ANSWER_LABEL[answer.answer_value] ?? answer.answer_value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-(--text-tertiary)">
                Este feedback não possui respostas das perguntas dinâmicas.
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
            <h3 className="text-sm font-montserrat font-medium text-(--text-secondary)">Dispositivo</h3>
            {selectedFeedback.tracked_devices ? (
              <div className="grid grid-cols-1 gap-2 text-(--text-tertiary) md:grid-cols-2">
                <div>
                  <span className="text-(--text-secondary)">Fingerprint:</span>{' '}
                  {selectedFeedback.tracked_devices.device_fingerprint || '—'}
                </div>
                <div>
                  <span className="text-(--text-secondary)">Feedbacks:</span>{' '}
                  {selectedFeedback.tracked_devices.feedback_count ?? 0}
                </div>
                <div>
                  <span className="text-(--text-secondary)">IP:</span>{' '}
                  {selectedFeedback.tracked_devices.ip_address || '—'}
                </div>
                <div>
                  <span className="text-(--text-secondary)">Blocked:</span>{' '}
                  {selectedFeedback.tracked_devices.is_blocked ? 'Sim' : 'Não'}
                </div>
                <div className="md:col-span-2">
                  <span className="text-(--text-secondary)">User Agent:</span>{' '}
                  {selectedFeedback.tracked_devices.user_agent || '—'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-(--text-tertiary)">
                Nenhuma informação de dispositivo.
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
            <h3 className="text-sm font-montserrat font-medium text-(--text-secondary)">Cliente</h3>
            {selectedFeedback.tracked_devices?.customer ? (
              <div className="grid grid-cols-1 gap-2 text-(--text-tertiary) md:grid-cols-2">
                <div>
                  <span className="text-(--text-secondary)">Nome:</span>{' '}
                  {selectedFeedback.tracked_devices.customer.name || '—'}
                </div>
                <div>
                  <span className="text-(--text-secondary)">Email:</span>{' '}
                  {selectedFeedback.tracked_devices.customer.email || '—'}
                </div>
                <div>
                  <span className="text-(--text-secondary)">Gênero:</span>{' '}
                  {selectedFeedback.tracked_devices.customer.gender || '—'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-(--text-tertiary)">
                Nenhuma informação de cliente foi cadastrada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
