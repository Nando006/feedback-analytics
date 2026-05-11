import type { ReactNode } from 'react';

interface SettingsPageHeaderProps {
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

export default function SettingsPageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
}: SettingsPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="font-montserrat text-2xl font-bold tracking-tight text-(--text-primary) lg:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-(--text-secondary) lg:text-base">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all hover:bg-(--quaternary-color)/10 disabled:opacity-50"
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </button>
        )}

        {primaryAction && (
          <button
            type={primaryAction.type || 'button'}
            onClick={primaryAction.onClick}
            form={primaryAction.form}
            disabled={primaryAction.disabled || primaryAction.loading}
            className={`btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-lg shadow-(--primary-color)/20 transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none`}
          >
            {primaryAction.loading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              primaryAction.icon
            )}
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
