import type { ReactNode } from 'react';

export interface SettingsPageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit';
    form?: string;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
  };
}
