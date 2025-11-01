import type { ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface PropsFieldForm {
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
export interface PropsRegisterFieldDocument extends PropsFieldForm {
  docType: TypeRegisterDocument;
}

export interface PropsFieldCustomerEmail {
  email: string;
  onEmailChange: (email: string) => void;
}


