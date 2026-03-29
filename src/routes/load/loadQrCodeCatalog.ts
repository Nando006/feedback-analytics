import {
  ServiceGetQrCatalogStatus,
  type CatalogQrKind,
  type QrCatalogQuestion,
} from 'src/services/serviceCollectionPoints';

export type QrCodeCatalogLoadItem = {
  catalog_item_id: string;
  name: string;
  description: string | null;
  kind: CatalogQrKind;
  active: boolean;
  collection_point_id: string | null;
  questions: QrCatalogQuestion[];
};

export type QrCodeCatalogLoadData = {
  kind: CatalogQrKind;
  items: QrCodeCatalogLoadItem[];
  error: string | null;
};

export async function loadQrCodeCatalogData(
  kind: CatalogQrKind,
): Promise<QrCodeCatalogLoadData> {
  try {
    const status = await ServiceGetQrCatalogStatus(kind);

    return {
      kind,
      items: status.items,
      error: null,
    };
  } catch (error) {
    console.error(`Erro ao consultar status dos QR Codes de ${kind}:`, error);

    return {
      kind,
      items: [],
      error: 'Não foi possível carregar os itens de QR Code.',
    };
  }
}
