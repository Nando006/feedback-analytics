import { FaChevronDown } from 'react-icons/fa6';
import { ScopeSelectorRadial } from './ScopeSelectorRadial';
import type { InsightsHeaderControlsProps } from './ui.types';

function HeaderSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 appearance-none cursor-pointer rounded-md border border-(--quaternary-color)/18 bg-(--bg-secondary) pl-3 pr-7 text-xs text-(--text-primary) transition-colors hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color) focus:outline-none focus:ring-1 focus:ring-(--primary-color)/40"
      >
        {children}
      </select>
      <FaChevronDown className="pointer-events-none absolute right-2 h-2.5 w-2.5 text-(--text-tertiary)" />
    </div>
  );
}

export default function InsightsHeaderControls({
  refreshing,
  analyzingRaw,
  canAnalyze,
  availableScopes,
  selectedScope,
  selectedCatalogItemId,
  catalogItemOptions,
  onScopeChange,
  onCatalogItemChange,
  onRefreshSelected,
  onAnalyzeRaw,
}: InsightsHeaderControlsProps) {
  const itemSelectionEnabled = selectedScope !== 'COMPANY';
  const filteredCatalogItems = catalogItemOptions.filter((item) => item.kind === selectedScope);
  const missingRequiredItem =
    itemSelectionEnabled &&
    (selectedCatalogItemId.trim().length === 0 || filteredCatalogItems.length === 0);

  const isProcessing = refreshing || analyzingRaw;
  const analysisDisabled = isProcessing || missingRequiredItem || !canAnalyze;

  return (
    <div className="flex items-center gap-3">
      <ScopeSelectorRadial
        options={availableScopes}
        selected={selectedScope}
        onChange={onScopeChange}
      />

      {itemSelectionEnabled && filteredCatalogItems.length > 0 && (
        <HeaderSelect value={selectedCatalogItemId} onChange={onCatalogItemChange}>
          <option value="">Selecione</option>
          {filteredCatalogItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </HeaderSelect>
      )}

      <button
        type="button"
        onClick={onAnalyzeRaw}
        disabled={analysisDisabled}
        className="btn-secondary font-poppins h-8 px-3 text-xs disabled:opacity-60"
      >
        {analyzingRaw ? 'Analisando...' : 'Analisar feedbacks'}
      </button>

      <button
        type="button"
        onClick={onRefreshSelected}
        disabled={analysisDisabled}
        className="btn-secondary font-poppins h-8 px-3 text-xs disabled:opacity-60"
      >
        {refreshing ? 'Gerando...' : 'Gerar insights'}
      </button>
    </div>
  );
}
