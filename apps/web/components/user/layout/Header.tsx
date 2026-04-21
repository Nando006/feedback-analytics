import type { HeaderProps } from './ui.types';
import { FaBars, FaLayerGroup } from 'react-icons/fa6';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import InsightsHeaderControls from 'components/user/pages/feedbacksInsightsReport/InsightsHeaderControls';
import type { InsightScopeOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';

export default function Header({
  isOverlayMode,
  isSidebarOpen,
  onToggleSidebar,
  onSetOverlay,
  onSetPush,
}: HeaderProps) {
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
    <div className="flex h-full items-center gap-8 px-4">
      <div className="space-x-2">
        <button
          type="button"
          aria-label={isSidebarOpen ? 'Fechar' : 'Abrir'}
          title={isSidebarOpen ? 'Fechar' : 'Abrir'}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-primary) transition-colors hover:border-(--quaternary-color)/22 hover:bg-(--bg-tertiary)"
          onClick={onToggleSidebar}>
          <FaBars className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={isOverlayMode ? 'Sobrepondo' : 'Empurra'}
          title={isOverlayMode ? 'Sobrepondo' : 'Empurra'}
          className={`inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-md border transition-colors ${
            isOverlayMode
              ? 'border-(--primary-color)/40 bg-(--primary-color)/14 text-(--text-primary)'
              : 'border-(--quaternary-color)/12 bg-(--bg-secondary) text-(--text-secondary) hover:border-(--quaternary-color)/20 hover:bg-(--seventh-color) hover:text-(--text-primary)'
          }`}
          onClick={() => (isOverlayMode ? onSetPush() : onSetOverlay())}>
          <FaLayerGroup className="h-4 w-4" />
        </button>
      </div>

      <div className="ml-auto">
        <InsightsHeaderControls
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
      </div>
    </div>
  );
}
