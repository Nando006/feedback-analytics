import type { ReactNode } from 'react';

export interface CardProps {
  icon?: ReactNode;
  title: string;
  text: string;
  children: ReactNode;
  linkRegister?: string;
  linkLogin?: string;
}
