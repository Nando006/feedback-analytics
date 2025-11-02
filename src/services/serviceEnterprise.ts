import type { PropsApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise';
import type { PropsEnterprisePublicResponse } from 'lib/interfaces/public/propsEnterprise';
import type {
  PropsCollectingDataEnterprise,
  TypeUpdateCollectingDataPayload,
} from 'lib/interfaces/entities/enterprise';
import { getJson, patchJson } from './http';

export function ServiceGetEnterprise() {
  return getJson<PropsApiEnterpriseResponse>('/api/protected/user/enterprise');
}

export function ServiceGetEnterprisePublic(enterpriseId: string) {
  return getJson<PropsEnterprisePublicResponse>(
    `/api/public/enterprise/${enterpriseId}`,
  );
}

export async function ServiceGetCollectingDataEnterprise(): Promise<PropsCollectingDataEnterprise | null> {
  try {
    const { collecting } = await getJson<{
      collecting: PropsCollectingDataEnterprise;
    }>('/api/protected/user/collecting_data');
    return collecting ?? null;
  } catch (error) {
    const status = (error as { status?: number } | undefined)?.status;
    if (status === 400 || status === 404) return null;
    throw error;
  }
}

export async function ServiceUpdateCollectingDataEnterprise(
  payload: TypeUpdateCollectingDataPayload,
): Promise<PropsCollectingDataEnterprise> {
  const { collecting } = await patchJson<{
    collecting: PropsCollectingDataEnterprise;
  }>('/api/protected/user/collecting_data', payload);
  return collecting;
}

