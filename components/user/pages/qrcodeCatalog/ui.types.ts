import type { QrCodeCatalogLoadData } from 'src/routes/load/loadQrCodeCatalog';

/**
 * Props da página de QR Code por catálogo.
 * Usado em: components/user/pages/qrcodeCatalog/QrCodeCatalogPage.tsx.
 */
export interface QrCodeCatalogPageProps {
  title: string;
  subtitle: string;
  data: QrCodeCatalogLoadData;
}

/**
 * Payload de retorno da action de ativação/desativação de QR por item.
 * Usado em: components/user/pages/qrcodeCatalog/QrCodeCatalogPage.tsx.
 */
export interface QrCatalogActionResponse {
  ok?: boolean;
  active?: boolean;
  catalog_item_id?: string;
  collection_point_id?: string;
  error?: string;
}

/**
 * Props do preview visual do QR Code.
 * Usado em: components/user/pages/qrcodeCatalog/QrCodeCatalogPage.tsx.
 */
export interface QrPreviewImageProps {
  src: string;
  alt: string;
}

/**
 * Props do card de item do catálogo com QR.
 * Usado em: components/user/pages/qrcodeCatalog/QrCodeCatalogPage.tsx.
 */
export interface QrCatalogItemCardProps {
  item: QrCodeCatalogLoadData['items'][number];
  enterpriseId: string;
  isPending: boolean;
  onToggle: (catalogItemId: string, isActive: boolean) => void;
}
