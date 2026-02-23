import type { RegisterFieldDocumentProps } from '../ui.types';
import { useEffect, useState } from 'react';

function digitsOnly(value: string) {
  return (value || '').replace(/\D+/g, '');
}
function formatCPF(v: string) {
  const s = digitsOnly(v).slice(0, 11);
  return s
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}
function formatCNPJ(v: string) {
  const s = digitsOnly(v).slice(0, 14);
  return s
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export default function FieldDocument({
  id,
  name,
  label,
  docType,
  register,
  error,
}: RegisterFieldDocumentProps) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay('');
  }, [docType]);

  return (
    <div className="space-y-1 relative">
      <label
        htmlFor={name}
        className="flex items-center gap-2 pl-2 text-sm text-(--text-secondary) font-work-sans">
        <span>{label}</span>
      </label>
      <input
        id={id}
        name={name}
        inputMode="numeric"
        aria-invalid={error ? true : undefined}
        className="h-12 w-full rounded-lg bg-(--container-secondary) border border-(--container-border) px-4 outline-none focus:border-(--primary-color) transition-colors font-poppins"
        {...register}
        value={display}
        onChange={(e) => {
          const raw = digitsOnly(e.target.value);
          const formatted =
            docType === 'CNPJ' ? formatCNPJ(raw) : formatCPF(raw);
          setDisplay(formatted);
          register?.onChange?.({ target: { name, value: raw } });
        }}
      />
      {error && (
        <span
          role="alert"
          className="font-work-sans absolute -right-1 -bottom-5 text-(--negative)/70 text-sm font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
