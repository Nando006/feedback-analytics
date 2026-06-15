import { useInsightsControls } from 'src/lib/context/insightsControls';
import InsightsHeaderControls from './InsightsHeaderControls';
import type { InsightScopeOption, InsightsControlsBarProps } from './ui.types';

/**
 * Versão conectada dos controles de Insights: lê o contexto e renderiza o
 * seletor de escopo (+ item) e, opcionalmente, os botões de análise.
 *
 * Vive DENTRO das telas que dependem de escopo (Insights e Dashboard), em vez
 * de no header global — onde apareciam mesmo em telas sem relação com insights.
 */
export default function InsightsControlsBar({ showActions = true }: InsightsControlsBarProps) {
  const {
    scope,
    setScope,
    catalogItemId,
    setCatalogItemId,
    catalogItemOptions,
    availableScopes,
    canAnalyze,
    analyzeRaw,
    regenerateInsights,
    isAnalyzingRaw,
    isRegeneratingInsights,
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
      showActions={showActions}
      refreshing={isRegeneratingInsights}
      analyzingRaw={isAnalyzingRaw}
      canAnalyze={canAnalyze}
      availableScopes={availableScopes}
      selectedScope={scope}
      selectedCatalogItemId={catalogItemId}
      catalogItemOptions={catalogItemOptions}
      onScopeChange={handleScopeChange}
      onCatalogItemChange={setCatalogItemId}
      onRefreshSelected={regenerateInsights}
      onAnalyzeRaw={analyzeRaw}
    />
  );
}
