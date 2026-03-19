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
    }: ToastInput) => {
      const id = ++toastId;
      const toast: ToastItem = {
        id,
        message,
        description,
        variant,
        duration,
      };

      toastDispatch?.((prev) => [...prev, toast]);
    },
    [],
  );

  const success = useCallback(
    (message: string, description?: string) => {
      show({ message, description, variant: 'success' });
    },
    [show],
  );

  const error = useCallback(
    (message: string, description?: string) => {
      show({ message, description, variant: 'error' });
    },
    [show],
  );

  const warning = useCallback(
    (message: string, description?: string) => {
      show({ message, description, variant: 'warning' });
    },
    [show],
  );

  return useMemo(
    () => ({ success, error, warning }),
    [success, error, warning],
  );
}
