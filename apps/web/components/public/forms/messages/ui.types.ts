import type { Dispatch, ReactNode, SetStateAction } from 'react';

export type RegisterEmailPendingNoticeProps = {
  email?: string;
};

export type ToastVariant = 'success' | 'error' | 'warning';

export type ToastInput = {
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export type ToastItem = {
  id: number;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
};

export type ToastProps = Omit<ToastItem, 'id'> & {
  onClose?: () => void;

};

export type ToastProviderProps = {
  children: ReactNode;
};

export type ToastDispatch = Dispatch<SetStateAction<ToastItem[]>>;
