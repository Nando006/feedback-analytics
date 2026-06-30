import type {
  InsightScopeOption,
  InsightsCatalogItemOption,
} from 'components/user/pages/feedbacksInsightsReport/ui.types';

import type { DatePreset } from '../utils/dateRange';

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

  // Date selection state
  datePreset: DatePreset;
  startDate?: string;
  endDate?: string;
  customStart?: string;
  customEnd?: string;
  setDateRange: (preset: DatePreset, customStart?: string, customEnd?: string) => void;

  // Comparison state
  comparisonEnabled: boolean;
  setComparisonEnabled: (enabled: boolean) => void;
  comparisonReferenceType: 'previous_period' | 'previous_year' | 'custom';
  setComparisonReferenceType: (type: 'previous_period' | 'previous_year' | 'custom') => void;
  customReferenceStart?: string;
  customReferenceEnd?: string;
  setCustomReferenceRange: (start?: string, end?: string) => void;
}

export interface InsightsControlsInitialData {
  availableScopes: InsightScopeOption[];
  catalogItemOptions: InsightsCatalogItemOption[];
  canAnalyze: boolean;
}
