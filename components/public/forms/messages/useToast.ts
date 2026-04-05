import { useCallback, useMemo } from 'react';
import type { ToastDispatch, ToastInput, ToastItem } from './ui.types';

let toastDispatch: ToastDispatch | null = null;
let toastId = 0;

export function bindToastDispatch(dispatch: ToastDispatch) {
  toastDispatch = dispatch;

  return () => {
    if (toastDispatch === dispatch) toastDispatch = null;
  };
}

export function useToast() {
  const show = useCallback(
    ({
      message,
      description,
      variant = 'success',
      duration = 3000,
      actionLabel,
      onAction
    }: ToastInput) => {
      const id = ++toastId;
      const toast: ToastItem = {
        id,
        message,
        description,
        variant,
        duration,
        actionLabel,
        onAction
      };

      toastDispatch?.((prev) => [...prev, toast]);
    },
    [],
  );

  const success = useCallback(
    (message: string, description?: string, options?: {
      actionLabel?: string;
      onAction?: () => void
    }) => {
      show({ message, description, variant: 'success', ...options });
    },
    [show],
  );

  const error = useCallback(
    (message: string, description?: string, options?: { 
      actionLabel?: string; 
      onAction?: () => void 
    }) => {
      show({ message, description, variant: 'error', ...options });
    },
    [show],
  );

  const warning = useCallback(
    (message: string, description?: string, options?: {
      actionLabel?: string;
      onAction?: () => void
    }) => {
      show({ message, description, variant: 'warning', ...options });
    },
    [show],
  );

  return useMemo(
    () => ({ success, error, warning }),
    [success, error, warning],
  );
}
