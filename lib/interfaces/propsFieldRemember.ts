import type { UseFormRegisterReturn } from 'react-hook-form';

export interface PropsFieldRemember {
  id: string;
  name: string;
  label: string;
  register?: UseFormRegisterReturn;
}
