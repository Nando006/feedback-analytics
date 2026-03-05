import { getJson, postJson } from '../../lib/utils/http';

export type QrStatusResponse = { active: boolean; id: string | null };
export type QrEnableResponse = { id: string; active: true };
export type QrDisableResponse = { active: false };
export type CatalogQrKind = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

export type QrCatalogItemStatus = {
  catalog_item_id: string;
  name: string;
  description: string | null;
  kind: CatalogQrKind;
  active: boolean;
  collection_point_id: string | null;
};

export type QrCatalogStatusResponse = {
  items: QrCatalogItemStatus[];
};

export type QrCatalogToggleResponse = {
  catalog_item_id: string;
  collection_point_id?: string;
  active: boolean;
};

export function ServiceGetQrStatus() {
  return getJson<QrStatusResponse>('/api/protected/user/collection-points/qr/status');
}

export function ServiceEnableQr() {
  return postJson<QrEnableResponse>('/api/protected/user/collection-points/qr/enable', {});
}

export function ServiceDisableQr() {
  return postJson<QrDisableResponse>('/api/protected/user/collection-points/qr/disable', {});
}

export function ServiceGetQrCatalogStatus(kind: CatalogQrKind) {
  return getJson<QrCatalogStatusResponse>(
    `/api/protected/user/collection-points/qr/catalog?kind=${kind}`,
  );
}

export function ServiceEnableQrByCatalogItem(catalog_item_id: string) {
  return postJson<QrCatalogToggleResponse>(
    '/api/protected/user/collection-points/qr/catalog/enable',
    { catalog_item_id },
  );
}

export function ServiceDisableQrByCatalogItem(catalog_item_id: string) {
  return postJson<QrCatalogToggleResponse>(
    '/api/protected/user/collection-points/qr/catalog/disable',
    { catalog_item_id },
  );
}
