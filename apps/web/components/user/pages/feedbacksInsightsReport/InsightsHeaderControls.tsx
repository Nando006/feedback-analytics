import { ScopeSelectorDropdown } from './ScopeSelectorDropdown';
import { CatalogItemSelectorDropdown } from './CatalogItemSelectorDropdown';
import type { InsightsHeaderControlsProps } from './ui.types';

/**
 * Seletor de escopo (+ item de catálogo) do header com estilo premium (Shadcn UI).
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
    <div className="flex items-center gap-2">
      <ScopeSelectorDropdown
        options={availableScopes}
        selected={selectedScope}
        onChange={onScopeChange}
      />

      {itemSelectionEnabled && filteredCatalogItems.length > 0 && (
        <CatalogItemSelectorDropdown
          selectedId={selectedCatalogItemId}
          options={filteredCatalogItems}
          onChange={onCatalogItemChange}
          placeholder="Selecionar item..."
        />
      )}
    </div>
  );
}
