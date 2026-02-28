import { ServiceGetEnterprisePublic } from 'src/services/serviceEnterprise';

export type PublicQrCodeEnterpriseLoadData = {
  enterpriseId: string | null;
  collectionPointId: string | null;
  catalogItemId: string | null;
  enterpriseName: string;
  itemName: string | null;
  itemKind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' | null;
  error: string;
};

export async function loadPublicQrCodeEnterpriseData(
  requestUrl: string,
): Promise<PublicQrCodeEnterpriseLoadData> {
  const url = new URL(requestUrl);
  const enterpriseId = url.searchParams.get('enterprise');
  const collectionPointId = url.searchParams.get('collection_point');
  const catalogItemId =
    url.searchParams.get('item') ?? url.searchParams.get('catalog_item');

  if (!enterpriseId) {
    return {
      enterpriseId: null,
      collectionPointId: null,
      catalogItemId: null,
      enterpriseName: '',
      itemName: null,
      itemKind: null,
      error: 'ID da empresa não encontrado na URL. Verifique o QR Code.',
    };
  }

  try {
    const enterprise = await ServiceGetEnterprisePublic(enterpriseId, {
      collectionPointId,
      catalogItemId,
    });

    return {
      enterpriseId,
      collectionPointId: enterprise.collection_point_id ?? collectionPointId,
      catalogItemId: enterprise.catalog_item_id ?? catalogItemId,
      enterpriseName: enterprise.name || 'Empresa',
      itemName: enterprise.item_name ?? null,
      itemKind: enterprise.item_kind ?? null,
      error: '',
    };
  } catch (err) {
    console.error('Erro ao validar empresa:', err);

    return {
      enterpriseId: null,
      collectionPointId: null,
      catalogItemId: null,
      enterpriseName: '',
      itemName: null,
      itemKind: null,
      error: 'Empresa não encontrada. Verifique se o QR Code é válido.',
    };
  }
}
