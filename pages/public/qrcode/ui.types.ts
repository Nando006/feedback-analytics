/**
 * Resultado da action de envio de feedback por QR Code.
 * Usado em: pages/public/qrcode/enterprise.tsx.
 */
export type QrcodeEnterpriseActionData = {
  ok?: boolean;
  alreadySubmitted?: boolean;
  error?: string;
};