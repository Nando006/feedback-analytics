import { useInsightsControls } from 'src/lib/context/insightsControls';
import InsightsHeaderControls from './InsightsHeaderControls';
import type { InsightScopeOption } from './ui.types';

/**
 * Versão conectada do seletor de escopo: lê o contexto e renderiza o seletor de
 * escopo (+ item). As ações de IA (Analisar/Gerar) vivem no InsightsActionsPanel.
 */
export default function InsightsControlsBar() {
  const {
    scope,
    setScope,
    catalogItemId,
    setCatalogItemId,
    catalogItemOptions,
    availableScopes,
  } = useInsightsControls();

  const handleScopeChange = (next: InsightScopeOption) => {
    setScope(next);
    if (next === 'COMPANY') {
      setCatalogItemId('');
      return;
    }
    const first = catalogItemOptions.find((item) => item.kind === next);
    setCatalogItemId(first?.id ?? '');
  };

  return (
    <InsightsHeaderControls
      availableScopes={availableScopes}
      selectedScope={scope}
      selectedCatalogItemId={catalogItemId}
      catalogItemOptions={catalogItemOptions}
      onScopeChange={handleScopeChange}
      onCatalogItemChange={setCatalogItemId}
    />
  );
}
