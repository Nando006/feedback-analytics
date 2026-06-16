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

/**
 * Seletor de escopo (+ item de catálogo) do header. As ações de IA
 * (Analisar feedbacks / Gerar insights) ficam no InsightsActionsPanel.
 */
export default function InsightsHeaderControls({
  availableScopes,
  selectedScope,
  selectedCatalogItemId,
  catalogItemOptions,
  onScopeChange,
  onCatalogItemChange,
}: InsightsHeaderControlsProps) {
  const itemSelectionEnabled = selectedScope !== 'COMPANY';
  const filteredCatalogItems = catalogItemOptions.filter(
    (item) => item.kind === selectedScope,
  );

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
    </div>
  );
}
