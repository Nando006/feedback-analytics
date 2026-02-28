import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadPublicQrCodeEnterpriseData } from './loadPublicQrCodeEnterprise';
import { ServiceGetEnterprisePublic } from 'src/services/serviceEnterprise';

vi.mock('src/services/serviceEnterprise', () => ({
  ServiceGetEnterprisePublic: vi.fn(),
}));

const mockServiceGetEnterprisePublic = vi.mocked(ServiceGetEnterprisePublic);

describe('loadPublicQrCodeEnterpriseData', () => {
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  beforeEach(() => {
    mockServiceGetEnterprisePublic.mockReset();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('retorna erro quando enterprise não é informado na URL', async () => {
    const result = await loadPublicQrCodeEnterpriseData(
      'http://localhost/feedback/qrcode',
    );

    expect(result).toEqual({
      enterpriseId: null,
      collectionPointId: null,
      catalogItemId: null,
      enterpriseName: '',
      itemName: null,
      itemKind: null,
      error: 'ID da empresa não encontrado na URL. Verifique o QR Code.',
    });

    expect(mockServiceGetEnterprisePublic).not.toHaveBeenCalled();
  });

  it('carrega contexto de item/categoria quando QR é de catálogo', async () => {
    mockServiceGetEnterprisePublic.mockResolvedValue({
      id: 'enterprise-1',
      name: 'Empresa X',
      collection_point_id: 'cp-1',
      catalog_item_id: 'item-1',
      item_name: 'Produto X',
      item_kind: 'PRODUCT',
    });

    const result = await loadPublicQrCodeEnterpriseData(
      'http://localhost/feedback/qrcode?enterprise=enterprise-1&collection_point=cp-1&item=item-1',
    );

    expect(mockServiceGetEnterprisePublic).toHaveBeenCalledWith('enterprise-1', {
      collectionPointId: 'cp-1',
      catalogItemId: 'item-1',
    });

    expect(result).toEqual({
      enterpriseId: 'enterprise-1',
      collectionPointId: 'cp-1',
      catalogItemId: 'item-1',
      enterpriseName: 'Empresa X',
      itemName: 'Produto X',
      itemKind: 'PRODUCT',
      error: '',
    });
  });

  it('retorna fallback amigável quando validação pública falha', async () => {
    mockServiceGetEnterprisePublic.mockRejectedValue(new Error('not found'));

    const result = await loadPublicQrCodeEnterpriseData(
      'http://localhost/feedback/qrcode?enterprise=enterprise-1&collection_point=cp-1',
    );

    expect(result).toEqual({
      enterpriseId: null,
      collectionPointId: null,
      catalogItemId: null,
      enterpriseName: '',
      itemName: null,
      itemKind: null,
      error: 'Empresa não encontrada. Verifique se o QR Code é válido.',
    });
  });
});
