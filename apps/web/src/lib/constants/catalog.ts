/**
 * Configuração central do catálogo (produtos / serviços / departamentos).
 *
 * Fonte única que liga o "slug" da URL (products/services/departments) ao
 * tipo do backend (PRODUCT/SERVICE/DEPARTMENT), à chave em CollectingDataEnterprise,
 * ao intent de salvamento em lote e aos rótulos de tela. Usado pelas telas de
 * listagem e pela tela de configuração por item.
 */
import type {
  CatalogItemKind,
  CollectingDataEnterprise,
} from "lib/interfaces/entities/enterprise.entity";
import {
  INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG,
} from "src/lib/constants/routes/intents";

export type CatalogKindSlug = "products" | "services" | "departments";

type CatalogItemsKey = Extract<
  keyof CollectingDataEnterprise,
  "catalog_products" | "catalog_services" | "catalog_departments"
>;

export interface CatalogKindConfig {
  slug: CatalogKindSlug;
  kind: CatalogItemKind;
  itemsKey: CatalogItemsKey;
  saveIntent: string;
  listPath: string;
  /** Rótulo singular minúsculo, ex.: "produto". */
  singular: string;
  /** Rótulo plural, ex.: "Produtos". */
  plural: string;
  listTitle: string;
  listDescription: string;
  emptyLabel: string;
  /** Rótulo do item na trilha (breadcrumb) do catálogo, ex.: "Produtos". */
  crumbLabel: string;
}

export const CATALOG_KINDS: Record<CatalogKindSlug, CatalogKindConfig> = {
  products: {
    slug: "products",
    kind: "PRODUCT",
    itemsKey: "catalog_products",
    saveIntent: INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG,
    listPath: "/user/edit/feedback-products",
    singular: "produto",
    plural: "Produtos",
    listTitle: "Catálogo de Produtos",
    listDescription:
      "Cadastre os produtos e abra cada um para configurar perguntas e QR Code.",
    emptyLabel: "Nenhum produto cadastrado ainda.",
    crumbLabel: "Produtos",
  },
  services: {
    slug: "services",
    kind: "SERVICE",
    itemsKey: "catalog_services",
    saveIntent: INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG,
    listPath: "/user/edit/feedback-services",
    singular: "serviço",
    plural: "Serviços",
    listTitle: "Catálogo de Serviços",
    listDescription:
      "Cadastre os serviços e abra cada um para configurar perguntas e QR Code.",
    emptyLabel: "Nenhum serviço cadastrado ainda.",
    crumbLabel: "Serviços",
  },
  departments: {
    slug: "departments",
    kind: "DEPARTMENT",
    itemsKey: "catalog_departments",
    saveIntent: INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG,
    listPath: "/user/edit/feedback-departments",
    singular: "departamento",
    plural: "Departamentos",
    listTitle: "Catálogo de Departamentos",
    listDescription:
      "Cadastre os departamentos e abra cada um para configurar perguntas e QR Code.",
    emptyLabel: "Nenhum departamento cadastrado ainda.",
    crumbLabel: "Departamentos",
  },
};

export function getCatalogKindBySlug(
  slug: string | undefined,
): CatalogKindConfig | null {
  if (!slug) return null;
  return CATALOG_KINDS[slug as CatalogKindSlug] ?? null;
}

export function getCatalogKindByKind(
  kind: CatalogItemKind | undefined,
): CatalogKindConfig | null {
  if (!kind) return null;
  return (
    Object.values(CATALOG_KINDS).find((config) => config.kind === kind) ?? null
  );
}
