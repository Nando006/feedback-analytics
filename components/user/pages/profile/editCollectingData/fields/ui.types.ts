import type { ChangeEvent } from 'react';

export interface FieldMainProductsProps {
  value: string;
  onChange: (value: string) => void;
}

export interface FieldUsesCompanyProductsProps {
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface FieldBusinessSummaryProps {
  value: string;
  onChange: (value: string) => void;
}

export interface FieldAnalyticsGoalProps {
  value: string;
  onChange: (value: string) => void;
}

export interface FieldCompanyObjectiveProps {
  value: string;
  onChange: (value: string) => void;
}
