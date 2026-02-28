import type { ChangeEvent } from 'react';
import type { CatalogItemInput } from 'lib/interfaces/entities/enterprise.entity';

/**
 * Props do campo de principais produtos/serviços.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldMainProducts.tsx.
 */
export interface FieldMainProductsProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Props do campo dinâmico de itens de catálogo por categoria.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldCatalogItems.tsx.
 */
export interface FieldCatalogItemsProps {
  title: string;
  description: string;
  emptyLabel: string;
  items: CatalogItemInput[];
  onChange: (items: CatalogItemInput[]) => void;
}

/**
 * Props do bloco de capacidades da empresa (produtos, serviços e áreas/departamentos).
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldUsesCompanyProducts.tsx.
 */
export interface FieldUsesCompanyProductsProps {
  usesCompanyProducts: boolean;
  usesCompanyServices: boolean;
  usesCompanyDepartments: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Props do campo de resumo do negócio.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldBusinessSummary.tsx.
 */
export interface FieldBusinessSummaryProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Props do campo de objetivo analítico.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldAnalyticsGoal.tsx.
 */
export interface FieldAnalyticsGoalProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Props do campo de objetivo da empresa.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldCompanyObjective.tsx.
 */
export interface FieldCompanyObjectiveProps {
  value: string;
  onChange: (value: string) => void;
}
