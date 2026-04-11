import {
  analyzeFeedbacksForEnterprise,
  type SupabaseServerClient,
  type IaStudioOptions,
} from './iaStudioService.js';
import type { IaStudioRunResponse } from '../../../../lib/interfaces/contracts/ia-studio.contract.js';

export type RunIaStudioAnalysisParams = {
  supabase: SupabaseServerClient;
  userId: string;
  options?: IaStudioOptions;
};

export async function runIaStudioAnalysis(
  params: RunIaStudioAnalysisParams,
): Promise<IaStudioRunResponse> {
  return analyzeFeedbacksForEnterprise({
    supabase: params.supabase,
    userId: params.userId,
    options: params.options
  });
}