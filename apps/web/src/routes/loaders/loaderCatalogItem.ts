import type { LoaderFunctionArgs } from "react-router-dom";
import { loadQrCodeCatalogData } from "src/routes/load/loadQrCodeCatalog";
import { getCatalogKindBySlug } from "src/lib/constants/catalog";

/**
 * Loader da tela de configuração de um item do catálogo.
 * Resolve o tipo a partir do segmento :kind da URL e devolve o status de QR
 * (+ perguntas) de todos os itens daquele tipo; a página filtra pelo :itemId.
 */
export async function LoaderCatalogItem({ params }: LoaderFunctionArgs) {
  const config = getCatalogKindBySlug(params.kind);

  if (!config) {
    return { kind: "PRODUCT" as const, items: [], error: "Tipo de catálogo inválido." };
  }

  return loadQrCodeCatalogData(config.kind);
}
