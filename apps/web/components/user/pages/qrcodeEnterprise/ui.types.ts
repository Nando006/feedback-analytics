/**
 * Props do cabeçalho da área de QR Code da empresa.
 * Usado em: components/user/pages/qrcodeEnterprise/SectionQrHeader.tsx.
 */
export interface SectionQrHeaderProps {
  enterpriseName?: string | null;
  qrActive: boolean;
  qrLoading: boolean;
  qrError: string | null;
  onToggleQr: () => void;
  /** Título do cartão (padrão: "QR Code para Feedback"). */
  title?: string;
  /** Rótulo do sujeito (padrão: "Empresa:"); use "Item:" em escopo de catálogo. */
  subjectLabel?: string;
}

/**
 * Props da seção de exibição do QR Code e ações de compartilhamento.
 * Usado em: components/user/pages/qrcodeEnterprise/SectionQrCodeDisplay.tsx.
 */
export interface SectionQrCodeDisplayProps {
  enterpriseName?: string | null;
  qrActive: boolean;
  qrCodeUrl: string;
  feedbackUrl: string;
  showCopied: boolean;
  onDownload: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}
