import type { FeedbackCardProps } from './ui.types';

export default function FeedbackCard({ feedback, onClick }: FeedbackCardProps) {
  const catalogItem = Array.isArray(feedback.collection_points?.catalog_items)
    ? (feedback.collection_points?.catalog_items[0] ?? null)
    : (feedback.collection_points?.catalog_items ?? null);

  const resolvedItemKind =
    feedback.collection_points?.catalog_item_kind ?? catalogItem?.kind ?? null;

  const normalizedItemKind = String(resolvedItemKind ?? '').toUpperCase();

  const resolvedItemName =
    feedback.collection_points?.catalog_item_name ?? catalogItem?.name ?? null;

  // Função para renderizar estrelas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-neutral-500'
        }`}>
        ★
      </span>
    ));
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para obter cor do rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-400 bg-green-900/30 border-green-800';
    if (rating >= 3)
      return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    return 'text-red-400 bg-red-900/30 border-red-800';
  };

  // Função para obter texto do rating
  const getRatingText = (rating: number) => {
    const texts = {
      1: 'Muito Ruim',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Excelente',
    };
    return texts[rating as keyof typeof texts] || 'N/A';
  };

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
    feedback.collection_points?.type === 'QR_CODE'
      ? (feedback.collection_points?.name || '').replace(/^QR Code\s*-\s*.+$/, 'QR Code')
      : (feedback.collection_points?.name || 'N/A');

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 glass-card ${
        onClick
          ? 'cursor-pointer hover:border-neutral-700 transition-colors'
          : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}>
      {/* Header com rating e data */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getRatingColor(
              feedback.rating,
            )}`}>
            {feedback.rating} - {getRatingText(feedback.rating)}
          </div>
          <div className="flex items-center gap-1">
            {renderStars(feedback.rating)}
          </div>
        </div>
        <div className="text-sm text-[var(--text-tertiary)]">
          {formatDate(feedback.created_at)}
        </div>
      </div>

      {/* Mensagem do feedback */}
      <div className="mb-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          {feedback.message}
        </p>
      </div>

      {/* Informações adicionais */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-4 text-[var(--text-tertiary)]">
          <span>
            <strong className="text-[var(--text-secondary)]">Canal:</strong>{' '}
            {channelDisplayName}
          </span>
          {/* <span>
            <strong className="text-[var(--text-secondary)]">Tipo:</strong>{' '}
            {feedback.collection_points?.type || 'N/A'}
          </span> */}
          <span>
            <strong className="text-[var(--text-secondary)]">Categoria:</strong>{' '}
            {itemKindLabel}
          </span>
          <span>
            <strong className="text-[var(--text-secondary)]">Item:</strong>{' '}
            {itemName || '—'}
          </span>
        </div>

        {feedback.tracked_devices?.customer && (
          <div className="text-right">
            <div className="font-medium text-[var(--text-primary)]">
              {feedback.tracked_devices.customer.name || 'Cliente anônimo'}
            </div>
            {feedback.tracked_devices.customer.email && (
              <div className="text-[var(--text-tertiary)] text-xs">
                {feedback.tracked_devices.customer.email}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
