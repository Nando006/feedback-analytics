import type { PropsRegisterFieldDocument } from 'lib/interfaces/public/form/propsField';
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
}: PropsRegisterFieldDocument) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay('');
  }, [docType]);

  return (
    <div className="space-y-1 relative">
      <label
        htmlFor={name}
        className="flex items-center gap-2 pl-2 text-sm text-neutral-300">
        <span>{label}</span>
      </label>
      <input
        id={id}
        name={name}
        inputMode="numeric"
        aria-invalid={error ? true : undefined}
        className="h-12 w-full rounded-lg bg-neutral-800/60 border border-neutral-700/60 px-4 outline-none focus:border-purple-600 transition-colors"
        {...register}
        value={display}
        onChange={(e) => {
          const raw = digitsOnly(e.target.value);
          const formatted =
            docType === 'CNPJ' ? formatCNPJ(raw) : formatCPF(raw);
          setDisplay(formatted);
          register?.onChange?.({ target: { name, value: raw } } as any);
        }}
      />
      {error && (
        <span
          role="alert"
          className="absolute -right-1 -bottom-5 text-red-400/70 text-sm font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
