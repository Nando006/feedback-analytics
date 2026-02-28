import { ServiceGetEnterprisePublic } from 'src/services/serviceEnterprise';

export type PublicQrCodeEnterpriseLoadData = {
  enterpriseId: string | null;
  collectionPointId: string | null;
  enterpriseName: string;
  error: string;
};

export async function loadPublicQrCodeEnterpriseData(
  requestUrl: string,
): Promise<PublicQrCodeEnterpriseLoadData> {
  const url = new URL(requestUrl);
  const enterpriseId = url.searchParams.get('enterprise');
  const collectionPointId = url.searchParams.get('collection_point');

  if (!enterpriseId) {
    return {
      enterpriseId: null,
      collectionPointId: null,
      enterpriseName: '',
      error: 'ID da empresa não encontrado na URL. Verifique o QR Code.',
    };
  }

  try {
    const enterprise = await ServiceGetEnterprisePublic(enterpriseId);

    return {
      enterpriseId,
      collectionPointId,
      enterpriseName: enterprise.name || 'Empresa',
      error: '',
    };
  } catch (err) {
    console.error('Erro ao validar empresa:', err);

    return {
      enterpriseId: null,
      collectionPointId: null,
      enterpriseName: '',
      error: 'Empresa não encontrada. Verifique se o QR Code é válido.',
    };
  }
}
