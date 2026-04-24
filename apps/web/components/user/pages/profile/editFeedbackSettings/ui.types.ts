import type { QrCodeCatalogLoadData } from 'src/routes/load/loadQrCodeCatalog';

export type FeedbackTab = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

export type CatalogType = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

export interface FormFeedbackCatalogProps {
  catalogType: CatalogType;
  qrData?: QrCodeCatalogLoadData;
}
