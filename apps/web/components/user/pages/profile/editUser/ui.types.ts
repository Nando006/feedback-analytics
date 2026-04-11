import type { ReactNode } from 'react';

/**
 * Props do bloco de informações básicas do perfil.
 * Usado em: components/user/pages/profile/editUser/information.tsx.
 */
export type InformationProps = {
  defaultFullName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
};

/**
 * Props do campo editável genérico.
 * Usado em: components/user/pages/profile/editUser/EditableFieldFixed.tsx.
 */
export type EditableFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  icon?: ReactNode;
  schema: unknown;
  intent: string;
  description?: string;
  hint?: string;
  successMessage?: string;
  errorMessage?: string;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  className?: string;
};

/**
 * Props do campo editável simples.
 * Usado em: components/user/pages/profile/editUser/SimpleEditableField.tsx.
 */
export type SimpleEditableFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  icon?: ReactNode;
  intent: string;
  description?: string;
  hint?: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
};

/**
 * Props do campo editável de telefone.
 * Usado em: components/user/pages/profile/editUser/PhoneEditableField.tsx.
 */
export type PhoneEditableFieldProps = {
  currentPhone: string;
  className?: string;
};

/**
 * Tipo para dados de formulário genérico.
 * Usado em componentes de campos editáveis.
 */
export type FormFieldData = Record<string, string>;