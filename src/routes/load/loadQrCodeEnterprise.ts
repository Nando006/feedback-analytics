import { ServiceGetQrStatus } from 'src/services/serviceCollectionPoints';

export type QrCodeEnterpriseLoadData = {
  qrActive: boolean;
  qrError: string | null;
};

export async function loadQrCodeEnterpriseData(): Promise<QrCodeEnterpriseLoadData> {
  try {
    const status = await ServiceGetQrStatus();

    return {
      qrActive: status.active,
      qrError: null,
    };
  } catch (err) {
    console.error('Erro ao consultar status do QR:', err);

    return {
      qrActive: false,
      qrError: 'Não foi possível carregar o status do QR.',
    };
  }
}
