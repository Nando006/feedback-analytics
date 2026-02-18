import type { IconType } from 'react-icons';

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
 * Props do cartão de perfil com ação de logout.
 * Usado em: components/user/shared/cards/cardProfile.tsx.
 */
export type CardProfileProps = {
  fullName?: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
};