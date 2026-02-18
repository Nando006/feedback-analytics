/**
 * Resposta da action de ativação/desativação do QR Code.
 * Usado em: pages/user/qrcodes/qrcodeEnterprise.tsx.
 */
export type QrCodeEnterpriseActionResponse = {
  ok?: boolean;
  active?: boolean;
  error?: string;
};
