import type { ReactNode } from 'react';

/**
 * Props do card público base usado nas telas não autenticadas.
 * Usado em: components/public/shared/card.tsx.
 */
export interface CardProps {
  icon?: ReactNode;
  title: string;
  text: string;
  children: ReactNode;
  linkRegister?: string;
  linkLogin?: string;
}
