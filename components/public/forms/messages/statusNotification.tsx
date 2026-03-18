import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

const VARIANTS = {
  success: {
    border: 'border-l-(--positive)',
    icon: (
      <svg className="w-4 h-4 text-(--positive) shrink-0" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    border: 'border-l-(--negative)',
    icon: (
      <svg className="w-4 h-4 text-(--negative) shrink-0" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    border: 'border-l-(--neutral)',
    icon: (
      <svg className="w-4 h-4 text-(--neutral) shrink-0" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
};

type ToastVariant = keyof typeof VARIANTS;

type ToastInput = {
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = {
  id: number;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
};

type ToastProps = Omit<ToastItem, 'id'> & {
  onClose?: () => void;
};

type ToastProviderProps = {
  children: ReactNode;
};

export function Toast({
  message,
  description,
  variant = 'success',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Ref estável — não entra nas deps do useEffect
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - 100 / (duration / 100);
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 100);

    const timer = setTimeout(() => {
      setVisible(false);
      onCloseRef.current?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration]); // onClose fora das deps — timer independente por toast

  if (!visible) return null;

  const { border, icon } = VARIANTS[variant];

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80 rounded-lg bg-(--seventh-color)
        border border-(--quaternary-color)/14 border-l-4 ${border}
        px-4 py-3 shadow-md
        animate-in slide-in-from-top-2 fade-in duration-300
      `}
    >
      <div className="mt-0.5">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-(--text-primary)">{message}</p>
        {description && (
          <p className="text-xs text-(--text-secondary) mt-0.5">{description}</p>
        )}
      </div>

      <button
        onClick={() => { setVisible(false); onCloseRef.current?.(); }}
        className="text-(--text-tertiary) hover:text-(--text-primary) transition-colors shrink-0"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div
        className="absolute bottom-0 left-0 h-0.5 bg-(--quaternary-color)/28 rounded-bl-lg transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}


// --- Hook ---

let _setToasts: Dispatch<SetStateAction<ToastItem[]>> | null = null;

export function useToast() {
  const show = useCallback(({ message, description, variant = 'success', duration = 3000 }: ToastInput) => {
    const id = Date.now();
    _setToasts?.((prev) => [...prev, { id, message, description, variant, duration }]);
  }, []);

  const success = useCallback((message: string, description?: string) => {
    show({ message, description, variant: 'success' });
  }, [show]);

  const error = useCallback((message: string, description?: string) => {
    show({ message, description, variant: 'error' });
  }, [show]);

  const warning = useCallback((message: string, description?: string) => {
    show({ message, description, variant: 'warning' });
  }, [show]);

  return useMemo(() => ({ success, error, warning }), [success, error, warning]);
}


// --- Provider ---

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _setToasts = setToasts;
    return () => {
      if (_setToasts === setToasts) _setToasts = null;
    };
  }, [setToasts]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </>
  );
}