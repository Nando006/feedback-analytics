import type { ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

/**
 * Props base compartilhadas pelos campos de formulário público.
 * Usado em: components/public/forms/fields/fieldsRegister/* e fieldsLogin/*.
 */
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

/**
 * Tipos de documento aceitos no cadastro público.
 * Usado em: components/public/forms/fields/fieldsRegister/fieldDocument.tsx.
 */
export type TypeRegisterDocument = 'CPF' | 'CNPJ';

/**
 * Props específicas do campo de documento no cadastro.
 * Usado em: components/public/forms/fields/fieldsRegister/fieldDocument.tsx.
 */
export interface RegisterFieldDocumentProps extends FieldFormProps {
  docType: TypeRegisterDocument;
}

/**
 * Props do campo de e-mail do formulário de QR Code.
 * Usado em: components/public/forms/fields/fieldsQRCode/fieldCustomerEmail.tsx.
 */
export interface FieldCustomerEmailProps {
  email: string;
  onEmailChange: (email: string) => void;
}
