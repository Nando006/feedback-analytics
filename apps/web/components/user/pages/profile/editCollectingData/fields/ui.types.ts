import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type { CompanyFeedbackQuestionInput } from 'lib/interfaces/entities/enterprise.entity';

/**
 * Props do campo de principais produtos/serviços.
 * Usado em: components/user/pages/profile/editCollectingData/fields/fieldMainProducts.tsx.
 */
export interface FieldMainProductsProps {
  value: string;
  onChange: (value: string) => void;
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
