import type { InsightsReportHeaderSectionProps } from './ui.types';

export default function InsightsReportHeaderSection({
  updatedLabel,
  refreshing,
  availableScopes,
  selectedScope,
  selectedCatalogItemId,
  catalogItemOptions,
  onScopeChange,
  onCatalogItemChange,
  onRefreshSelected,
}: InsightsReportHeaderSectionProps) {
  const scopeLabels: Record<
    'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT',
    string
  > = {
    COMPANY: 'Empresa (visão geral)',
    PRODUCT: 'Produto',
    SERVICE: 'Serviço',
    DEPARTMENT: 'Departamento',
  };

  const itemSelectionEnabled = selectedScope !== 'COMPANY';

  const filteredCatalogItems = catalogItemOptions.filter(
    (item) => item.kind === selectedScope,
  );

  const missingRequiredItem =
    itemSelectionEnabled &&
    (selectedCatalogItemId.trim().length === 0 || filteredCatalogItems.length === 0);

  const buttonLabel =
    selectedScope === 'COMPANY' ? 'Atualizar' : 'Analisar item selecionado';

  return (
    <div className="font-work-sans mb-4 flex flex-col md:flex-row items-start justify-between gap-4">
      <div>
        <h2 className="mb-1 text-lg font-montserrat font-semibold text-[var(--text-primary)]">
          Relatório de Insights da IA
        </h2>
        <p className="max-w-2xl text-sm text-[var(--text-tertiary)]">
          Resumo estratégico gerado automaticamente a partir dos feedbacks,
          sentimentos e categorias identificadas pela IA, com foco em
          oportunidades de melhoria e pontos fortes da experiência do cliente.
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
          <select
            value={selectedScope}
            onChange={(event) =>
              onScopeChange(
                event.target.value as
                  | 'COMPANY'
                  | 'PRODUCT'
                  | 'SERVICE'
                  | 'DEPARTMENT',
              )
            }
            className="min-w-[220px] rounded-lg border border-(--quaternary-color)/20 bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
          >
            {availableScopes.map((scope) => (
              <option key={scope} value={scope}>
                {scopeLabels[scope]}
              </option>
            ))}
          </select>

          {itemSelectionEnabled && (
            <select
              value={selectedCatalogItemId}
              onChange={(event) => onCatalogItemChange(event.target.value)}
              className="min-w-[220px] rounded-lg border border-(--quaternary-color)/20 bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary)"
            >
              <option value="">Selecione um item</option>
              {filteredCatalogItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}

          {itemSelectionEnabled && filteredCatalogItems.length === 0 && (
            <p className="text-xs text-(--text-tertiary)">
              Nenhum item disponível neste escopo. Cadastre itens para analisar.
            </p>
          )}
        </div>

        {updatedLabel && (
          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
            Última atualização: {updatedLabel}
          </span>
        )}

        <button
          type="button"
          onClick={onRefreshSelected}
          disabled={refreshing || missingRequiredItem}
          className="btn-primary font-poppins px-4 py-2 text-sm disabled:opacity-60"
        >
          {refreshing ? 'Atualizando...' : buttonLabel}
        </button>
      </div>
    </div>
  );
}
