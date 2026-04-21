import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  InsightScopeOption,
  InsightsCatalogItemOption,
} from 'components/user/pages/feedbacksInsightsReport/ui.types';

export interface InsightsControlsContextValue {
  scope: InsightScopeOption;
  setScope: (scope: InsightScopeOption) => void;
  catalogItemId: string;
  setCatalogItemId: (id: string) => void;
  catalogItemOptions: InsightsCatalogItemOption[];
  setCatalogItemOptions: (opts: InsightsCatalogItemOption[]) => void;
  availableScopes: InsightScopeOption[];
  setAvailableScopes: (scopes: InsightScopeOption[]) => void;
  canAnalyze: boolean;
  setCanAnalyze: (can: boolean) => void;
  analyzeRaw: () => void;
  regenerateInsights: () => void;
  isAnalyzingRaw: boolean;
  isRegeneratingInsights: boolean;
}

const InsightsControlsContext = createContext<InsightsControlsContextValue | null>(null);

export function InsightsControlsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: InsightsControlsContextValue;
}) {
  return (
    <InsightsControlsContext.Provider value={value}>
      {children}
    </InsightsControlsContext.Provider>
  );
}

export function useInsightsControls() {
  const ctx = useContext(InsightsControlsContext);
  if (!ctx) throw new Error('useInsightsControls must be used inside InsightsControlsProvider');
  return ctx;
}

export function useInsightsControlsState() {
  const [scope, setScope] = useState<InsightScopeOption>('COMPANY');
  const [catalogItemId, setCatalogItemId] = useState('');
  const [catalogItemOptions, setCatalogItemOptions] = useState<InsightsCatalogItemOption[]>([]);
  const [availableScopes, setAvailableScopes] = useState<InsightScopeOption[]>(['COMPANY', 'PRODUCT', 'SERVICE', 'DEPARTMENT']);
  const [canAnalyze, setCanAnalyze] = useState(false);

  return {
    scope, setScope,
    catalogItemId, setCatalogItemId,
    catalogItemOptions, setCatalogItemOptions,
    availableScopes, setAvailableScopes,
    canAnalyze, setCanAnalyze,
  };
}
