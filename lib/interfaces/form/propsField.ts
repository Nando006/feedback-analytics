import type { ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface PropsField {
  id: string;
  name: string;
  label: string;
  icon?: ReactNode;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  register?: UseFormRegisterReturn;
  error?: string;
  value?: RegisterDocumentType;
}

export type RegisterDocumentType = 'CPF' | 'CNPJ';
export interface PropsRegisterFieldDocument extends PropsField {
  docType: RegisterDocumentType;
}
