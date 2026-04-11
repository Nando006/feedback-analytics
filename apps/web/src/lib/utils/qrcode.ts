export type QrCodeFormat = 'png' | 'svg';

export type QrCodeOptions = {
  size?: number;
  format?: QrCodeFormat;
};

export const getQrCodeUrl = (
  data: string,
  options: QrCodeOptions = {},
): string => {
  const size = options.size ?? 200;
  const format = options.format ?? 'png';
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=${format}&data=${encoded}`;
};
