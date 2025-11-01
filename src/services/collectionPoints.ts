import { getJson, postJson } from './http';

export type QrStatusResponse = { active: boolean; id: string | null };
export type QrEnableResponse = { id: string; active: true };
export type QrDisableResponse = { active: false };

export function getQrStatus() {
  return getJson<QrStatusResponse>('/api/protected/user/collection-points/qr/status');
}

export function enableQr() {
  return postJson<QrEnableResponse>('/api/protected/user/collection-points/qr/enable', {});
}

export function disableQr() {
  return postJson<QrDisableResponse>('/api/protected/user/collection-points/qr/disable', {});
}
