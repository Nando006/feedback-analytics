import type { QrCatalogQuestion } from 'src/services/serviceCollectionPoints';

/**
 * Payload de retorno da action de ativação/desativação de QR por item.
 * Usado em: pages/user/edit/editCatalogItem.tsx.
 */
export interface QrCatalogActionResponse {
  ok?: boolean;
  active?: boolean;
  catalog_item_id?: string;
  collection_point_id?: string;
  questions?: QrCatalogQuestion[];
  questionsSaved?: boolean;
  error?: string;
}
