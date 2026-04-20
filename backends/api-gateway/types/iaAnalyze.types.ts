import type {
  IaAnalyzeFeedbackInput,
} from '../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type {
  IaAnalyzeScopeType,
} from '../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

export type IaAnalyzeExecutionMode = 'local' | 'remote';

export type AnalysisBatch = {
  scopeType: IaAnalyzeScopeType;
  catalogItemId: string | null;
  catalogItemName: string | null;
  feedbacks: IaAnalyzeFeedbackInput[];
};
