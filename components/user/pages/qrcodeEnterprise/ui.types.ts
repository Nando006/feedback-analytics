export interface SectionQrHeaderProps {
  enterpriseName?: string | null;
  qrActive: boolean;
  qrLoading: boolean;
  qrError: string | null;
  onToggleQr: () => void;
}

export interface SectionQrCodeDisplayProps {
  enterpriseName?: string | null;
  qrCodeUrl: string;
  feedbackUrl: string;
  showCopied: boolean;
  onDownload: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}
