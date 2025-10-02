import type { ReactNode } from 'react';

// Card Carrossel
export interface ICarrousselCard {
  title: string;
  description: string;
}

// Card Premiun
export interface IBackgroundElementsProps {
  variant?: 'default' | 'minimal' | 'intense';
  className?: string;
}
export interface IPremiumCardProps {
  children?: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  backgroundVariant?: 'default' | 'minimal' | 'intense';
  containerMaxWidth?: string;
  className?: string;
}
