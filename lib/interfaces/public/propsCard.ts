import type { ReactNode } from 'react';

export interface PropsCardForm {
  icon?: ReactNode;
  title: string;
  text: string;
  form: ReactNode;
  linkRegister?: string;
  linkLogin?: string;
}
