import type { IconType } from 'react-icons';
import type { ReactNode } from 'react';

/**
 * Props do cartão de métrica com ícone.
 * Usado em: components/user/shared/cards/MetricCard.tsx.
 */
export type MetricCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon: IconType;
};

/**
 * Props do cartão simples reutilizável.
 * Usado em: components/user/shared/cards/cardSimple.tsx.
 */
export type CardSimpleProps = {
  children: ReactNode;
  type?: 'header' | 'default' | 'accordion';
  title?: string;
  description?: string;
  defaultOpen?: boolean;
};

/**
 * Props do cartão de perfil com ação de logout.
 * Usado em: components/user/shared/cards/cardProfile.tsx.
 */
export type CardProfileProps = {
  fullName?: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
};