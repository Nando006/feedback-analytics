import type { ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface FieldFormProps {
  id: string;
  name: string;
  label?: string;
  icon?: ReactNode;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  register?: UseFormRegisterReturn;
  error?: string;
  value?: TypeRegisterDocument;
}

export type TypeRegisterDocument = 'CPF' | 'CNPJ';

export interface RegisterFieldDocumentProps extends FieldFormProps {
  docType: TypeRegisterDocument;
}

export interface FieldCustomerEmailProps {
  email: string;
  onEmailChange: (email: string) => void;
}
