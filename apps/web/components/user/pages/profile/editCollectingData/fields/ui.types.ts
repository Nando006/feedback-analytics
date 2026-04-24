import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type {
  CatalogItemInput,
  CompanyFeedbackQuestionInput,
} from 'lib/interfaces/entities/enterprise.entity';
import type { QrCodeCatalogLoadItem } from 'src/routes/load/loadQrCodeCatalog';
import type { QrCatalogQuestionInput } from 'src/services/serviceCollectionPoints';

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
  onChange: Dispatch<SetStateAction<CatalogItemInput[]>>;
  qrItems?: QrCodeCatalogLoadItem[];
  savingQuestionsItemId?: string | null;
  onSaveQuestions?: (catalogItemId: string, questions: QrCatalogQuestionInput[]) => void;
  togglePendingItemId?: string | null;
  onToggle?: (catalogItemId: string, isActive: boolean) => void;
}

/**
 * Props da linha individual de item do catálogo.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldCatalogItems.tsx.
 */
export interface CatalogItemRowProps {
  index: number;
  item: CatalogItemInput;
  onRemove: (index: number) => void;
  onChangeField: (
    index: number,
    field: 'name' | 'description',
    value: string,
  ) => void;
  qrItem?: QrCodeCatalogLoadItem;
  isSavingQuestions?: boolean;
  onSaveQuestions?: (catalogItemId: string, questions: QrCatalogQuestionInput[]) => void;
  isPendingToggle?: boolean;
  onToggle?: (catalogItemId: string, isActive: boolean) => void;
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
 * Props do bloco de perguntas padrão de feedback da empresa.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldCompanyFeedbackQuestions.tsx.
 */
export interface FieldCompanyFeedbackQuestionsProps {
  questions: CompanyFeedbackQuestionInput[];
  onChange: Dispatch<SetStateAction<CompanyFeedbackQuestionInput[]>>;
}

export interface QuestionAccordionProps {
  qrItem: QrCodeCatalogLoadItem;
  isSaving: boolean;
  onSave: (catalogItemId: string, questions: QrCatalogQuestionInput[]) => void;
}

export interface QrSectionProps {
  qrItem: QrCodeCatalogLoadItem;
  isPending: boolean;
  onToggle: (catalogItemId: string, isActive: boolean) => void;
}

/**
 * Props do campo de resumo do negócio.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldBusinessSummary.tsx.
 */
export interface FieldBusinessSummaryProps {
  defaultValue: string;
}

/**
 * Props do campo de objetivo analítico.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldAnalyticsGoal.tsx.
 */
export interface FieldAnalyticsGoalProps {
  defaultValue: string;
}

/**
 * Props do campo de objetivo da empresa.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldCompanyObjective.tsx.
 */
export interface FieldCompanyObjectiveProps {
  defaultValue: string;
}
