import type {
  PropsCollectingDataEnterprise,
  TypeUpdateCollectingDataPayload,
} from 'lib/interfaces/entities/enterprise';
import { getJson } from './http';

export async function getCollectingDataEnterprise(): Promise<PropsCollectingDataEnterprise | null> {
  try {
    const { collecting } = await getJson<{
      collecting: PropsCollectingDataEnterprise;
    }>('/api/protected/user/collecting_data');
    return collecting ?? null;
  } catch (error: any) {
    const status = (error as any)?.status;
    if (status === 400 || status === 404) return null;
    throw error;
  }
}

export async function updateCollectingDataEnterprise(
  payload: TypeUpdateCollectingDataPayload,
): Promise<PropsCollectingDataEnterprise> {
  const res = await fetch('/api/protected/user/collecting_data', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Request failed');
  const json = (await res.json()) as {
    collecting: PropsCollectingDataEnterprise;
  };
  return json.collecting;
}
