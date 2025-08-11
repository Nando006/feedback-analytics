import type { ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface PropsFieldPassword {
  id: string;
  name: string;
  label: string;
  icon?: ReactNode;
  register?: UseFormRegisterReturn;
  error?: string;
}
