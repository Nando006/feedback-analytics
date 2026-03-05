import type { ApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise.entity';
import type { EnterpriseContractResponse } from 'lib/interfaces/contracts/enterprise.contract';
import type {
  CollectingDataEnterprise,
  UpdateCollectingDataPayload,
} from 'lib/interfaces/entities/enterprise.entity';
import { getJson, patchJson } from '../../lib/utils/http';

export function ServiceGetEnterprise() {
  return getJson<ApiEnterpriseResponse>('/api/protected/user/enterprise');
}

export function ServiceGetEnterprisePublic(
  enterpriseId: string,
  params?: {
    collectionPointId?: string | null;
    catalogItemId?: string | null;
  },
) {
  const search = new URLSearchParams();

  if (params?.collectionPointId) {
    search.set('collection_point', params.collectionPointId);
  }

  if (params?.catalogItemId) {
    search.set('catalog_item', params.catalogItemId);
  }

  const suffix = search.toString();
  return getJson<EnterpriseContractResponse>(
    `/api/public/enterprise/${enterpriseId}${suffix ? `?${suffix}` : ''}`,
  );
}

export async function ServiceGetCollectingDataEnterprise(): Promise<CollectingDataEnterprise | null> {
  try {
    const { collecting } = await getJson<{
      collecting: CollectingDataEnterprise;
    }>('/api/protected/user/collecting_data');
    return collecting ?? null;
  } catch (error) {
    const status = (error as { status?: number } | undefined)?.status;
    if (status === 400 || status === 404) return null;
    throw error;
  }
}

export async function ServiceUpdateCollectingDataEnterprise(
  payload: UpdateCollectingDataPayload,
): Promise<CollectingDataEnterprise> {
  const { collecting } = await patchJson<{
    collecting: CollectingDataEnterprise;
  }>('/api/protected/user/collecting_data', payload);
  return collecting;
}

