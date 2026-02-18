import type { ChangeEvent } from 'react';

/**
 * Props do campo de principais produtos/serviços.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldMainProducts.tsx.
 */
export interface FieldMainProductsProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Props do campo de confirmação de uso dos próprios produtos.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldUsesCompanyProducts.tsx.
 */
export interface FieldUsesCompanyProductsProps {
  checked: boolean;
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
