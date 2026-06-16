import { loadQrCodeEnterpriseData } from 'src/routes/load/loadQrCodeEnterprise';

/**
 * Loader da tela "Feedback geral" (escopo empresa).
 * Carrega o status do QR Code geral; as perguntas vêm de `collecting` (loader 'user').
 */
export async function LoaderFeedbackGeneral() {
  return loadQrCodeEnterpriseData();
}
