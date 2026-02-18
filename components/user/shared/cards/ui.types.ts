import type { IconType } from 'react-icons';

export type MetricCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon: IconType;
};

export type CardProfileProps = {
  fullName?: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
};