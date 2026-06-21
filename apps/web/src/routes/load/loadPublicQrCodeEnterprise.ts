import { ServiceGetEnterprisePublic } from 'src/services/serviceEnterprise';
import type { FeedbackQuestionPublic } from 'lib/interfaces/contracts/qrcode/question.contract';

export type PublicQrCodeEnterpriseLoadData = {
  enterpriseId: string | null;
  collectionPointId: string | null;
  catalogItemId: string | null;
  enterpriseName: string;
  itemName: string | null;
  itemKind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' | null;
  questions: FeedbackQuestionPublic[];
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
      questions: [],
      error: 'ID da empresa não encontrado na URL. Verifique o QR Code.',
    };
  }

  try {
    const enterprise = await ServiceGetEnterprisePublic(enterpriseId, {
      collectionPointId,
      catalogItemId,
    });

    // O envio exige um collection_point QR ativo (resolvido pelo servidor). Sem
    // ele, o submit retornaria 404. Não renderiza um formulário que nunca poderia
    // ser enviado — mostra erro amigável (igual ao QR inválido), em vez de deixar
    // o usuário preencher tudo para falhar no envio.
    const resolvedCollectionPointId = enterprise.collection_point_id ?? null;

    if (!resolvedCollectionPointId) {
      return {
        enterpriseId: null,
        collectionPointId: null,
        catalogItemId: null,
        enterpriseName: '',
        itemName: null,
        itemKind: null,
        questions: [],
        error:
          'QR Code indisponível: não há ponto de coleta ativo para este código. Verifique o QR Code ou contate a empresa.',
      };
    }

    return {
      enterpriseId,
      collectionPointId: resolvedCollectionPointId,
      catalogItemId: enterprise.catalog_item_id ?? catalogItemId,
      enterpriseName: enterprise.name || 'Empresa',
      itemName: enterprise.item_name ?? null,
      itemKind: enterprise.item_kind ?? null,
      questions: enterprise.questions ?? [],
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
      questions: [],
      error: 'Empresa não encontrada. Verifique se o QR Code é válido.',
    };
  }
}
