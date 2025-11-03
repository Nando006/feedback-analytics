import type { ReactNode } from 'react';

export interface PropsCard {
  icon?: ReactNode;
  title: string;
  text: string;
  children: ReactNode;
  linkRegister?: string;
  linkLogin?: string;
}
